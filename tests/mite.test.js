import { expect, test, beforeEach, describe } from "bun:test";
import { Window } from "happy-dom";
import { h, createElement, patch, mount } from "../src/mite.js";

// Setup the DOM environment
const window    = new Window();
global.document = window.document;
global.window   = window;
global.Node     = window.Node;

describe("Mite",() => {

    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    test("h() should create a valid vnode",() => {
        const vnode = h("div",{ class: "test" },"hello");
        expect(vnode.tag).toBe("div");
        expect(vnode.props.class).toBe("test");
        expect(vnode.children).toEqual(["hello"]);
    });

    test("createElement() should produce real DOM nodes",() => {
        const vnode = h("span",{ id: "btn" },"click me");
        const el = createElement(vnode);

        expect(el.tagName).toBe("SPAN");
        expect(el.id).toBe("btn");
        expect(el.textContent).toBe("click me");
    });

    test("patch() should update text without replacing parent",() => {
        const container = document.getElementById("app");
        const v1 = h("div",{},"Version 1");
        const v2 = h("div",{},"Version 2");

        // Initial mount
        patch(container,v1);
        const initialNode = container.firstChild;
        expect(initialNode.textContent).toBe("Version 1");

        // Update
        patch(container,v2,v1);

        expect(container.firstChild.textContent).toBe("Version 2");
        // Ensure the DOM node identity is preserved (RECONCILIATION)
        expect(container.firstChild).toBe(initialNode);
    });

    test("Style objects should be applied correctly",() => {
        const vnode = h("div",{ style: { color: "red",marginTop: "10px" } });
        const el = createElement(vnode);

        expect(el.style.color).toBe("red");
        expect(el.style.marginTop).toBe("10px");
    });

    test("SVG elements should have the correct namespace",() => {
        const vnode = h("svg",{},h("circle"));
        const el = createElement(vnode);

        expect(el.namespaceURI).toBe("http://www.w3.org/2000/svg");
        expect(el.firstChild.namespaceURI).toBe("http://www.w3.org/2000/svg");
    });

    test("oncreate hook fires",(done) => {
        const View = () => h("div",{
            oncreate: (el) => {
                expect(el.tagName).toBe("DIV");
                done(); // Tells Bun the test is finished
            }
        });
        mount("#app",View);
    });
});