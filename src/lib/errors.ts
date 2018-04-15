abstract class BaseError implements Error {
    public readonly name: string;

    protected constructor(public readonly message: string) {
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, this.constructor.prototype);
    }

    toString() {
        return this.name + ': ' + this.message;
    }
}

export class FumenError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class ViewError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}
