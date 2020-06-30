const sensor = require("node-dht-sensor").promises;
sensor.initialize({
    test: {
      fake: {
        temperature: 21,
        humidity: 60
      }
    }
  });

class DhtSensor {

    constructor(config){
        this.config = config;
    }

    read(){
        sensor.read(this.config.type, this.config.pin)
            .then(data => {
                console.log(data);
            })
            .catch(err => console.log(err));
    }
}

module.exports = DhtSensor;