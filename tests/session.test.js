import { expect, test, beforeEach, describe } from "bun:test";
import { Window } from "happy-dom";
import { Store } from "./.build/test.build.js";

const window = new Window();
global.window = window;
global.document = window.document;

describe("Session Storage", () => {
    let session;

    beforeEach(() => {
        // Fresh session store for each test
        session = Store('session');
        window.sessionStorage.clear();
    });

    test("set returns the stored value", () => {
        const user = { name: 'Geoff', age: 50 };
        const result = session.set('user', user);
        expect(result).toBe(user);
    });

    test("get retrieves deserialized JSON", () => {
        session.set('data', { a: [1, 2], b: null });
        const value = session.get('data');
        expect(value).toEqual({ a: [1, 2], b: null });
    });

    test("get returns null for missing key", () => {
        expect(session.get('missing')).toBeNull();
    });

    test("remove deletes and returns the previous value", () => {
        session.set('key', 'value');
        const removed = session.remove('key');
        expect(removed).toBe('value');
        expect(session.get('key')).toBeNull();
    });

    test("remove returns null if key does not exist", () => {
        expect(session.remove('nonexistent')).toBeNull();
    });

    test("clear empties the store", () => {
        session.set('a', 1);
        session.set('b', 2);
        session.clear();
        expect(session.get('a')).toBeNull();
        expect(session.get('b')).toBeNull();
    });

    test("update merges shallowly and returns merged object", () => {
        session.set('config', { theme: 'dark', lang: 'en' });
        const updated = session.update('config', { lang: 'fr' });
        expect(updated).toEqual({ theme: 'dark', lang: 'fr' });
    });

    test("update creates new object if none exists", () => {
        const created = session.update('newKey', { x: 1 });
        expect(created).toEqual({ x: 1 });
        expect(session.get('newKey')).toEqual({ x: 1 });
    });

    test("non-serializable values fail silently and return null", () => {
        // Functions are not JSON-stringifiable
        const result = session.set('fn', () => { });
        expect(result).toBeNull();
        expect(window.sessionStorage.getItem('fn')).toBeNull();
    });

    test("opts parameter is accepted (ignored)", () => {
        const result = session.set('key', 'value', { expires: 999 });
        expect(result).toBe('value');
    });
});
