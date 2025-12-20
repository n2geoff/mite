import { expect,test,describe,beforeEach } from "bun:test";
import { Window } from "happy-dom";
import { html, patch } from "../src/index.js";

// Setup the DOM environment
const window = new Window();
global.document = window.document;

describe("Mite.js - Style Patching",() => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    test("should apply style as a string",() => {
        const vnode = html`<div style="color: red; display: block;"></div>`;
        patch(container,vnode);

        const el = container.firstChild;
        expect(el.style.color).toBe("red");
        expect(el.style.display).toBe("block");
    });

    test("should apply style as an object",() => {
        const styles = { color: "blue",marginTop: "10px" };
        const vnode = html`<div style="${styles}"></div>`;
        patch(container,vnode);

        const el = container.firstChild;
        expect(el.style.color).toBe("blue");
        expect(el.style.marginTop).toBe("10px");
    });

    test("should update style object and remove old properties (Bleed Test)",() => {
        const oldVnode = html`<div style="${{ color: "red",fontSize: "20px" }}"></div>`;
        patch(container,oldVnode);

        const newVnode = html`<div style="${{ color: "blue" }}"></div>`;
        // Pass oldVnode so patch() can diff them
        patch(container,newVnode,oldVnode);

        const el = container.firstChild;
        expect(el.style.color).toBe("blue");
        // fontSize should be gone because we reset cssText before Object.assign
        expect(el.style.fontSize).toBe("");
    });

    test("should transition from string to object",() => {
        const oldVnode = html`<div style="color: red;"></div>`;
        patch(container,oldVnode);

        const newVnode = html`<div style="${{ display: "flex" }}"></div>`;
        patch(container,newVnode,oldVnode);

        const el = container.firstChild;
        expect(el.style.color).toBe("");
        expect(el.style.display).toBe("flex");
    });

    test("should handle null/undefined styles by clearing",() => {
        const oldVnode = html`<div style="color: red;"></div>`;
        patch(container,oldVnode);

        const newVnode = html`<div style="${null}"></div>`;
        patch(container,newVnode,oldVnode);

        const el = container.firstChild;
        expect(el.getAttribute("style")).toBe("");
    });
});