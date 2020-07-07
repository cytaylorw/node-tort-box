const DhtSensor = require('./DhtSensor');

const mqttClient = require('./MqttClient');
const loggers = require('./Logger');

const config = require('./Config');
const sensors = config.sensors;

exports.init = options => {
    sensors.forEach(sensor => {
        if(sensor.type === 'dht'){
            sensor.instance = new DhtSensor(sensor);
        }

        if(sensor.mqtt){
            let mqttOptions = {
              ...config.mqtt.options,
              ...sensor.mqtt
            }
            sensor.instance.mqtt = MQTT.connect(mqttOptions);
            sensor.instance.mqtt.addDefaultListeners();
        }else{
            sensor.instance.mqtt = mqttClient;
        }

        if(options.sendAttributes) this.sendSensorAttributesOnConnect(sensor);
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

exports.sendSensorAttributesOnConnect = sensor => {
    let mqttClient = sensor.instance.mqtt;

    mqttClient.on('connect', connack => {
        let topic = sensor.topics.attributes || mqtt.topics.attributes || `${sensor.name}/attributes`;
        let attributes = sensor.mqtt ? sensor.instance.attributes : {[sensor.name]: sensor.instance.attributes};
        let message = JSON.stringify(attributes);
        mqttClient.publish(topic,message)
            .then(() => {
                loggers.mqtt.silly('Published attributes: %s to topic: %s', message, topic, {label: 'publish'});
            })
            .catch(error => {
                loggers.mqtt.error(new Error(error),{label: 'publish'});
            })
    })

}

exports.sendTelemetry = (sensor, data) => {
    let mqttClient = sensor.instance.mqtt;
    if(!mqttClient.connected){
        return;
    }

    let topic = sensor.topics.telemetry || mqtt.topics.telemetry || `${sensor.name}/telemetry`;
    let message = JSON.stringify(sensor.instance.telemetry(data));
    mqttClient.publish(topic,message)
        .then(() => {
            loggers.mqtt.silly('Published telemetry: %s to topic: %s', message, topic, {label: 'publish'});
        })
        .catch(error => {
            loggers.mqtt.error(new Error(error),{label: 'publish'});
        })
}
