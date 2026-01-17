import { expect,test,describe,beforeEach } from "bun:test";
import { Window } from "happy-dom";
import { patch, signal, h, mount } from "../src/mite.js";
import { html } from "../src/xhtm.js";

// Setup the DOM environment
const window = new Window();
global.document = window.document;

describe("Mite - Patching",() => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    test("reconciliation: shrinking a list removes the correct elements", () => {
        document.body.innerHTML = '<div id="app"></div>';

        function App({state}) {
            return h('ul', {}, state.items.map(i => h('li', {}, i)))
        }

        // 1. Initial render with 3 items
        const state = mount('#app', App,
            { items: ['A', 'B', 'C'] }
        );

        const list = document.querySelector('ul');
        expect(list.children.length).toBe(3);
        expect(list.children[2].textContent).toBe('C');

        state.update({ items: ['A'] });

        expect(list.children.length).toBe(1);
        expect(list.children[0].textContent).toBe('A');
        expect(document.querySelectorAll('li').length).toBe(1);
    });

    test("mount signature: handles nullable view and positional state", () => {
        document.body.innerHTML = '<div id="app"></div>';

        const state = mount('#app', null, { count: 10 });

        expect(state.getState().count).toBe(10);
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

    test("keyed reconciliation: should replace element if key changes",() => {
        const oldVnode = html`<div key="a"></div>`;
        patch(container,oldVnode);
        const originalEl = container.firstChild;

        const newVnode = html`<div key="b"></div>`;
        patch(container,newVnode,oldVnode);
        const newEl = container.firstChild;

        // If keys work, these must be different DOM nodes
        expect(originalEl).not.toBe(newEl);
    });

    test("Keyed Correctness: Should update order correctly",() => {
        const container = document.createElement("div");
        const myStore = signal({ items: [{ id: 1,text: "A" },{ id: 2,text: "B" }] });

        const View = (state) => html`
        <ul>
            ${state.items.map(item => html`<li key="${item.id}">${item.text}</li>`)}
        </ul>
    `;

        // Render 1
        let oldV = View(myStore.getState());
        patch(container,oldV);

        // Render 2 (Shuffle)
        myStore.update({ items: [{ id: 2,text: "B" },{ id: 1,text: "A" }] });
        const newV = View(myStore.getState());
        patch(container,newV,oldV);

        const lis = container.querySelectorAll("li");
        expect(lis[0].textContent).toBe("B");
        expect(lis[1].textContent).toBe("A");
        expect(lis.length).toBe(2);
    });
});
