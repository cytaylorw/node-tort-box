const sensor = require("node-dht-sensor").promises;
const EventEmitter = require('events');

const DEFAULT_INTERVAL = 2000;

if(process.env.TEST){
  sensor.initialize({
      test: {
        fake: {
          temperature: 21,
          humidity: 60
        }
      }
    });
}

class DhtSensor extends EventEmitter {

    constructor(config){
      super();
        this.config = config;
        this.config.interval = config.interval ? config.interval : DEFAULT_INTERVAL;
    }

    read(){
      return sensor.read(this.config.type, this.config.pin)
            .then(data => {
              data.name = this.config.name;
              data.time = Date.now();
              this.emit('data',data);
              return data;
            })
            .catch(err => console.log(err));
    }

    monitor(interval = this.config.interval){
      this.timer = setTimeout(() => {
        this.read()
          .then(data => {
            this.monitor();
          })
          .catch(err => {
            this.monitor(this.config.interval*2)
          });
      },interval)
    }

    terminate(){
      clearTimeout(this.timer);
    }
}

module.exports = DhtSensor;