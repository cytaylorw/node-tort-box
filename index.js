const DhtSensor = require('./lib/DhtSensor');
const dhtList = require('./config/dht').sensors;

const mqtt = require('./lib/MqttClient');

const loggers = require('./lib/Logger');



dhtList.forEach(dht => {
    dht.sensor = new DhtSensor(dht);
    dht.sensor.monitor();
    dht.sensor.on('data', data => {
        loggers.dht.debug('Get data: %s', data ,{label: 'onData'});
        if(mqtt.connected){
            let topic = `test/${data.name}`;
            let message = JSON.stringify(data);
            mqtt.publish(topic,message)
                .then(() => {
                    loggers.mqtt.debug('Published message: %s to topic: %s', message, topic, {label: 'publish'});
                })
                .catch(error => {
                    loggers.mqtt.error(new Error(error),{label: 'publish'});
                })
        }
    })
})