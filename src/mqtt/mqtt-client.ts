import { EventEmitter } from "events";

import {
  connect,
  Packet,
  MqttClient,
  QoS,
  IConnackPacket,
  ISubscriptionGrant,
  IClientPublishOptions,
  PacketCallback,
  OnMessageCallback,
} from "mqtt";

import {
  AlreadySubscribedError,
  ClientExistError,
  NoMessageCallbackError,
  SubscribeFailedError,
  TooManyRetriesError,
} from "./errors";

import {
  MiddlewareCallback,
  MqttMessage,
  MqttOptions,
  MqttTopicInfo,
  MqttTopicList,
} from "../@types/mqtt-ts";

export class MqttTsClient extends EventEmitter {
  private _client: MqttClient;
  private _retries: { startTime: number; count: number };
  opts: MqttOptions;
  subscribedTopics: MqttTopicList = {};
  middleware: MiddlewareCallback[] = [];

  constructor(opts: MqttOptions) {
    super();

    this.opts = opts;
    this._retries = { startTime: 0, count: 0 };
  }

  get connected(): boolean {
    return this._client.connected;
  }

  public connect(): Promise<IConnackPacket> {
    return new Promise((resolve, reject) => {
      if (this._client) {
        reject(new ClientExistError("MQTT client instance already exist."));
        return;
      }

      const client: MqttClient = connect(this.opts);
      const self = this;

      client.on("connect", function onConnect(connack: IConnackPacket) {
        self._client = client;
        resolve(connack);
        self.removeListener("connect", onConnect);
      });

      client.on("message", this._onMessage.bind(this));

      client.on("reconnect", this._onReconnect.bind(this));

      client.on("error", (error: Error) => {
        self._emitError(error);
        self._client?.end(true);
        reject(error);
      });
    });
  }

  public reconnect() {
    return new Promise((resolve, reject) => {
      const self = this;

      if(self._client.connected) {
        resolve();
        return;
      }

      self._client.reconnect().on('connect', function onConnect(connack: IConnackPacket) {
        resolve(connack);
        self.removeListener("connect", onConnect);
      });
    })
  }

  public end(): Promise<void> {
    return new Promise((resolve) => {
      this._client.end(false, () => resolve());
    });
  }

  public isSubscribed(topic: string): boolean {
    return this.subscribedTopics[topic] !== undefined;
  }

  public subscribe(
    topic: string,
    qos: QoS,
    onMessageCallback: MiddlewareCallback
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSubscribed(topic)) {
        const error = new AlreadySubscribedError(
          `${topic} topic already subscribed.`
        );
        this._emitError(error);
        reject(error);
        return;
      }

      this._client.subscribe(
        topic,
        { qos },
        (error: Error, granted: ISubscriptionGrant[]) => {
          if (error) {
            reject(error);
            return;
          }
          if (granted[0].qos > 2) {
            // subscribe failed
            const error = new SubscribeFailedError(
              `Failed to subscribe topic ${topic}`
            );
            this._emitError(error);
            reject(error);
            return;
          }

          this._addSubscribedTopic(topic, qos, onMessageCallback);
          resolve();
        }
      );
    });
  }

  public unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSubscribed(topic)) {
        // Not subscribed
        resolve();
        return;
      }

      this._client.unsubscribe(topic, (error: Error) => {
        if (error) {
          this._emitError(error);
          reject(error);
        } else {
          delete this.subscribedTopics[topic];
          resolve();
        }
      });
    });
  }

  public publish(
    topic: string,
    message: string,
    opts?: IClientPublishOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {

      // callback - function (err), fired when the QoS handling completes,
      // or at the next tick if QoS 0.
      // An error occurs if client is disconnecting.
      const cb: PacketCallback = (error?: Error, packet?: Packet) => {
        if (error) {
          this._emitError(error);
          reject(error);
        } else {
          resolve();
        }
      };

      if (opts) {
        this._client.publish(topic, message, opts, cb);
      } else {
        this._client.publish(topic, message, cb);
      }
    });
  }

  public addMiddleware(middleware: MiddlewareCallback): void {
    this.middleware.push(middleware);
  }

  private _emitError(error: string | Error): void {
    if (!this.listeners("error").length) throw error;
    if (typeof error === "string") error = new Error(error);
    this.emit("error", error);
  }

  private _onReconnect(): void {
    const now: number = Date.now();

    if (now - this._retries.startTime > (this.opts.keepalive ?? 60) * 1000) {
      this._retries.startTime = now;
      this._retries.count = 1;
    } else {
      this._retries.count++;
    }
    if (this._retries.count > (this.opts.reconnectRetries ?? 4))
      this._emitError(
        new TooManyRetriesError(`Too many retries (${this._retries.count}).`)
      );
  }

  private _onMessage(topic: string, payload: Buffer, packet: Packet): void {
    const topicInfo = this._getTopicInfo(topic);

    if (topicInfo) {
      const message: MqttMessage = { topic, payload, packet, topicInfo };
      if (this.middleware) {
        for (const middleware of this.middleware) {
          middleware(message);
        }
      }
      topicInfo.onMessageCallback(message);
    } else {
      this._emitError(
        new NoMessageCallbackError(`No callback for topic: ${topic}`)
      );
    }
  }

  private _getTopicInfo(topic: string): MqttTopicInfo | null {
    let result: MqttTopicInfo | null = null;
    Object.entries(this.subscribedTopics).some(
      ([subscribedTopic, topicInfo]) => {
        if (subscribedTopic === topic) {
          result = topicInfo;
          return true;
        }
        if (topicInfo.regexString) {
          const regex = new RegExp(topicInfo.regexString);
          if (regex.test(topic)) {
            result = topicInfo;
            return true;
          }
        }
        return false;
      }
    );

    return result;
  }

  private _addSubscribedTopic(
    topic: string,
    qos: QoS,
    onMessageCallback: MiddlewareCallback
  ): void {
    if (topic.includes("#") || topic.includes("+")) {
      const regexString =
        "^" +
        topic.replace("#", ".*").split("+").join("[^/]*") +
        "$";
      this.subscribedTopics[topic] = {
        topic,
        qos,
        onMessageCallback,
        regexString,
      };
    } else {
      this.subscribedTopics[topic] = { topic, qos, onMessageCallback };
    }
  }
}

export { MqttTsClient as MqttClient, MqttTsClient as Client };
