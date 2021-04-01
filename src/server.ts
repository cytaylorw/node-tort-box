
// import {db} from './database';
// import queue from './queue';
// import './queue/queue-methods';
// import {
//     MqttOptions,
//     MqttClient
// } from './ts-mqtt';

import { config } from './configuration';

// import { subscriptions } from './subscription';
// import { loadCache } from './cache';
// import logger from './logger';
// import { sigint } from './signals';

import v8 from 'v8';
import { MqttOptions } from './@types/mqtt-ts';
// const v8 = require('v8');
const totalHeapSize = v8.getHeapStatistics().total_available_size;
const totalHeapSizeInMB = (totalHeapSize / 1024 / 1024).toFixed(2);
// logger.info(`V8 Total Heap Size ${totalHeapSizeInMB} MB`);
console.log("V8 Total Heap Size", totalHeapSizeInMB, "MB");


export class Server{

    // public mqtt: MqttClient;
    // public mqttOptions: MqttOptions;

    constructor() {
        console.log(<MqttOptions> config.mqtt as MqttOptions);
        // this.mqttOptions = mqttOpts;
    }

    public init(): Promise<any> {
        return Promise.all([
            // this._connectDb(),
            // this._connectMqtt()
        ])
    }

    public async start(): Promise<void> {
        // return this._startDbTasks()
        // .then(()=> this._startMqttTasks())
        // .then(()=>{
        //     // let [topics, timeouts] = queue.startAll();
        //     // logger.info(`Start processing queue topics. Topics: ${topics} Total: ${timeouts}`)
        // });
    }

    // @sigint()
    public shutdown(): void {
        console.log('Shutting down...');
    }

    // private _connectDb(): Promise<void> {
    //     return getDb('pg').authenticate()
    //     .then(() => {
    //         console.log(`DB ${getDb('pg').config.host} connected`);
    //         // return syncModels();
    //     })
    //     .catch((error: Error) => {
    //         console.log(`Unable to connect to DB ${getDb('pg').config.host}:\n${error}`);
    //         process.exit(1);
    //     });
    // }

    // private _connectMqtt(): Promise<void> {
    //     this.mqtt = new MqttClient(this.mqttOptions);
    //     return this.mqtt.connect()
    //     .then((connack) => {
    //         logger.info(`MQTT connected to ${this.mqttOptions.host}`);
    //         // console.log(`MQTT connected to ${this.mqttOptions.host}`);
    //     })
    //     .catch((error)=> {
    //         logger.error(`Unable to connect to MQTT ${this.mqttOptions.host}:\n${error}`);
    //         // console.log(`Unable to connect to MQTT ${this.mqttOptions.host}:\n${error}`);
    //     })
    // }

    // private _startDbTasks(): Promise<void> {
    //     logger.info('Start DB Tasks');
    //     // console.log('Start DB Tasks');
    //     return db.waitConnected(100)
    //     .then(() => {
    //         return loadCache(true);
    //     })
    // }

    // private _startMqttTasks(): Promise<void> {
    //     logger.info('Start MQTT Tasks');
    //     // console.log('Start MQTT Tasks');
    //     return this._subscribeTopics()
    //     .then(() => {
    //         logger.info('MQTT topic subscription completed.');
    //         // await this.mqtt.publish('mqtt/test', '0,12,66,9e,29,06,42,c2,b3,04,76,03,45,01,bf,fff,e0,05,0,0,5fa25d30,531BA,358500123456789')
    //     })
    //     .catch((error)=> {
    //         logger.error(`Error at _startMqttTasks:\n${error}`);
    //         // console.log(`Error at _startMqttTasks:\n${error}`);
    //     })
    // }

    // private _subscribeTopics(): Promise<any> {
    //     let promises: Array<Promise<any>> = [];

    //     subscriptions.forEach(({type, topic, callback, opt}) => {
    //         logger.info(`Subscribing to ${topic}`);
    //         // console.log(`Subscribing to ${topic}`)
    //         if(type === 'mqtt'){
    //             let qos = typeof opt === 'number' ? opt : 0;
    //             promises.push(
    //                 this.mqtt.subscribe(topic, qos , callback)
    //                 .then(() => {
    //                     logger.info(`Subscribed to ${topic}`);
    //                     // console.log(`Subscribed to ${topic}`)
    //                 })
    //                 .catch((error)=> {
    //                     logger.error(`Unable to subscribe topic ${topic}:\n${error}`);
    //                     // console.log(`Unable to subscribe topic ${topic}:\n${error}`);
    //                 })
    //             )
    //         }
    //         if(type === 'kafka'){

    //         }
    //     })
    //     return Promise.all(promises)
    // }
}

const server = new Server();

export default server;
