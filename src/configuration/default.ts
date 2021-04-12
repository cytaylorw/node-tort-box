import { MqttOptions, MqttConfig } from '../@types/mqtt-ts';

import dotenv from 'dotenv';
const envOpts = {
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : undefined
}
dotenv.config(envOpts);
console.log('.env file loaded: ' + JSON.stringify(envOpts));

const config: {[topic: string]:any} = {
}

const mqttConfig: MqttConfig = {};

const setMqttConfig = (upperName: string): MqttOptions => {
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
    middleware: process.env[upperName + '_MIDDLEWARE']?.split(',')
  };
  return options as MqttOptions;
}

if(process.env.MQTT_NAMES){
  const names = process.env.MQTT_NAMES.replace(/\s/g,'').split(',');
  mqttConfig['names'] = names;
  names.forEach(name => {
    const upperName = name.toUpperCase();
    if(process.env[upperName + '_ENABLE'] === 'true'){
      mqttConfig[name] = setMqttConfig(upperName);
    }
  })
}


// console.log(mqttConfig);
export {
  mqttConfig,
  config
}
