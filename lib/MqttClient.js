const MQTT = require("async-mqtt");
const options = require('../config/mqtt');

const client = MQTT.connect(options);

client.on('connect', connack => {
    // if(connack) console.log(connack)
    console.log('MQTT client connected.');
})
client.on('error', error => {
    console.log(error);
})
module.exports = client;