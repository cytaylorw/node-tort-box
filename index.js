const mqtt = require('./lib/MqttClient');
const box = require('./lib/TortBox');
box.init();
mqtt.on('connect', connack => {
    box.sendAttributes();
})
box.monitor();