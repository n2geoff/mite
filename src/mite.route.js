import {signal, mount} from "./mite.js";

/**
 * Creates a hash-based router that delegates rendering to mount.
 * Handles dynamic params, 404 fallback, anchor link bypass, and layout wrapping.
 *
 * @param {String} selector - The CSS selector for the root element.
 * @param {Object} routes - A mapping of path strings to view functions.
 * @param {Object} [state={}] - Initial state object or an existing signal instance.
 * @param {Object} [opts={}] - Configuration options.
 * @param {Function} [opts.layout] - Optional layout function wrapping routed content.
 * @param {String} [opts.fallback='/404'] - Default path when no route matches.
 * @returns {Object} The signal instance used by the application.
 */
export const route = (selector, routes, state = {}, opts = {}) => {
    const matchRoute = (path) => {
        // exact match first
        if (routes[path]) {
            return { component: routes[path], params: {} };
        }

        // dynamic param matching
        for (const r in routes) {
            if (r.includes(':')) {
                const RE = new RegExp(`^${r.replace(/:[^\s/]+/g, '([^/]+)')}$`);
                const match = path.match(RE);
                if (match) {
                    const keys = r.match(/:[^\s/]+/g);
                    const params = {};
                    if (keys) {
                        keys.forEach((key, i) => params[key.substring(1)] = match[i + 1]);
                    }
                    return { component: routes[r], params };
                }
            }
        }

        // 404 fallback
        return { component: routes['404'], params: {} };
    };

    // routing view passed to mount — resolves hash → component on every render
    const routingView = (ctx) => {
        const hash = window.location.hash;

        // bypass anchor links (non-routed hashes)
        if (hash && !hash.startsWith('#/')) return ctx.content;

        const path = hash.slice(1) || '/';
        const { component, params } = matchRoute(path);

        ctx.params = params;
        ctx.content = component ? component(ctx) : null;

        // layout wrapping
        return opts.layout ? opts.layout(ctx) : ctx.content;
    };

    // always use a signal so route can trigger re-renders on hashchange
    const data = state?.subscribe ? state : signal(state || {});

    // on hashchange, update the signal to trigger mount's render cycle
    window.addEventListener('hashchange', () => {
        data.update({ _r: (data.val()._r || 0) + 1 });
    });

    return mount(selector, routingView, data);
};