/**
 * Store 
 * 
 * unified abstraction layer over local, and session, 
 * storage systems
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

function Storage(type) {
    return {
        get(key) {
            const item = window[type].getItem(String(key));
            if (item == null) {
                return null;
            }
            return deserialize(item);
        },

        set(key, value) {
            const serialized = serialize(value);
            if (serialized === null || serialized === undefined) {
                return null;
            }
            window[type].setItem(String(key), serialized);
            return value;
        },

        remove(key) {
            const raw = window[type].getItem(String(key));
            if (raw == null) {
                return null;
            }
            window[type].removeItem(String(key));
            return deserialize(raw);
        },

        clear() {
            try {
                window[type].clear();
            } catch (_) { }
        },

        update(key, data) {
            const existing = this.get(key) || {};
            const merged = { ...existing, ...(data ?? {}) };
            return this.set(key, merged);
        }
    };
}

export const local   = Storage("localStorage");
export const session = Storage("sessionStorage");
