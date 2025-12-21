import { expect, test, describe, beforeAll } from "bun:test";
import { Window } from "happy-dom";
import { html } from "../src/html.js";

describe("Mite - html parser", () => {

    test("basic: simple string template", () => {
        const vnode = html`<div>Hello World</div>`;
        expect(vnode.tag).toBe("div");
        expect(vnode.children).toEqual(["Hello World"]);
    });

    test("interpolation: strings and numbers", () => {
        const name = "Mite";
        const version = 2;
        const vnode = html`<span>${name} v${version}</span>`;

        expect(vnode.children).toEqual(["Mite v2"]);
    });

    test("attributes: static and dynamic", () => {
        const id = "main-btn";
        const vnode = html`<button id="${id}" class="btn" disabled>Click</button>`;

        expect(vnode.props.id).toBe("main-btn");
        expect(vnode.props.class).toBe("btn");
        expect(vnode.props.disabled).toBe(""); // Boolean attribute behavior
    });

    test("events: function binding", () => {
        const handler = () => console.log("clicked");
        const vnode = html`<div onclick="${handler}"></div>`;

        expect(typeof vnode.props.onclick).toBe("function");
        expect(vnode.props.onclick).toBe(handler);
    });

    test("lists: mapping arrays", () => {
        const items = ['a', 'b'];
        const vnode = html`
            <ul>
                ${items.map(item => html`<li>${item}</li>`)}
            </ul>
        `;

        // The parser likely keeps the whitespace (newlines/tabs) from your template
        // as Text Nodes. This is why length tests often fail!
        const listItems = vnode.children.filter(c => typeof c === 'object');
        expect(listItems.length).toBe(2);
        expect(listItems[0].tag).toBe("li");

        expect(vnode.tag).toBe("ul");
        expect(listItems[0].children).toEqual(["a"]);
    });

    test("nested objects: style and key", () => {
        const theme = { color: 'red' };
        const vnode = html`<div style="${theme}" key="header"></div>`;

        expect(vnode.props.style).toEqual({ color: 'red' });
        expect(vnode.props.key).toBe("header");
    });

    test("fragments: multiple top-level elements", () => {
        const vnode = html`
            <nav>Menu</nav>
            <main>Content</main>
        `;

        expect(vnode.tag).toBe("fragment");
        expect(vnode.children.length).toBe(2);
        expect(vnode.children[0].tag).toBe("nav");
        expect(vnode.children[1].tag).toBe("main");
    });

    test("cleansing: handles null/undefined in templates", () => {
        const vnode = html`<div>${null} ${undefined} <span>Visible</span></div>`;

        // flexible h() should filter out the nulls/undefineds
        expect(vnode.tag).toBe('div');
        expect(vnode.children.length).toBe(1);
        expect(vnode.children[0].tag).toBe("span");
    });
});