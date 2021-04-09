import { expect } from 'chai';
import server from '../src/server';


describe('server', () => {

    it('should boot', function() {
        return server.boot();
    })

    it('should start', function() {
        return server.start();
    })

    it('should shutdown', function() {
        return server.shutdown();
    })

})