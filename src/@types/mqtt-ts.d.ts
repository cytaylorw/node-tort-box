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
}

export interface MqttTopicInfo {
  qos: QoS
  onMessageCallback: OnMessageCallback,
  regexString?: string
}

export interface MqttTopicList {
  [topic: string]: MqttTopicInfo
}

// export interface MqttTsClient {
//   on(event: 'error', listener: (error: Error) => void): this;
//   on(event: string, listener: Function): this;
// }