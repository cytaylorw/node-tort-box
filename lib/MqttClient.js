const MQTT = require("async-mqtt");
const options = require('../config/mqtt');
const logger = require('./Logger').mqtt;

const client = MQTT.connect(options);

client.on('connect', connack => {
    // if(connack) console.log(connack)
    // console.log('MQTT client connected.');
    logger.info('MQTT client connected.', {label: 'onConnect'});
})
client.on('error', error => {
    // console.log(error);
    logger.error(error, {label: 'onError'});
})
module.exports = client;