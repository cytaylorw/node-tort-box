const sensor = require("node-dht-sensor").promises;
const EventEmitter = require('events');

const logger = require('./Logger').dht;

const config = require('../lib/Config').dht;
const DEFAULT_INTERVAL = config.defaultInterval ? config.defaultInterval : 2000;
const FAILURE_MULTIPLIER = config.failureMultiplier && config.failureMultiplier > 0 ? config.defaultInterval : 2;

if(config.test){
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

    constructor(sensor){
      super();
        this.name = sensor.name;
        this.type = sensor.type;
        this.config = {...sensor.options};
        this.config.interval = sensor.options.interval && sensor.options.interval > 0 ? 
          sensor.options.interval : DEFAULT_INTERVAL;
    }

    get attributes(){
      let {name, type, config} = this;
      return {
        ...config,
        name,
        type: type+config.type,
      }
    }

    telemetry(data){
      let telemetry = {
        [`${this.name}-temperature`]: data.temperature.toFixed(2),
        [`${this.name}-humidity`]: data.humidity.toFixed(2),
      }
      if(data.time){
        telemetry = {
          ts: data.time,
          values: {...telemetry}
        }
      }
      return telemetry;
    }

    read(){
      return sensor.read(this.config.type, this.config.pin)
              .then(data => {

                if(this.config.clientTime) data.time = Date.now();

                this.emit('data',data);
                logger.debug('Get data: %s', data ,{label: 'read'});
                return data;
              })
              .catch(err => {
                logger.error(new Error(err.toString()),{label: 'read'});
                throw err;
              });
    }

    monitor(interval = this.config.interval){
      this.timer = setTimeout(() => {
        this.read()
          .then(data => {
            this.monitor();
          })
          .catch(err => {
            this.monitor(this.config.interval*FAILURE_MULTIPLIER);
          });
      },interval)
    }

    terminate(){
      clearTimeout(this.timer);
    }

}

module.exports = DhtSensor;