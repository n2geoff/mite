/**
 * Mite.js - A Minimalist's SPA framework
 * @module Mite
 */

/**
 * Creates a virtual node (VNode).
 *
 * @param {string|function} tag - The HTML tag (or 'fragment') or 'function'
 * @param {any} props - Attributes or the first child
 * @param {...any} children - Child VNodes or text content.
 * @returns {Object} The VNode representation.
 */
export const h = (tag, props, ...children) => {
    if (typeof tag === 'function') {
        return tag({ ...props, children: children.flat(Infinity) });
    }

    // props (optional)
    const isProp = props && typeof props === 'object' && !props.flat && !props.tag;

    return {
        tag: tag || 'fragment',
        props: isProp ? props : {},
        children: (isProp ? children : [props, ...children])
            .flat(Infinity)
            .filter(v => v != null && v !== false && v !== '')
    };
};

/**
 * Transforms a VNode into a real DOM element or Text node.
 * Supports SVG namespaces and 'oncreate' lifecycle hooks.
 *
 * @param {Object|string|number} vnode - The VNode to materialize.
 * @param {boolean} [isSVG=false] - Whether to create nodes in the SVG namespace.
 * @returns {Node} The resulting DOM element or text node.
 */
export const createElement = (vnode,isSVG = false) => {
    if (typeof vnode !== 'object') {
        return document.createTextNode(vnode);
    }

    if (vnode.tag === 'fragment') {
        const frag = document.createDocumentFragment();
        vnode.children.forEach(c => frag.appendChild(createElement(c,isSVG)));
        return frag;
    }

    const svgMode = isSVG || vnode.tag === 'svg';
    const el = svgMode
        ? document.createElementNS("http://www.w3.org/2000/svg",vnode.tag)
        : document.createElement(vnode.tag);

    patchProps(el,vnode.props);

    vnode.children.forEach(c => el.appendChild(createElement(c,svgMode)));

    if (vnode.props?.oncreate) {
        setTimeout(() => vnode.props.oncreate(el));
    }

    return el;
};

/**
 * Synchronizes DOM attributes, styles, and event listeners.
 *
 * @param {HTMLElement} el - The target DOM element.
 * @param {Object} newProps - The updated properties.
 * @param {Object} [oldProps={}] - The previous properties for diffing.
 */
export const patchProps = (el,newProps = {},oldProps = {}) => {
    const all = { ...oldProps,...newProps };
    for (let key in all) {
        if (newProps[key] !== oldProps[key]) {
            patchProp(el,key,newProps[key],oldProps[key]);
        }
    }
};

/**
 * Synchronizes a single property/attribute between the VNode and the real DOM.
 * Handles event delegation, style objects/strings, and boolean attributes.
 *
 * @param {HTMLElement} el - The target DOM element.
 * @param {string} key - The property name (e.g., 'class', 'onclick', 'style').
 * @param {any} next - The new value to apply.
 * @param {any} prev - The previous value for diffing and cleanup.
 */
export const patchProp = (el,key,next,prev) => {
    if (key.startsWith('on')) {
        const name = key.slice(2).toLowerCase();
        if (prev) el.removeEventListener(name,prev);
        if (next) el.addEventListener(name,next);
    } else if (key === 'style') {
        if (typeof next === 'string') {
            el.style.cssText = next;
        } else {
            // Reset styles before applying object to prevent property bleeding
            el.style.cssText = '';
            if (next) Object.assign(el.style,next);
        }
    } else if (key in el && key !== 'list' && key !== 'form') {
        // Handle value, checked, selected directly
        el[key] = next == null ? '' : next;
    } else if (next == null || next === false) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key,next === true ? '' : next);
    }
};

/**
 * The core reconciliation engine. Diffs two VNodes and patches the real DOM.
 *
 * @param {HTMLElement} parent - The container DOM element.
 * @param {Object} newNode - The new VNode to render.
 * @param {Object} oldNode - The previous VNode to diff against.
 * @param {number} [index=0] - The child index in the parent.
 */
export const patch = (parent, newNode, oldNode, index = 0) => {
    const target = parent.childNodes[index];

    // no new node, remove existing
    if (newNode == null) {return target && parent.removeChild(target);}

    // no target, append new element
    if (!target) {return parent.appendChild(createElement(newNode));}

    const isNewObj = typeof newNode === 'object';
    const isOldObj = typeof oldNode === 'object';

    // if types, tags, or keys differ: replace
    if (isNewObj !== isOldObj || (isNewObj && (newNode?.tag !== oldNode?.tag || newNode.props?.key !== oldNode.props?.key))) {
        return parent.replaceChild(createElement(newNode), target);
    }

    if (isNewObj) {
        patchProps(target, newNode.props, oldNode.props);
        const newC = newNode.children;
        const oldC = oldNode.children;
        const max = Math.max(newC.length, oldC.length);
        
        // fragments use parent , others use target
        const p = newNode.tag === 'fragment' ? parent : target;

        for (let i = 0; i < max; i++) { 
            // fix shifting indexs
            patch(p, newC[i], oldC[i], i >= newC.length ? newC.length : i); 
        }
    } else if (target.nodeValue !== newNode) {
        target.nodeValue = newNode;
    }
};

/**
 * Creates a reactive state container.
 *
 * @param {Object} initState - The initial state object.
 * @param {boolean} [logger=false] - Whether to log state updates to the console.
 * @returns {Object} An object containing getState, update, and subscribe methods.
 */
export const signal = (initState, logger = false) => {
    let state = { ...initState };
    const listeners = [];
    return {
        getState: () => state,
        update: (next) => {
            state = { ...state,...next };
            if (logger) console.log("State Update:",state);
            listeners.forEach(fn => fn(state));
        },
        subscribe: (fn) => listeners.push(fn)
    };
};

/**
 * Mounts a reactive view or router to a DOM selector.
 * 
 * @param {string} selector - The CSS selector for the root element.
 * @param {Object} options - Configuration options.
 * @param {Function} [options.view] - A single view function (state, update).
 * @param {Object.<string, Function>} [options.routes] - A mapping of paths to view functions.
 * @param {Object} [options.state={}] - Initial state or an existing signal instance.
 * 
 * @returns {Object} The signal instance used by the application.
 */
export const mount = (selector, view, state = {}, opts = {}) => {
    const container = document.querySelector(selector);
    const data = state?.subscribe ? state : signal(state || {});
    const routes = opts.routes;
    let oldVNode = null;

    const render = () => {
        const ctx = {
            state: data.getState(),
            update: data.update,
            params: {},
            content: null
        };

        if (routes) {
            const hash = window.location.hash;
            
            // bypass anchor links
            if (hash && !hash.startsWith("#/")) return;

            const path = hash.slice(1) || '/';
            let component = routes[path];

            if (!component) {
                for (const r in routes) {
                    if (r.includes(':')) {
                        const RE = new RegExp(`^${r.replace(/:[^\s/]+/g, '([^/]+)')}$`);
                        const match = path.match(RE);
                        if (match) {
                            component = routes[r];
                            const keys = r.match(/:[^\s/]+/g);
                            if (keys) {
                                keys.forEach((key, i) => ctx.params[key.substring(1)] = match[i + 1]);
                            }
                            break;
                        }
                    }
                }
            }
            
            const activeView = component || routes['404'];
            if (activeView) {
                ctx.content = activeView(ctx);
            }
        }

        // handle layout (view) content
        const finalVNode = (typeof view === 'function') ? view(ctx) : ctx.content;

        if (finalVNode) {
            patch(container, finalVNode, oldVNode, 0);
            oldVNode = finalVNode;
        }
    };

    data.subscribe(render);
    if (routes) window.addEventListener('hashchange', render);
    render();
    return data;
};