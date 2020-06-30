const DhtSensor = require('./lib/DhtSensor');
const dhtList = require('./config/dht');

const mqtt = require('./lib/MqttClient');



dhtList.forEach(dht => {
    dht.sensor = new DhtSensor(dht);
    dht.sensor.monitor();
    dht.sensor.on('data', data => {
        console.log(data);
        if(mqtt.connected){
            mqtt.publish('test',JSON.stringify(data))
                // .then(() => {
                //     console.log('published')
                // })
                .catch(err => {
                    console.log(err);
                })
        }
    })
})