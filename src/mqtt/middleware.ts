import { MiddlewareCallback } from '../@types/mqtt-ts';

const middleware: {[name: string]: MiddlewareCallback} = {
  parseToMessage: (msg) => {
    msg.message = msg.payload.toString();
  }
}

export { middleware };