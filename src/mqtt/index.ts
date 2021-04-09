export * from "./mqtt-client";
export * from "./middleware";
export * from "./errors";
export {
  Packet,
  QoS,
  IConnackPacket,
  IClientPublishOptions,
  OnMessageCallback,
} from "mqtt";

import { QoS, OnMessageCallback } from "mqtt";
import { MqttClientName } from "../@types/mqtt-ts";
import { MqttManager } from "./mqtt-manager";

const mqttMgr: MqttManager = MqttManager.getInstance();

export function addSubscription(topic: string, qos: QoS, name: MqttClientName, ) {
  // the original decorator
  return function actualDecorator(
    target: Record<string, any>,
    property: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): void {
    mqttMgr.addSubscription(topic, qos, descriptor.value, name, );
  };
}

export { mqttMgr, addSubscription as addMqttSubscription };
