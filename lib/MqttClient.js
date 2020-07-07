const MQTT = require("async-mqtt");
const config = require('../lib/Config').mqtt;
const logger = require('./Logger').mqtt;

MQTT.AsyncClient.prototype.addDefaultListeners = () => {
    this.on('connect', connack => {
        // if(connack) console.log(connack)
        // console.log('MQTT client connected.');
        logger.info('MQTT client connected.', {label: 'onConnect'});
    })
    this.on('close', () => {
        logger.info('MQTT client disconnected.', {label: 'onClose'});
    })
    this.on('error', error => {
        // console.log(error);
        logger.error(error, {label: 'onError'});
    })
}


if(config.enable && config.host && config.port && config.username){
    logger.info('MQTT is enabled.');
    const mqttClient = MQTT.connect(config.options);
    mqttClient.addDefaultListeners();
    
    module.exports = mqttClient;
}