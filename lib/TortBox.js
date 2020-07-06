const DhtSensor = require('./DhtSensor');

const config = require('./Config');
const sensors = config.sensors;
const mqtt = require('./MqttClient');

const loggers = require('./Logger');

exports.init = () => {
    sensors.forEach(sensor => {
        if(sensor.type === 'dht'){
            sensor.instance = new DhtSensor(sensor);
        }
    })
}

exports.monitor = () => {
    sensors.forEach(sensor => {
        sensor.instance.monitor();
        sensor.instance.on('data', data => {
            this.sendTelemetry(sensor, data);
        })
    })
}

exports.sendAttributes = (sensor, data) => {
    if(!mqtt.connected){
        return;
    }

    sensors.forEach(sensor => {
        let topic = sensor.topics.attributes || `${sensor.name}/attributes`;
        let message = JSON.stringify({[sensor.name]: sensor.instance.attributes});
        mqtt.publish(topic,message)
            .then(() => {
                loggers.mqtt.silly('Published attributes: %s to topic: %s', message, topic, {label: 'publish'});
            })
            .catch(error => {
                loggers.mqtt.error(new Error(error),{label: 'publish'});
            })
    })

}

exports.sendTelemetry = (sensor, data) => {
    if(!mqtt.connected){
        return;
    }

    let topic = sensor.topics.telemetry  || `${sensor.name}/telemetry`;
    let message = JSON.stringify(sensor.instance.telemetry(data));
    mqtt.publish(topic,message)
        .then(() => {
            loggers.mqtt.silly('Published telemetry: %s to topic: %s', message, topic, {label: 'publish'});
        })
        .catch(error => {
            loggers.mqtt.error(new Error(error),{label: 'publish'});
        })
}
