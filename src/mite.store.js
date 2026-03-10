/**
 * Store 
 * 
 * unified abstraction layer over local, session, 
 * and cookie storage systems
 *
 * @author Geoff Doty <github.com/n2geoff>
 * @license MIT
 */
const serialize = (data) => {
    try {
        if (typeof data === 'string') {
            return data;
        }
        return JSON.stringify(data);
    } catch (_) {
        return null;
    }
};

const deserialize = (raw, asText = false) => {
    if (raw == null) {
        return null;
    }
    try {
        return asText ? raw : JSON.parse(raw);
    } catch (_) {
        return raw;
    }
};

function createStorageAdapter(store) {
    return {
        get(key) {
            const item = window[store].getItem(String(key));
            if (item == null) {
                return null;
            }
            return deserialize(item);
        },

        set(key, value, opts = {}) {
            const serialized = serialize(value);
            if (serialized === null || serialized === undefined) {
                return null;
            }
            window[store].setItem(String(key), serialized);
            return value;
        },

        remove(key) {
            const raw = window[store].getItem(String(key));
            if (raw == null) {
                return null;
            }
            window[store].removeItem(String(key));
            return deserialize(raw);
        },

        clear() {
            try {
                window[store].clear();
            } catch (_) { }
        },

        update(key, data) {
            const existing = this.get(key) || {};
            const merged = { ...existing, ...(data ?? {}) };
            return this.set(key, merged);
        }
    };
}

function createCookieAdapter() {
    const encode = encodeURIComponent;
    const decode = decodeURIComponent;

    function getRaw(name) {
        const match = document.cookie.match(new RegExp(`(?:^|; )${encode(name)}=([^;]*)`));
        if (match) {
            return decode(match[1]);
        }
        return null;
    }

    function setRaw(name, value, opts = {}) {
        const { expires = 60 /* minutes */, path = '/', domain } = opts;
        const date = new Date(Date.now() + expires * 60 * 1000);
        let cookieStr = `${encode(name)}=${value}; path=${path}`;
        if (domain) {
            cookieStr += `; domain=${domain}`;
        }
        cookieStr += `; expires=${date.toUTCString()}`;
        document.cookie = cookieStr;
    }

    function removeRaw(name) {
        try {
            document.cookie = `${encode(name)}=; max-age=-1; path=/`;
        } catch (_) { }
    }

    // Cookie "clear()" — best-effort, delete all known cookies by iterating raw string
    function clearCookies() {
        try {
            const cookieStr = document.cookie || '';
            if (!cookieStr) return;
            const names = cookieStr.split(';').map((part) => {
                const eqIdx = part.indexOf('=');
                return eqIdx > 0 ? decodeURIComponent(part.slice(0, eqIdx).trim()) : null;
            }).filter(Boolean); // keep only truthy names

            for (const name of names) {
                removeRaw(name);
            }
        } catch (_) { }
    }

    const storageRef = {
        getItem: getRaw,
        setItem: (name, value) => setRaw(name, value),
        removeItem: removeRaw
    };

    const adapter = createStorageAdapter(storageRef);

    // Override .set() for cookies with opts support
    adapter.set = (key, value, opts = {}) => {
        const serialized = serialize(value);
        if (serialized === null) {
            return null;
        }
        setRaw(key, serialized, opts);
        return deserialize(serialized);
    };

    adapter.clear = () => clearCookies();

    adapter.update = (key, data) => {
        const existing = this.get(key) || {};
        const merged = { ...existing, ...(data ?? {}) };
        return this.set(key, merged);
    };

    return adapter;
}

export const local = createStorageAdapter("localStorage");
export const session = createStorageAdapter("sessionStorage");
export const cookie = createCookieAdapter();