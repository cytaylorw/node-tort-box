import { IClientPublishOptions, QoS } from "mqtt";
import {
  MqttConfig,
  MiddlewareCallback,
  MqttSubscription,
} from "../@types/mqtt-ts";
import { MqttTsClient } from "./mqtt-client";
import { mqttConfig } from "../configuration";
import { AlreadySubscribedError } from "./errors";

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

    clients.forEach((client) => {
      promises.push(client.connect());
    });

    return Promise.all(promises);
  }

  public reconnect(name?: string): Promise<any[]> {
    const promises: Promise<any>[] = [];
    const clients = this._getClients(name);

    clients.forEach((client) => {
      promises.push(client.reconnect());
    });

    return Promise.all(promises);
  }

  public end(name?: string): Promise<any[]> {
    const promises: Promise<any>[] = [];
    const clients = this._getClients(name);

    clients.forEach((client) => {
      promises.push(client.end());
    });

    return Promise.all(promises);
  }

  public addMiddleware(middleware: MiddlewareCallback, name?: string): void {
    const clients = this._getClients(name);

    clients.forEach((client) => {
      client.addMiddleware(middleware);
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
      this.clients[name].publish(topic, message, opts);
    } else {
      this.config.names?.forEach((name) => {
        if (this.config[name]) {
          this.clients[name].publish(topic, message, opts);
        }
      });
    }
  }

  public subscribeAll(): Promise<any[] | void> {
    const promises: Promise<any>[] = [];
    this.subscriptions.forEach(({ name, topic, qos, callback }) => {
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
      promises.push(this.clients[name].unsubscribe(topic));
    });

    return Promise.all(promises);
  }

  public static getInstance(config?: MqttConfig): MqttManager {
    if (this._instance) return this._instance;
    return new MqttManager(config);
  }

  private _getClients(name?: string): MqttTsClient[] {
    return name && this.clients[name]
      ? [this.clients[name]]
      : Object.values(this.clients);
  }
}
