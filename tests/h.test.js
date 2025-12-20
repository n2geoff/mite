import { expect, test, describe } from "bun:test";
import { h } from "../src/index.js";

describe("Mite - h() function", () => {

    test("standard: h(tag, props, children)", () => {
        const vnode = h("div", { id: "foo" }, "Hello");
        expect(vnode.tag).toBe("div");
        expect(vnode.props.id).toBe("foo");
        expect(vnode.children).toEqual(["Hello"]);
    });

    test("flexible: h(tag, stringChild)", () => {
        const vnode = h("div", "Hello World");
        expect(vnode.tag).toBe("div");
        expect(vnode.props).toEqual({});
        expect(vnode.children).toEqual(["Hello World"]);
    });

    test("flexible: h(tag, arrayChild)", () => {
        const vnode = h("ul", [
            h("li", "Item 1"),
            h("li", "Item 2")
        ]);
        expect(vnode.tag).toBe("ul");
        expect(vnode.children.length).toBe(2);
        expect(vnode.children[0].tag).toBe("li");
    });

    test("flexible: h(tag, null)", () => {
        const vnode = h("div", null);
        expect(vnode.tag).toBe("div");
        expect(vnode.props).toEqual({});
        expect(vnode.children).toEqual([]);
    });

    test("flexible: h(tag)", () => {
        const vnode = h("div");
        expect(vnode.tag).toBe("div");
        expect(vnode.props).toEqual({});
        expect(vnode.children).toEqual([]);
    });

    test("flexible: h(tag, propsOnly)", () => {
        const vnode = h("input", { type: "text", value: "test" });
        expect(vnode.tag).toBe("input");
        expect(vnode.props.type).toBe("text");
        expect(vnode.children).toEqual([]);
    });

    test("nested: h(tag, vnodeChild)", () => {
        const vnode = h("div", h("span", "inner"));
        expect(vnode.tag).toBe("div");
        expect(vnode.props).toEqual({}); // Should not treat the span as props
        expect(vnode.children[0].tag).toBe("span");
    });

    test("cleaning: filters out false, null, and empty strings", () => {
        const vnode = h("div", {}, false, "Valid", null, "", "Also Valid");
        expect(vnode.children).toEqual(["Valid", "Also Valid"]);
    });

    test("flattening: handles deeply nested arrays", () => {
        const vnode = h("div", {}, [1, [2, [3, 4]]]);
        expect(vnode.children).toEqual([1, 2, 3, 4]);
    });
});