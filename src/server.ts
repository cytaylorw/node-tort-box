
// import {db} from './database';
// import queue from './queue';
// import './queue/queue-methods';
import {
    mqttMgr
} from './mqtt';

import { config } from './configuration';

// import { subscriptions } from './subscription';
// import { loadCache } from './cache';
// import logger from './logger';
import { sigint, closeSignalHandler } from './signals';

// import { MqttOptions } from './@types/mqtt-ts';


class Server{

    // public mqtt: MqttClient;
    // public mqttOptions: MqttOptions;

    constructor() {
        // console.log(<MqttOptions> config.mqtt as MqttOptions);
        // this.mqttOptions = mqttOpts;
    }

    public boot(): Promise<any> {
        return Promise.all([
            // this._connectDb(),
            mqttMgr.connect()
        ])
    }

    public async start(): Promise<any> {
        return Promise.all([
            // this._startDbTasks(),
            mqttMgr.subscribeAll()
        ])
    }

    @sigint()
    public shutdown(): Promise<any> {
        return Promise.all([
            mqttMgr.end(),
            closeSignalHandler()
        ])
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

    // private _startDbTasks(): Promise<void> {
    //     logger.info('Start DB Tasks');
    //     // console.log('Start DB Tasks');
    //     return db.waitConnected(100)
    //     .then(() => {
    //         return loadCache(true);
    //     })
    // }
}

const server = new Server();

export default server;
