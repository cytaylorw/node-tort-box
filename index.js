const DhtSensor = require('./lib/DhtSensor');

const config = require('./lib/Config');
const sensors = config.sensors;
const mqtt = require('./lib/MqttClient');

const loggers = require('./lib/Logger');

console.log(config);

sensors.forEach(sensor => {
    if(sensor.type === 'dht'){
        sensor.instance = new DhtSensor(sensor.options);
        sensor.instance.monitor();
        sensor.instance.on('data', data => {
            loggers.dht.debug('Get data: %s', data ,{label: 'onData'});
            if(mqtt.connected){
                let topic = `test/${sensor.name}`;
                let message = JSON.stringify(data);
                mqtt.publish(topic,message)
                    .then(() => {
                        loggers.mqtt.silly('Published message: %s to topic: %s', message, topic, {label: 'publish'});
                    })
                    .catch(error => {
                        loggers.mqtt.error(new Error(error),{label: 'publish'});
                    })
            }
        })
    }
})