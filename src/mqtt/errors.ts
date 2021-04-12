export class ClientExistError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = ClientExistError.name; // stack traces display correctly now
  }
}

export class NoMessageCallbackError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = NoMessageCallbackError.name; // stack traces display correctly now
  }
}

export class TooManyRetriesError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = TooManyRetriesError.name; // stack traces display correctly now
  }
}

export class AlreadySubscribedError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = AlreadySubscribedError.name; // stack traces display correctly now
  }
}

export class SubscribeFailedError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = SubscribeFailedError.name; // stack traces display correctly now
  }
}

export class ClientNotDefinedError extends Error {
  constructor(message?: string) {
      super(message);
      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = ClientNotDefinedError.name; // stack traces display correctly now
  }
}