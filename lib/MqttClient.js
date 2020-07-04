const MQTT = require("async-mqtt");
const config = require('../lib/Config').mqtt;
const logger = require('./Logger').mqtt;

if(config.enable){
    logger.info('MQTT is enabled.');
    const mqttClient = MQTT.connect(config.options);
    
    mqttClient.on('connect', connack => {
        // if(connack) console.log(connack)
        // console.log('MQTT client connected.');
        logger.info('MQTT client connected.', {label: 'onConnect'});
    })
    mqttClient.on('error', error => {
        // console.log(error);
        logger.error(error, {label: 'onError'});
    })
    module.exports = mqttClient;
}