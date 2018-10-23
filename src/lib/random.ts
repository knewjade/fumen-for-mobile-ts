const KEY_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateKey = (length: number = 8): string => {
    const max = KEY_CHARS.length;
    return Array.from({ length }).map(() => KEY_CHARS[Math.floor(Math.random() * max)]).join('');
};
