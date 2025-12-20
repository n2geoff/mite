/**
 * Mite.js - A Minimalist's SPA framework
 * @module Mite
 */

/**
 * Creates a virtual node (VNode).
 *
 * @param {string} tag - The HTML tag name or 'fragment'.
 * @param {Object} [props={}] - Attributes, event listeners, and lifecycle hooks.
 * @param {...(Object|string|number)} children - Child VNodes or text content.
 * @returns {Object} The VNode representation.
 */
export const h = (tag,props = {},...children) => ({
    tag: tag || 'fragment',
    props: props || {},
    children: children.flat().filter(c => c !== null && c !== undefined && c !== false)
});

/**
 * Parses a tagged template literal into a VNode tree.
 * Supports event binding, keyed lists, and style objects.
 *
 * @param {TemplateStringsArray} strings - The static parts of the template.
 * @param {...any} values - The dynamic expressions in the template.
 * @returns {Object} A single VNode or a fragment.
 */
export const html = (strings,...values) => {
    const rawHtml = strings.reduce((acc,str,i) => {
        const val = values[i];
        let placeholder = "";

        if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
                placeholder = `__ARR_${i}__`;
            } else if (typeof val === 'object' || typeof val === 'function') {
                placeholder = `__VAL_${i}__`;
            } else {
                placeholder = val;
            }
        }
        return acc + str + placeholder;
    },"");

    const template = document.createElement('template');
    template.innerHTML = rawHtml.trim();
    const fragment = template.content;

    const domToVNode = (node) => {
        if (node.nodeType === 3) {
            const text = node.textContent;
            const arrMatch = text.match(/__ARR_(\d+)__/);
            if (arrMatch) return values[parseInt(arrMatch[1])];
            const valMatch = text.match(/__VAL_(\d+)__/);
            if (valMatch) return values[parseInt(valMatch[1])];
            return text;
        }

        if (node.nodeType === 1) {
            const props = {};
            const tag = node.tagName.toLowerCase();

            Array.from(node.attributes).forEach(attr => {
                const name = attr.name;
                let val = attr.value;
                const valMatch = val.match(/__VAL_(\d+)__/);

                if (valMatch) {
                    val = values[parseInt(valMatch[1])];
                }

                props[name === 'class' ? 'class' : name] = val;
            });

            const children = Array.from(node.childNodes)
                .map(domToVNode)
                .flat()
                .filter(c => c !== null);

            return h(tag,props,...children);
        }
        return null;
    };

    return fragment.childNodes.length === 1
        ? domToVNode(fragment.firstChild)
        : h('fragment',{},...Array.from(fragment.childNodes).map(domToVNode).flat());
};

/**
 * Synchronizes DOM attributes, styles, and event listeners.
 *
 * @param {HTMLElement} el - The target DOM element.
 * @param {Object} newProps - The updated properties.
 * @param {Object} [oldProps={}] - The previous properties for diffing.
 */
export const patchProps = (el,newProps,oldProps = {}) => {
    if (!el || el.nodeType !== 1) return;
    const allProps = { ...oldProps,...newProps };
    for (let key in allProps) {
        const next = newProps[key];
        const prev = oldProps[key];
        if (next === prev || key === 'key' || key === 'oncreate') continue;

        if (key.startsWith('on')) {
            const name = key.substring(2).toLowerCase();
            if (prev) el.removeEventListener(name,prev);
            if (next) el.addEventListener(name,next);
        } else if (key === 'style' && typeof next === 'object') {
            Object.assign(el.style,next);
        } else if (key === 'value' || key === 'checked' || key === 'selected') {
            el[key] = next;
        } else {
            const name = (key === 'className') ? 'class' : key;
            // BOOLEAN FIX: If the value is falsy, remove the attribute entirely
            if (next === false || next == null) {
                el.removeAttribute(name);
            } else {
                el.setAttribute(name,next === true ? '' : next);
            }
        }
    }
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
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }

    if (vnode.tag === 'fragment') {
        const frag = document.createDocumentFragment();
        vnode.children.forEach(child => frag.appendChild(createElement(child,isSVG)));
        return frag;
    }

    // SVG support
    const svgMode = isSVG || vnode.tag === 'svg';
    const el = svgMode
        ? document.createElementNS("http://www.w3.org/2000/svg",vnode.tag)
        : document.createElement(vnode.tag);

    patchProps(el,vnode.props);
    vnode.children.forEach(child => el.appendChild(createElement(child,svgMode)));

    // oncreate lifecycle Hook
    if (vnode.props?.oncreate) {
        setTimeout(() => vnode.props.oncreate(el),0);
    }

    return el;
};

/**
 * The core reconciliation engine. Diffs two VNodes and patches the real DOM.
 *
 * @param {HTMLElement} parent - The container DOM element.
 * @param {Object} newNode - The new VNode to render.
 * @param {Object} oldNode - The previous VNode to diff against.
 * @param {number} [index=0] - The child index in the parent.
 */
export const patch = (parent,newNode,oldNode,index = 0) => {
    if (!parent) return;
    const target = parent.childNodes[index];

    if (newNode === undefined) {
        if (target) parent.removeChild(target);
        return;
    }

    if (!target) {
        parent.appendChild(createElement(newNode));
        return;
    }

    // strict node check
    const isNewText = typeof newNode === 'string' || typeof newNode === 'number';
    const isOldText = typeof oldNode === 'string' || typeof oldNode === 'number';

    if (isNewText || isOldText) {
        if (newNode !== oldNode) {
            if (isNewText && isOldText && target.nodeType === 3) {
                target.nodeValue = newNode;
            } else {
                parent.replaceChild(createElement(newNode),target);
            }
        }
        return;
    }

    if (newNode.tag !== oldNode?.tag || newNode.props?.key !== oldNode?.props?.key) {
        parent.replaceChild(createElement(newNode),target);
        return;
    }

    if (newNode.tag) {
        if (newNode.tag !== 'fragment') {
            patchProps(target,newNode.props,oldNode?.props || {});
        }

        const newChildren = newNode.children || [];
        const oldChildren = oldNode?.children || [];
        const max = Math.max(newChildren.length,oldChildren.length);
        const childParent = newNode.tag === 'fragment' ? parent : target;

        for (let i = 0;i < max;i++) {
            patch(childParent,newChildren[i],oldChildren[i],i);
        }
    }
};

/**
 * Creates a reactive state container.
 *
 * @param {Object} initState - The initial state object.
 * @param {boolean} [logger=false] - Whether to log state updates to the console.
 * @returns {Object} An object containing getState, update, and subscribe methods.
 */
export const createStore = (initState,logger = false) => {
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


export const ensureStore = (stateOrStore) => (stateOrStore?.subscribe ? stateOrStore : createStore(stateOrStore || {}));

/**
 * Mounts a reactive view to a DOM selector.
 *
 * @param {string} selector - The CSS selector for the root element.
 * @param {Function} view - A function (state, update) returning a VNode.
 * @param {Object} [stateOrStore={}] - Initial state or an existing Store instance.
 * @returns {Object} The store instance used by the application.
 */
export const mount = (selector,view,stateOrStore = {}) => {
    const container = document.querySelector(selector);
    const store = ensureStore(stateOrStore);
    let oldVNode = null;

    const render = () => {
        const newVNode = view(store.getState(),store.update);
        patch(container,newVNode,oldVNode,0);
        oldVNode = newVNode;
    };

    store.subscribe(render);
    render();
    return store;
};

/**
 * Utility function to updatebrowser's hash location for navigation.
 *
 * @param {string} path - The target path (e.g., '/home' or 'settings').
 */
export const navigate = (path) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
};

/**
 * A functional component for router-supported navigation links.
 * Automatically manages active classes based on the current hash.
 *
 * @param {Object} props - Properties including 'href' and 'class'.
 * @param {...any} children - Link content.
 * @returns {Object} An 'a' tag VNode.
 */
export const Link = (props,...children) => {
    const { href,...rest } = props;
    const currentPath = window.location.hash.slice(1) || '/';
    const targetPath = href.startsWith('#') ? href.slice(1) : href;
    const isActive = currentPath === targetPath;

    return h('a',{
        ...rest,
        href: `#${targetPath}`,
        class: `${props.class || ''} ${isActive ? 'active' : ''}`.trim()
    },...children);
};

/**
 * Initializes a parametric hash-based router.
 * Matches routes to components and passes URL parameters.
 *
 * @param {string} selector - The CSS selector for the router outlet.
 * @param {Object.<string, Function>} routes - A mapping of paths to view functions.
 * @param {Object} [stateOrStore={}] - Initial state or an existing Store instance.
 * @returns {Object} The store instance used by the router.
 */
export const router = (selector,routes,stateOrStore = {}) => {
    const container = document.querySelector(selector);
    // prevents hydration issues
    container.innerHTML = '';

    const store = ensureStore(stateOrStore);
    let oldVNode = null;

    const render = () => {
        // ignore anchor #
        const hash = window.location.hash;
        if (hash && !hash?.startsWith("#/")) { return; }

        const path = window.location.hash.slice(1) || '/';
        let component = routes[path],params = {};

        if (!component) {
            for (const route in routes) {
                if (route.includes(':')) {
                    const routeRegex = new RegExp(`^${route.replace(/:[^\s/]+/g,'([^/]+)')}$`);
                    const match = path.match(routeRegex);
                    if (match) {
                        component = routes[route];
                        const keys = route.match(/:[^\s/]+/g);
                        keys.forEach((key,i) => params[key.substring(1)] = match[i + 1]);
                        break;
                    }
                }
            }
        }

        const view = component || routes['404'];
        if (view) {
            const newVNode = view(store.getState(),store.update,params);
            // We ALWAYS patch at index 0 because a SPA is one root component
            patch(container,newVNode,oldVNode,0);
            oldVNode = newVNode;
        }
    };

    store.subscribe(render);
    window.addEventListener('hashchange',render);
    render();
    return store;
};