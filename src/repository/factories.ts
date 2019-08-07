import { ModalManager } from './modals/manager';

class Factories {
    public readonly modals = new ModalManager();
}

export const factories = new Factories();
