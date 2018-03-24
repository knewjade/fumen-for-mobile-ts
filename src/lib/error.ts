abstract class BaseError extends Error implements Error {
    public name: string;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, this.constructor.prototype);
        this.name = this.constructor.name;
    }
}

export class FumenError extends BaseError {
}

export class ViewError extends BaseError {
}
