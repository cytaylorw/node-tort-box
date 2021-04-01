import { MqttOptions } from '../@types/mqtt-ts';

import dotenv from 'dotenv';
dotenv.config();


const config: {[topic: string]:any} = {
}

const mqttConfig: {[name: string]: MqttOptions} = {};

const setMqttConfig = (name: string): MqttOptions => {
  const upperName = name.toUpperCase();
  const options: {[topic: string]: any} = {
    protocol: (process.env[upperName + '_PROTOCOL'] ?? "mqtt"),
    port: parseInt(process.env[upperName + '_PORT'] ?? '1883'),
    host: process.env[upperName + '_HOST'] ?? "localhost",
    keepalive: parseInt(process.env[upperName + '_KEEPALIVE'] ?? '30'),
    protocolId: process.env[upperName + '_PROTOCOL_ID'] ?? "MQTT",
    protocolVersion: parseInt(process.env[upperName + '_PROTOCOL_VERSION'] ?? '4'),
    clean: (process.env[upperName + '_CLEAN'] ?? 'true').toLowerCase() === 'true',
    reconnectPeriod: parseInt(process.env[upperName + '_RECONNECT_PERIOD'] ?? '1000'),
    connectTimeout: parseInt(process.env[upperName + '_CONNECT_TIMEOUT'] ?? '30000'),
    rejectUnauthorized: (process.env[upperName + '_REJECT_UNAUTHORIZED'] ?? 'false').toLowerCase() === 'true',
    resubscribe: (process.env[upperName + '_RESUBSCRIBE'] ?? 'true').toLowerCase() === 'true',
  };
  return options as MqttOptions;
}

if(process.env.MQTT1_ENABLE === 'true'){
  mqttConfig['mqtt1'] = setMqttConfig('mqtt1');
}

if(process.env.MQTT2_ENABLE === 'true'){
  mqttConfig['mqtt2'] = setMqttConfig('mqtt2');
}

// console.log(mqttConfig);
export {
  mqttConfig,
  config
}
