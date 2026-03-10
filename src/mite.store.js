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

    // Get raw cookie value by name (already URL-decoded by browser)
    function getRaw(name) {
        const match = document.cookie.match(new RegExp(`(?:^|; )${name}=(.*?)($|;)`));
        if (!match) {return null;}
        try {
            return decode(match[1]);
        } catch (_) {
            return match[1];
        }
    }

    // Set cookie with expiry, path, domain
    function setRaw(name, value, opts = {}) {
        const { expires = 60 /* minutes */, path = '/', domain } = opts;
        const date = new Date(Date.now() + expires * 60 * 1000);
        let cookieStr = `${name}=${encode(value)}; path=${path}`;
        if (domain) {
            cookieStr += `; domain=${domain}`;
        }
        cookieStr += `; expires=${date.toUTCString()}`;
        document.cookie = cookieStr;
    }

    // Remove a single cookie
    function removeRaw(name) {
        try {
            document.cookie = `${name}=; max-age=-1; path=/`;
        } catch (_) { }
    }

    // For clear(): iterate all cookies
    function getAllCookieNames() {
        if (!document.cookie) return [];
        return document.cookie.split(';')
            .map(c => c.trim().split('=')[0])
            .filter(Boolean);
    }

    function clearCookies() {
        try {
            for (const name of getAllCookieNames()) {
                removeRaw(name);
            }
        } catch (_) { }
    }

    return {
        get(key) {
            try {
                return getRaw(String(key));
            } catch (_) {
                return null;
            }
        },

        set(key, value, opts = {}) {
            try {
                const strValue = String(value);
                setRaw(String(key), strValue, opts);
                return strValue; // ✅ Return the stored string
            } catch (_) {
                return null;
            }
        },

        remove(key) {
            try {
                const raw = getRaw(String(key));
                if (raw == null) return null;
                removeRaw(String(key));
                return raw;
            } catch (_) {
                return null;
            }
        },

        clear() {
            try {
                clearCookies();
            } catch (_) { }
        },

        update(key, data) {
            const result = this.set(key, data);
            return result == null ? null : this.get(key); // get back what was stored
        }
    };
}

export const local = createStorageAdapter("localStorage");
export const session = createStorageAdapter("sessionStorage");
export const cookie = createCookieAdapter();