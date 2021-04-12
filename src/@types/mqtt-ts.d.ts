import {
  QoS,
  IClientOptions,
  OnMessageCallback,
} from 'mqtt';

export interface MqttOptions extends IClientOptions {
  // autoConnect?: boolean
  port: number;
  keepalive: number;
  protocolVersion: number;
  clean: boolean;
  reconnectRetries?: number;
  connectTimeout?: number;
  rejectUnauthorized?: boolean;
  resubscribe?: boolean;
  middleware?: string[];
}

export interface MqttTopicInfo {
  topic: string,
  qos: QoS
  onMessageCallback: MiddlewareCallback,
  regexString?: string
}

export interface MqttTopicList {
  [topic: string]: MqttTopicInfo
}

// export interface MqttTsClient {
//   on(event: 'error', listener: (error: Error) => void): this;
//   on(event: string, listener: Function): this;
// }

export type MqttClientName = 'all' | string;


export interface MqttMessage {
  topic: string;
  payload: Buffer;
  packet: Packet;
  topicInfo: MqttTopicInfo;
  [key:string]: any
}

export interface MqttConfig {
  names?: string[];
  [key:string]: any
}

export interface MqttSubscription {
  name: string;
  topic: string;
  qos: QoS;
  callback: MiddlewareCallback;
}

export type MiddlewareCallback = (message: MqttMessage) => void;