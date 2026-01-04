/**
 * Mite.Dom - A Minimalist's DOM Helper
 * 
 * A lightweight DOM manipulation utility that provides a fluent interface
 * for selecting elements, handling events, and working with form data.
 * 
 * @module Mite.Dom
 * @author Geoff Doty
 * @version 1.0
 * @license MIT
 * @source http://github.com/n2geoff/mite
 * 
 * @param {string|Element|Element[]} selector - CSS selector string, DOM element, or array of elements
 * @param {Document|Element} [context=document] - Context for element selection
 * 
 * @returns {Object} DOM helper instance with fluent API methods
 */
export const dom = (selector, context = document) => {
    const elements = typeof selector === 'string' 
        ? Array.from(context.querySelectorAll(selector))
        : [selector].flat();

    return {
        // raw elements
        el: elements,
        
        on(event, handler, opts) {
            elements.forEach(el => el.addEventListener(event, handler, opts));
            return this;
        },

        off(event, handler, opts) {
            elements.forEach(el => el.removeEventListener(event, handler, opts));
            return this;
        },

        // Form/Value Helpers
        val(newValue) {
            if (newValue !== undefined) {
                elements.forEach(el => el.value = newValue);
                return this;
            }
            return elements[0]?.value;
        },

        toggle(cls) {
            elements.forEach(el => el.classList.toggle(cls));
            return this;
        },
        data() {
            const form = elements[0];
            if (form?.tagName !== 'FORM') return {};
            const data = new FormData(form);
            return Object.fromEntries(data.entries());
        },
        validate(onInvalid) {
            const form = elements[0];
            if (!form || form.tagName !== 'FORM') return true;

            const isValid = form.checkValidity();

            if (!isValid && typeof onInvalid === 'function') {
                const fields = Array.from(form.elements).filter(el => !el.checkValidity());
                onInvalid(fields);
            }

            return isValid;
        }
    };
};
