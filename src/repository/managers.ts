import { ModalManager } from './modals/manager';
import { Caches } from './caches';

class Managers {
    public readonly modals = new ModalManager();
    public readonly caches = new Caches();
}

export const managers = new Managers();
