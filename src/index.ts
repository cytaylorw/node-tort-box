import server from './server';

server.init().then(() => {
    return server.start();
})

