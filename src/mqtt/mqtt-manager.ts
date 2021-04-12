import { IClientPublishOptions, QoS } from "mqtt";
import {
  MqttConfig,
  MiddlewareCallback,
  MqttSubscription,
} from "../@types/mqtt-ts";
import { MqttTsClient } from "./mqtt-client";
import { mqttConfig } from "../configuration";
import { AlreadySubscribedError, ClientNotDefinedError } from "./errors";
import { middleware as defaultMiddleware} from './middleware'

export class MqttManager {
  private static _instance: MqttManager;

  config: MqttConfig;
  clients: { [name: string]: MqttTsClient } = {};
  subscriptions: MqttSubscription[] = [];

  private constructor(config?: MqttConfig) {
    this.config = config ? config : mqttConfig;
    this.config.names?.forEach((name) => {
      if (this.config[name]) {
        this.clients[name] = new MqttTsClient(this.config[name]);
      }
    });
  }

  public connect(name?: string): Promise<any[]> {
    const promises: Promise<any>[] = [];
    const clients = this._getClients(name);

    clients.forEach(([name, client]) => {
      promises.push(client.connect());
    });

    return Promise.all(promises);
  }

  public reconnect(name?: string): Promise<any[]> {
    const promises: Promise<any>[] = [];
    const clients = this._getClients(name);

    clients.forEach(([name, client]) => {
      promises.push(client.reconnect());
    });

    return Promise.all(promises);
  }

  public end(name?: string): Promise<any[]> {
    const promises: Promise<any>[] = [];
    const clients = this._getClients(name);

    clients.forEach(([name, client]) => {
      promises.push(client.end());
    });

    return Promise.all(promises);
  }

  public addMiddleware(middleware?: MiddlewareCallback, name?: string): void {
    const clients = this._getClients(name);

    clients.forEach(([name, client]) => {
      if(middleware){
        client.addMiddleware(middleware);
      }else{
        this.config[name].middleware.forEach((cbName: string) => {
          if(defaultMiddleware[cbName]) client.addMiddleware(defaultMiddleware[cbName]);
        })
      }
    });
  }

  public addSubscription(
    topic: string,
    qos: QoS,
    callback: MiddlewareCallback,
    name?: string
  ): void {
    if (name) {
      this.subscriptions.push({ name, topic, qos, callback });
    } else {
      this.config.names?.forEach((name) => {
        if (this.config[name]) {
          this.subscriptions.push({
            name,
            topic,
            qos,
            callback,
          });
        }
      });
    }
  }
  public publish(
    topic: string,
    message: string,
    opts?: IClientPublishOptions,
    name?: string
  ): void {
    if (name) {
      if(!this.clients[name]){
        throw new ClientNotDefinedError(name);
      }

      this.clients[name].publish(topic, message, opts);
    } else {
      this.config.names?.forEach((name) => {
        if (this.clients[name]) {
          this.clients[name].publish(topic, message, opts);
        }
      });
    }
  }

  public subscribeAll(): Promise<any[] | void> {
    const promises: Promise<any>[] = [];
    this.subscriptions.forEach(({ name, topic, qos, callback }) => {
      if(!this.clients[name]){
        throw new ClientNotDefinedError(name);
      }

      promises.push(this.clients[name].subscribe(topic, qos, callback));
    });

    return Promise.all(promises).catch((err) => {
      if (!(err instanceof AlreadySubscribedError)) {
        throw err;
      }
    });
  }

  public unsubscribeAll(): Promise<any[]> {
    const promises: Promise<any>[] = [];
    this.subscriptions.forEach(({ name, topic, qos, callback }) => {
      if(!this.clients[name]){
        throw new ClientNotDefinedError(name);
      }

      promises.push(this.clients[name].unsubscribe(topic));
    });

    return Promise.all(promises);
  }

  public static getInstance(config?: MqttConfig): MqttManager {
    if (this._instance) return this._instance;
    return new MqttManager(config);
  }

  private _getClients(name?: string):[string, MqttTsClient][] {
    if(name) {
      if(!this.clients[name]){
        throw new ClientNotDefinedError(name);
      }
      return [[name, this.clients[name]]];
    }else{
      return Object.entries(this.clients);
    }

  }
}
