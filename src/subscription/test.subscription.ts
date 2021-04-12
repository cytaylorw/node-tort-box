
// import { Device, Recyclebin, SteamoError, SteamoTelemetry, SteamoTelemetryAttributes } from '../models';
// import queue, { queueTopic } from '../queue';
// import { OnMessageCallback, Packet } from '../ts-mqtt';
import { addSubscription } from '../mqtt'
import { MqttMessage } from '../@types/mqtt-ts';


export class TestSubscription {

    constructor(){}
    @addSubscription(
        'test',
        0,
        'mqtt1',
    )
    async test(message: MqttMessage): Promise<void> {
        console.log(message);
    }
}