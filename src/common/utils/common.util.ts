export const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export function getProp<T, K extends keyof T> (obj: T, key: K): T[K]{
    return obj[key];
} 