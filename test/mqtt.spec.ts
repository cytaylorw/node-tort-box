import { expect } from 'chai';
import { MqttConfig, MqttSubscription } from '../src/@types/mqtt-ts';
import { mqttConfig } from '../src/configuration';
import {
    Client,
    AlreadySubscribedError,
    ClientExistError,
    IConnackPacket,
    middleware
  } from '../src/mqtt';
import { MqttManager } from '../src/mqtt/mqtt-manager';

describe('MqttConfig', () => {
    it('should have mqtt1 config', function() {
        expect(mqttConfig.mqtt1).to.be.not.undefined;
        expect(typeof mqttConfig.mqtt1).to.be.equal('object');
    })

    it('should NOT have mqtt2 config', function() {
        expect(mqttConfig.mqtt2).to.be.undefined;
    })
})

describe('MqttTsClient', () => {

    const topic = 'test';
    const topic2 = 'test2';
    const topicR = '+';
    const topicR2 = '+/a/#';
    const wrongTopic = '##';
    const testMessage = 'test message';
    const testMessage2 = 'test2 message';
    const testMessageR = 'testR message';
    let client: Client;

    after(function() {
        client.end();
    })

    it('should connect to a MQTT Server', function() {
        this.timeout(7000);

        client = new Client(mqttConfig.mqtt1);
        return client.connect()
        .then((connack: IConnackPacket) => {
            expect(connack).to.be.not.undefined;
            expect(typeof connack).to.be.equal('object');
            expect(connack.returnCode).to.be.equal(0);
            expect(client.connected).to.be.true;
        })
    })

    it('should Not connect twice', function() {

        return client.connect()
        .catch(err => {
            expect(err instanceof ClientExistError).to.be.true;
        })
    })

    it('should reconnect connected client without error', function() {

        return client.reconnect()
        .then(()=> {
            expect(client.connected).to.be.true;
        })
    })

    it('should end connected client', function() {

        return client.end()
        .then(()=> {
            expect(client.connected).to.be.false;
        })
    })

    it('should end disconnected client without error', function() {

        return client.end()
        .then(()=> {
            expect(client.connected).to.be.false;
        })
    })

    it('should reconnect disconnected client', function() {

        return client.reconnect()
        .then(()=> {
            expect(client.connected).to.be.true;
        })
    })

    it('should subscribe to a topic without any error', function() {

        return client.subscribe(topic, 0, (message) => {return});
    })

    it('should be subscribed to topic', function() {

        expect(client.isSubscribed(topic)).to.be.true;
    })

    it('should Not subscribe to a topic with invalid format', function() {

        return client.subscribe(wrongTopic, 0, (message) => {return})
        .catch(err => {
            expect(err instanceof Error).to.be.true;
            expect(err.message).to.be.a('string').and.satisfy((msg: string) => msg.startsWith('Invalid topic ' + wrongTopic));
        })
    })

    it('should Not subscribe to the same topic twice', function() {

        return client.subscribe(topic, 0, (message) => {return})
        .catch(err => {
            expect(err instanceof AlreadySubscribedError).to.be.true;
        })
    })

    it('should unsubscribe to a topic without any error', function() {

        return client.unsubscribe(topic);
    })

    it('should publish to a topic without any error', function() {

        return client.publish(topic, testMessage);
    })

    it('should receive the published message parsed with NO middleware', function(done) {

        client.subscribe(topic, 0, (message) => {
            expect(message.topic).to.be.equal(topic);
            expect(message.payload.toString()).to.be.equal(testMessage);
            done();
        })
        .then(() => {
            return client.publish(topic, testMessage);
        })
    })

    it('should receive the published message parsed with middleware', function(done) {

        client.addMiddleware(middleware.parseToMessage);
        client.unsubscribe(topic)
        .then(async () => {
            await client.subscribe(topic, 0, (message) => {
                expect(message.topic).to.be.equal(topic);
                expect(message.message).to.be.equal(testMessage);
                done();
            })
            await client.publish(topic, testMessage);
        })
    })

    it('should receive the published message with correct topic', function(done) {
        ;
        client.unsubscribe(topic)
        .then(async() => {
            await client.subscribe(topic, 0, (message) => {
                expect(message.topic).to.be.equal(topic);
                expect(message.message).to.be.equal(testMessage);
            })
            await client.subscribe(topic2, 0, (message) => {
                expect(message.topic).to.be.equal(topic2);
                expect(message.message).to.be.equal(testMessage2);
                done();
            })
            await client.publish(topic, testMessage);
            await client.publish(topic2, testMessage2);
        })
    })

    it('should receive the published message with simple wildcard topic', function(done) {

        client.unsubscribe(topic)
        .then(async() => {
            await client.subscribe(topic, 0, (message) => {
                expect(message.topic).to.be.equal(topic);
                expect(message.message).to.be.equal(testMessage);
            })
            await client.subscribe(topicR, 0, (message) => {
                expect(message.topicInfo.regexString).to.be.not.empty;
                if(message.topicInfo.regexString){
                    const regex = new RegExp(message.topicInfo.regexString);
                    expect(regex.test(topicR)).to.be.true;
                }
                expect(message.message).to.be.equal(testMessageR);
                done();
            })
            await client.publish(topic, testMessage);
            await client.publish('topicR', testMessageR);
        })
    })

    it('should receive the published message with complex wildcard topic', function(done) {

        client.subscribe(topicR2, 0, (message) => {
            expect(message.topicInfo.regexString).to.be.not.empty;
            if(message.topicInfo.regexString){
                const regex = new RegExp(message.topicInfo.regexString);
                expect(regex.test('topicR/a/b')).to.be.true;

            }
            expect(message.message).to.be.equal(testMessageR);
            done();
        })
        .then(async() => {
            await client.publish('topicR/a/b', testMessageR);
        })
    })


})

describe('MqttManager', () => {

    let mqttMgr: MqttManager;
    const config: MqttConfig = {
        names: [
            'mqtt1'
        ],
        mqtt1: {
            protocol: "mqtt",
            port: '9001',
            host: 'localhost'
        }
    }

    after(function() {

        mqttMgr.end();
    })

    it('should create a new instance', function() {

        mqttMgr = MqttManager.getInstance(config);
        expect(mqttMgr.clients.mqtt1).to.be.exist;
        expect(mqttMgr.clients.mqtt2).to.be.not.exist;
    })

    it('should connect all clients', async function() {

        await mqttMgr.connect();
        expect(mqttMgr.clients.mqtt1.connected).to.be.true;
        await mqttMgr.clients.mqtt1.end();
    })

    it('should end all', async function() {

        await mqttMgr.end();
        expect(mqttMgr.clients.mqtt1.connected).to.be.false;
    })

    it('should connect and end mqtt1', async function() {

        mqttMgr = MqttManager.getInstance(config);
        await mqttMgr.connect('mqtt1');
        expect(mqttMgr.clients.mqtt1.connected).to.be.true;
        await mqttMgr.end('mqtt1');
        expect(mqttMgr.clients.mqtt1.connected).to.be.false;
    })

    it('should reconnect all clients', async function() {

        await mqttMgr.reconnect();
        expect(mqttMgr.clients.mqtt1.connected).to.be.true;

    })

    it('should add middleware to all clients', function() {

        mqttMgr.addMiddleware(middleware.parseToMessage);
        expect(mqttMgr.clients.mqtt1.middleware[mqttMgr.clients.mqtt1.middleware.length - 1]).to.be.equal(middleware.parseToMessage);

    })

    it('should add a subscription', function() {

        const subscription: MqttSubscription = {
            name: 'mqtt1',
            topic: 'test1',
            qos:0,
            callback: (message) => {
            }
        }

        mqttMgr.addSubscription(subscription.topic, subscription.qos, subscription.callback, subscription.name, );
        expect(mqttMgr.subscriptions[mqttMgr.subscriptions.length - 1].topic).to.be.equal(subscription.topic);
        expect(mqttMgr.subscriptions[mqttMgr.subscriptions.length - 1].qos).to.be.equal(subscription.qos);
    })

    it('should subscribe all', function() {

        const subscription: MqttSubscription = {
            name: 'mqtt1',
            topic: 'test2',
            qos:0,
            callback: (message) => {
            }
        }

        mqttMgr.addSubscription(subscription.topic, subscription.qos, subscription.callback, );
        expect(mqttMgr.subscriptions[mqttMgr.subscriptions.length - 1].topic).to.be.equal(subscription.topic);
        return mqttMgr.subscribeAll();
    })

    it('should subscribe all again with NO error', function() {

        return mqttMgr.subscribeAll();
    })

    it('should unsubscribe all', function() {

        return mqttMgr.unsubscribeAll();
    })

    it('should receive published message', function(done) {
        const msg = 'test message';

        const subscription: MqttSubscription = {
            name: 'mqtt1',
            topic: 'test/1',
            qos:0,
            callback: (message) => {
                expect(message.message).to.be.equal(msg);
                done();
            }
        }
        mqttMgr.addSubscription(subscription.topic, subscription.qos, subscription.callback, subscription.name, );
        expect(mqttMgr.subscriptions[mqttMgr.subscriptions.length - 1].topic).to.be.equal(subscription.topic);
        mqttMgr.subscribeAll()
        .then(() => {
            mqttMgr.publish(subscription.topic, msg, {qos: subscription.qos});
        });
    })
})