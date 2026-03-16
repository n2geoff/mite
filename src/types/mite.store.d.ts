type StorageAPI = {
    get(key: string): any;
    set(key: string, value: any): any | null;
    remove(key: string): any;
    clear(): void;
    update(key: string, data: Record<string, unknown>): any;
};

declare function Store(type?: 'local' | 'session'): StorageAPI;
export { Store };
