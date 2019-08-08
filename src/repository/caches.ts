import { generateKey } from '../lib/random';

export class Caches {
    private prevHash: string = generateKey();
    private currentHash: string = generateKey();
    private pools: { [hash: string]: { [key: string]: any } } = {
        [this.prevHash]: {},
        [this.currentHash]: {},
    };

    next() {
        {
            const pool = this.pools[this.prevHash];
            for (const key of Object.keys(pool)) {
                const obj = pool[key];
                if (typeof (obj.ondestroy) === 'function') {
                    obj.ondestroy();
                }
            }
            delete this.pools[this.prevHash];
        }

        this.prevHash = this.currentHash;

        const newHash = generateKey();
        this.pools[newHash] = {};
        this.currentHash = newHash;
    }

    get<T>(key: string, generator: () => T) {
        {
            const obj = this.currentPool[key];
            if (obj !== undefined) {
                return obj as T;
            }
        }

        {
            const obj = this.prevPool[key];
            if (obj !== undefined) {
                this.currentPool[key] = obj;
                delete this.prevPool[key];
                return obj as T;
            }
        }

        return this.set(key, generator);
    }

    private set<T>(key: string, generator: () => T) {
        const newObj = generator();
        this.currentPool[key] = newObj;
        return newObj;
    }

    private get currentPool() {
        return this.pools[this.currentHash];
    }

    private get prevPool() {
        return this.pools[this.prevHash];
    }
}
