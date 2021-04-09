import readline from 'readline';

let signalsHandler: readline.Interface | NodeJS.Process = process.platform === "win32" ? readline.createInterface({
    input: process.stdin,
    output: process.stdout
  }) : process;

// signalsHandler
// .on("SIGINT", function () {
//     console.log('SIGTINT signal received.');
//     process.kill(process.pid, 'SIGINT');
// })
// .on('SIGTERM', () => {
//     console.log('SIGTERM signal received.');
//     process.kill(process.pid, 'SIGTERM');
// })
// .on('SIGKILL', () => {
//     console.log('SIGKILL signal received.');
//     process.kill(process.pid, 'SIGKILL');
// })

  process
  .on('exit', () => {
      console.log('Received exit signal');
  });

export function sigint() {
    // the original decorator
    return function actualDecorator(target: Object, property: string | symbol, descriptor: TypedPropertyDescriptor<any>): void {

        signalsHandler.on('SIGINT', async () => {
            await descriptor.value();
            process.kill(process.pid, 'SIGINT');
            // process.exit(0);
        });
    }
}