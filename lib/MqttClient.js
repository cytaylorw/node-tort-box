const MQTT = require("async-mqtt");
const options = require('../config/mqtt');

const client = MQTT.connect(options);

module.exports = client;