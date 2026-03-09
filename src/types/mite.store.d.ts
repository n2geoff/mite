export interface StoreOptions { /* ... */ }

type StorageAPI = {
    get(key: string): any;
    set(key: string, value: any, opts?: StoreOptions): any | null;
    remove(key: string): any;
    clear(): void;
    update(key: string, data: Record<string, unknown>): any;
};

declare function Store(type?: 'local' | 'session' | 'cookie'): StorageAPI;
export { Store };
