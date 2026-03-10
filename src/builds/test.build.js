/** 
 * Test Current Build
 * 
 * Provides an export of every internal function, so that
 * tests can be written against.
 * 
 * Prevents over exportation of other builds
 **/
import {h, mount, signal, patch, patchProps, patchProp, createElement} from "../mite.js";
import xhtm from "../xhtm.js";

export {http} from "../mite.http.js";
export {dom as $} from "../mite.dom.js";
export {local, session, cookie} from "../mite.store.js";

export const html = xhtm.bind(h);

export {h, mount, signal, patch, patchProps, patchProp, createElement}
