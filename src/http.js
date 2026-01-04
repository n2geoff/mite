/**
 * Mite.Http - A Minimalist's Fetch Wrapper
 * 
 * @module Mite.Http
 * 
 * @author Geoff Doty
 * @version 1.0
 * @license MIT
 * @source http://github.com/n2geoff/mite
 */

/**
 * Makes an HTTP request using fetch with automatic JSON handling
 * 
 * @private
 * @function request
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Fetch options to extend the request
 * @param {Object} [options.headers] - HTTP headers to include
 * @param {string} [options.method] - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} [options.body] - Request body (will be JSON stringified if present)
 * 
 * @throws {Error} Throws an error with message from response data or status text
 * 
 * @returns {Promise<any>} Promise resolving to the parsed JSON response or null for 204 status
 */
const request = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Automatically parse JSON, but handle empty responses safely
    const data = response.status !== 204 ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.message || response.statusText);
    }

    return data;
};

export const http = {
    get : (url, opts) => request(url, { ...opts, method: 'GET' }),
    post: (url, body, opts) => request(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
    put : (url, body, opts) => request(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
    del : (url, opts) => request(url, { ...opts, method: 'DELETE' }),
};