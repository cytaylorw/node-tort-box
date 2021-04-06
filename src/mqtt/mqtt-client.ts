
import { EventEmitter } from 'events';

import {
  connect,
  Packet, MqttClient, QoS,
  IConnackPacket, ISubscriptionGrant, IClientPublishOptions,
  PacketCallback, OnMessageCallback
} from 'mqtt';

import {
  AlreadySubscribedError,
  ClientExistError,
  NoMessageCallbackError,
  SubscribeFailedError,
  TooManyRetriesError,
} from './errors';

import {
  MqttOptions,
  MqttTopicList,
 } from '../@types/mqtt-ts';



export class MqttTsClient extends EventEmitter{

  // private _connecting: boolean;
  private _client: MqttClient;
  private _retries: [number, number];
  // readonly TOPIC_TYPE = ['exact', 'wildcard'];
  opts: MqttOptions;
  subscribedTopics: MqttTopicList = {};


  constructor(opts: MqttOptions) {
    super();
    this.opts = opts;
    // this.subscribedTopics= { exact: {}, wildcard: {}};
    this._retries = [0, 0];
  }

  get connected(): boolean {
    return this._client.connected;
  }

  public connect(): Promise<IConnackPacket> {
    return new Promise((resolve, reject) => {

      if(this._client) {
        reject(new ClientExistError('MQTT client instance already exist.'));
        return;
      }

      const client: MqttClient = connect(this.opts);

      client.on('connect', (connack: IConnackPacket) => {
        this._client = client;
        resolve(connack);
      })

      client.on('message', this._onMessage.bind(this));

      client.on('reconnect', this._onReconnect.bind(this));

      client.on('error', (error: Error) => {
        // this._connecting = false;
        this._emitError(error);
        this._client?.end(true);
        reject(error);
      })
    })
  }

  public end(): Promise<void> {
    return new Promise((resolve) => {
      this._client.end(false, () => resolve())
    })
  }

  public subscribe(topic: string, qos: QoS, onMessageCallback: OnMessageCallback): Promise<void> {
    return new Promise((resolve, reject) => {

      if(this.subscribedTopics[topic]){
        // already subscribed
        const error = new AlreadySubscribedError(`${topic} topic already subscribed.`);
        this._emitError(error);
        reject(error);
        return;
      }

      this._client.subscribe(topic, {qos}, (error: Error, granted: ISubscriptionGrant[]) => {
        if(error){
          reject(error);
          return;
        }
        if(granted[0].qos > 2) {
          // subscribe failed
          const error = new SubscribeFailedError(`Failed to subscribe topic ${topic}`);
          this._emitError(error);
          reject(error);
          return;
        }

        this._addSubscribedTopic(topic, qos, onMessageCallback);
        resolve();
      })
    })
  }

  public unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {

      if(!this.subscribedTopics[topic]){
        // Not subscribed
        resolve();
        return;
      }

      this._client.unsubscribe(topic, (error: Error) => {
        if(error){
          this._emitError(error);
          reject(error);
        }else{
          delete this.subscribedTopics[topic];
          resolve();
        }
      })
    })
  }

  public publish(topic: string, message: string, opts?: IClientPublishOptions ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cb: PacketCallback = (error?: Error, packet?: Packet) => {
        if(error){
          this._emitError(error);
          reject(error);
        }else{
          resolve();
        }
      }

      if(opts){
        this._client.publish(topic, message, opts, cb);
      }else{
        this._client.publish(topic, message, cb);
      }
    })
  }

  private _emitError(error: string | Error): void {
    if(!this.listeners('error').length) throw error;
    if(typeof error === 'string') error = new Error(error);
    this.emit('error', error);
  }

  private _onReconnect(): void {
    const now: number = Date.now();
    if(now - this._retries[0] > (this.opts.keepalive ?? 60) * 1000){
      this._retries[0] = now;
      this._retries[1] = 1;
    }else{
      this._retries[1]++;
    }
    if(this._retries[1] > (this.opts.reconnectRetries ?? 4))
      this._emitError(new TooManyRetriesError(`Too many retries (${this._retries[1]}).`));
  }

  private _onMessage(topic: string, payload: Buffer, packet: Packet): void {
    const matched: boolean = Object.entries(this.subscribedTopics).some(([subscribedTopic, {regexString, onMessageCallback}]) => {
      if(subscribedTopic === topic){
        onMessageCallback(topic, payload, packet);
        return true;
      }
      if(regexString){
        const regex = new RegExp(regexString);
        if(regex.test(topic)) {
          onMessageCallback(topic, payload, packet);
          return true;
        }
      }
      return false;
    })

    if(matched) return;
    this._emitError(new NoMessageCallbackError(`No callback for topic: ${topic}`));
  }

  private _addSubscribedTopic(topic: string, qos: QoS, onMessageCallback: OnMessageCallback): void {
    if(topic.includes('#') || topic.includes('+')){
      const regexString = '^' + topic.replace('#','.*').split('/').join('/').split('+').join('[^/]*') + '$';
      this.subscribedTopics[topic] = {qos, onMessageCallback, regexString};
    }else{
      this.subscribedTopics[topic] = {qos, onMessageCallback};
    }
  }
}

export {
  MqttTsClient as MqttClient,
  MqttTsClient as Client
};