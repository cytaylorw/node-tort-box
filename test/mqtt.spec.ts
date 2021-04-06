import { expect } from 'chai';
import { mqttConfig } from '../src/configuration';
import {
    Client,
    AlreadySubscribedError,
    ClientExistError,
    IConnackPacket,
  } from '../src/mqtt';


describe('MqttTsClient', () => {

    const topic = 'test';
    const wrongTopic = '##';
    const message = 'test message';

    it('should have mqtt1 config', function() {
        expect(mqttConfig.mqtt1).to.be.not.undefined;
        expect(typeof mqttConfig.mqtt1).to.be.equal('object');
    })

    it('should NOT have mqtt2 config', function() {
        expect(mqttConfig.mqtt2).to.be.undefined;
    })

    it('should connect to a MQTT Server', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack).to.be.not.undefined;
            expect(typeof connack).to.be.equal('object');
            expect(connack.returnCode).to.be.equal(0);
            expect(client.connected).to.be.true;
        })
        .finally(() => {
            client.end();
        })
    })

    it('should Not connect twice', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            expect(client.connected).to.be.true;
            return client.connect();
        })
        .catch(err => {
            expect(err instanceof ClientExistError).to.be.true;
        })
        .finally(() => {
            client.end();
        })
    })

    it('should subscribe to a topic without any error', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            return client.subscribe(topic, 0, (topic, payload) => client.end());
        })
        .finally(() => {
            client.end();
        })
    })

    it('should Not subscribe to a topic with invalid format', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            return client.subscribe(topic, 0, (topic, payload) => client.end());
        })
        .then(() => {
            return client.subscribe(wrongTopic, 0, (topic, payload) => client.end());
        })
        .catch(err => {
            expect(err instanceof Error).to.be.true;
            expect(err.message).to.be.a('string').and.satisfy((msg: string) => msg.startsWith('Invalid topic ' + wrongTopic));
        })
        .finally(() => {
            client.end();
        })
    })

    it('should Not subscribe to a topic twice', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            return client.subscribe(topic, 0, (topic, payload) => client.end());
        })
        .then(() => {
            return client.subscribe(topic, 0, (topic, payload) => client.end());
        })
        .catch(err => {
            expect(err instanceof AlreadySubscribedError).to.be.true;
        })
        .finally(() => {
            client.end();
        })
    })

    it('should unsubscribe to a topic without any error', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            return client.subscribe(topic, 0, (topic, payload) => client.end());
        })
        .then(() => {
            return client.unsubscribe(topic);
        })
        .finally(() => {
            client.end();
        })
    })

    it('should publish to a topic without any error', function() {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket)=> {
            expect(connack.returnCode).to.be.equal(0);
            return client.publish(topic, message);
        })
        .finally(() => {
            client.end();
        })
    })

    it('should receive the published message', function(done) {
        this.timeout(7000);

        const client = new Client(mqttConfig.mqtt1);
        client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack.returnCode).to.be.equal(0);
            return client.subscribe(topic, 0, (topic, payload) => {
                expect(payload.toString()).to.be.equal(message);
                done();
            })
        })
        .then(() => {
            return client.publish(topic, message);
        })
        .finally(() => {
            client.end();
        })
    })

})