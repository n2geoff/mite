import { expect,test,describe,beforeEach,spyOn } from "bun:test";
import { Window } from "happy-dom";
import { html,patch } from "../src/index.js";

const window = new Window();
global.document = window.document;

describe("Mite.js - Events & Lifecycles",() => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    test("should bind event listeners",() => {
        let clicked = false;
        const vnode = html`<button onclick="${() => clicked = true}">Click</button>`;
        patch(container,vnode);

        const btn = container.querySelector("button");
        btn.click(); // Simulate real click
        expect(clicked).toBe(true);
    });

    test("should replace event listeners when they change",() => {
        let count = 0;
        const handlerA = () => count += 1;
        const handlerB = () => count += 10;

        const oldVnode = html`<button onclick="${handlerA}">Click</button>`;
        patch(container,oldVnode);

        const newVnode = html`<button onclick="${handlerB}">Click</button>`;
        patch(container,newVnode,oldVnode);

        const btn = container.querySelector("button");
        btn.click();

        // Should only be 10, not 11. If it's 11, the old listener wasn't removed!
        expect(count).toBe(10);
    });

    test("should remove event listeners when set to null",() => {
        let count = 0;
        const handler = () => count++;

        const oldVnode = html`<button onclick="${handler}">Click</button>`;
        patch(container,oldVnode);

        const newVnode = html`<button onclick="${null}">Click</button>`;
        patch(container,newVnode,oldVnode);

        const btn = container.querySelector("button");
        btn.click();

        expect(count).toBe(0);
    });

    test("should trigger oncreate lifecycle hook",async () => {
        let capturedEl = null;
        const vnode = html`<div oncreate="${(el) => capturedEl = el}">Hook</div>`;

        patch(container,vnode);

        // oncreate uses setTimeout(..., 0), so we wait a tick
        await new Promise(r => setTimeout(r,0));

        expect(capturedEl).not.toBeNull();
        expect(capturedEl.tagName).toBe("DIV");
        expect(capturedEl.textContent).toBe("Hook");
    });
});