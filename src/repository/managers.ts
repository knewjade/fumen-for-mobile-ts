import { ModalManager } from './modals/manager';
import { KonvaManager } from './konva/manager';
import { Caches } from './caches';

class Managers {
    public readonly modals = new ModalManager();
    public readonly caches = new Caches();
    public readonly konva = new KonvaManager();
}

export const managers = new Managers();
