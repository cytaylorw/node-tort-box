const DhtSensor = require('./lib/DhtSensor');
const dhtList = require('./config/dht');

dhtList.forEach(dht => {
    dht.sensor = new DhtSensor(dht);
    dht.sensor.read();
})