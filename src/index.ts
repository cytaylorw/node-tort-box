import server from './server';
import v8 from 'v8';

async function main(){
    const totalHeapSize = v8.getHeapStatistics().total_available_size;
    const totalHeapSizeInMB = (totalHeapSize / 1024 / 1024).toFixed(2);
    // logger.info(`V8 Total Heap Size ${totalHeapSizeInMB} MB`);
    console.log("V8 Total Heap Size", totalHeapSizeInMB, "MB");
    await server.boot();
    await server.start();
}

main();

