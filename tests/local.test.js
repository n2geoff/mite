import { expect, test, beforeEach, describe } from "bun:test";
import { Window } from "happy-dom";
import { Store } from "./.build/test.build.js";

const window = new Window();
global.window = window;
global.document = window.document;

describe("Local Storage", () => {
    let local;

    beforeEach(() => {
        local = Store('local');
        window.localStorage.clear();
    });

    test("set returns the stored value", () => {
        const obj = { name: 'Alice' };
        expect(local.set('user', obj)).toBe(obj);
    });

    test("get handles strings natively (no JSON.parse)", () => {
        // Store raw string via native API
        window.localStorage.setItem('raw', '"hello"');
        // get should parse it → "hello"
        expect(local.get('raw')).toBe('hello');

        // Now store with our API (JSON)
        local.set('json', 'hello');
        expect(local.get('json')).toBe('hello'); // JSON string is `"hello"` → parsed to `hello`
    });

    test("get returns null for missing key", () => {
        expect(local.get('missing')).toBeNull();
    });

    test("remove deletes and returns previous value", () => {
        window.localStorage.setItem('key', '"value"');
        const removed = local.remove('key');
        expect(removed).toBe('value');
    });

    test("clear empties the store", () => {
        local.set('a', 1);
        local.clear();
        expect(window.localStorage.length).toBe(0);
    });

    test("update merges and returns result", () => {
        const initial = { a: 1 };
        local.set('obj', initial);
        const merged = local.update('obj', { b: 2 });
        expect(merged).toEqual({ a: 1, b: 2 });
    });

    test("opts is accepted (ignored)", () => {
        expect(local.set('k', 'v', { expires: 1 })).toBe('v');
    });

    test("circular references fail silently", () => {
        const obj = {};
        obj.self = obj;
        const result = local.set('circular', obj);
        expect(result).toBeNull();
    });
});
