
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.22.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (207:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*componentParams*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(207:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(route, userData, ...conditions) {
    	// Check if we don't have userData
    	if (userData && typeof userData == "function") {
    		conditions = conditions && conditions.length ? conditions : [];
    		conditions.unshift(userData);
    		userData = undefined;
    	}

    	// Parameter route and each item of conditions must be functions
    	if (!route || typeof route != "function") {
    		throw Error("Invalid parameter route");
    	}

    	if (conditions && conditions.length) {
    		for (let i = 0; i < conditions.length; i++) {
    			if (!conditions[i] || typeof conditions[i] != "function") {
    				throw Error("Invalid parameter conditions[" + i + "]");
    			}
    		}
    	}

    	// Returns an object that contains all the functions to execute too
    	const obj = { route, userData };

    	if (conditions && conditions.length) {
    		obj.conditions = conditions;
    	}

    	// The _sveltesparouter flag is to confirm the object was created by this router
    	Object.defineProperty(obj, "_sveltesparouter", { value: true });

    	return obj;
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    	});
    }

    function pop() {
    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.history.back();
    	});
    }

    function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    		try {
    			window.history.replaceState(undefined, undefined, dest);
    		} catch(e) {
    			// eslint-disable-next-line no-console
    			console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    		}

    		// The method above doesn't trigger the hashchange event, so let's do that manually
    		window.dispatchEvent(new Event("hashchange"));
    	});
    }

    function link(node) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	// Destination must start with '/'
    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to every href attribute
    	node.setAttribute("href", "#" + href);
    }

    function nextTickPromise(cb) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					resolve(cb());
    				},
    				0
    			);
    		});
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.route;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    			} else {
    				this.component = component;
    				this.conditions = [];
    				this.userData = undefined;
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix && path.startsWith(prefix)) {
    				path = path.substr(prefix.length) || "/";
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				out[this._keys[i]] = matches[++i] || null;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {SvelteComponent} component - Svelte component
     * @property {string} name - Name of the Svelte component
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	const dispatchNextTick = (name, detail) => {
    		// Execute this code when the current call stack is complete
    		setTimeout(
    			() => {
    				dispatch(name, detail);
    			},
    			0
    		);
    	};

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		nextTickPromise,
    		createEventDispatcher,
    		regexparam,
    		routes,
    		prefix,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		dispatch,
    		dispatchNextTick,
    		$loc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			// Handle hash change events
    			// Listen to changes in the $loc store and update the page
    			 {
    				// Find a route matching the location
    				$$invalidate(0, component = null);

    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						// Check if the route can be loaded - if all conditions succeed
    						if (!routesList[i].checkConditions(detail)) {
    							// Trigger an event to notify the user
    							dispatchNextTick("conditionsFailed", detail);

    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);

    						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    						if (match && typeof match == "object" && Object.keys(match).length) {
    							$$invalidate(1, componentParams = match);
    						} else {
    							$$invalidate(1, componentParams = null);
    						}

    						dispatchNextTick("routeLoaded", detail);
    					}

    					i++;
    				}
    			}
    		}
    	};

    	return [
    		component,
    		componentParams,
    		routes,
    		prefix,
    		$loc,
    		RouteItem,
    		routesList,
    		dispatch,
    		dispatchNextTick,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (Array.isArray(mix)) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules\sveltestrap\src\Table.svelte generated by Svelte v3.22.2 */
    const file = "node_modules\\sveltestrap\\src\\Table.svelte";

    // (38:0) {:else}
    function create_else_block$1(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file, 38, 2, 908);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if responsive}
    function create_if_block$1(ctx) {
    	let div;
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file, 33, 4, 826);
    			attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			add_location(div, file, 32, 2, 788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));

    			if (!current || dirty & /*responsiveClassName*/ 4) {
    				attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(32:0) {#if responsive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*responsive*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { size = "" } = $$props;
    	let { bordered = false } = $$props;
    	let { borderless = false } = $$props;
    	let { striped = false } = $$props;
    	let { dark = false } = $$props;
    	let { hover = false } = $$props;
    	let { responsive = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$new_props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$new_props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$new_props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$new_props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$new_props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$new_props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		responsive,
    		props,
    		classes,
    		responsiveClassName
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("responsiveClassName" in $$props) $$invalidate(2, responsiveClassName = $$new_props.responsiveClassName);
    	};

    	let classes;
    	let responsiveClassName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, size, bordered, borderless, striped, dark, hover*/ 2032) {
    			 $$invalidate(1, classes = clsx(className, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, dark ? "table-dark" : false, hover ? "table-hover" : false));
    		}

    		if ($$self.$$.dirty & /*responsive*/ 1) {
    			 $$invalidate(2, responsiveClassName = responsive === true
    			? "table-responsive"
    			: `table-responsive-${responsive}`);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		responsive,
    		classes,
    		responsiveClassName,
    		props,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 4,
    			size: 5,
    			bordered: 6,
    			borderless: 7,
    			striped: 8,
    			dark: 9,
    			hover: 10,
    			responsive: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bordered() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bordered(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Button.svelte generated by Svelte v3.22.2 */
    const file$1 = "node_modules\\sveltestrap\\src\\Button.svelte";

    // (53:0) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let button_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file$1, 53, 2, 1061);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[21], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*close, children, $$scope*/ 262147) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*value*/ 64 && { value: /*value*/ ctx[6] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (37:0) {#if href}
    function create_if_block$2(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ href: /*href*/ ctx[3] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$1, 37, 2, 825);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[20], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*href*/ 8 && { href: /*href*/ ctx[3] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (68:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(68:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (66:25) 
    function create_if_block_3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (64:6) {#if close}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$1, 64, 8, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (63:10)        
    function fallback_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[1]) return 0;
    		if (/*children*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(63:10)        ",
    		ctx
    	});

    	return block_1;
    }

    // (49:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (47:4) {#if children}
    function create_if_block_1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(47:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { disabled = false } = $$props;
    	let { href = "" } = $$props;
    	let { id = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$new_props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		active,
    		block,
    		children,
    		close,
    		color,
    		disabled,
    		href,
    		id,
    		outline,
    		size,
    		style,
    		value,
    		props,
    		ariaLabel,
    		classes,
    		defaultAriaLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(11, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(9, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(7, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, outline, color, size, block, active*/ 129026) {
    			 $$invalidate(8, classes = clsx(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active }));
    		}

    		if ($$self.$$.dirty & /*close*/ 2) {
    			 $$invalidate(9, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		close,
    		disabled,
    		href,
    		id,
    		style,
    		value,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		props,
    		className,
    		active,
    		block,
    		color,
    		outline,
    		size,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 11,
    			active: 12,
    			block: 13,
    			children: 0,
    			close: 1,
    			color: 14,
    			disabled: 2,
    			href: 3,
    			id: 4,
    			outline: 15,
    			size: 16,
    			style: 5,
    			value: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\ImportsGUI\ImportsTable.svelte generated by Svelte v3.22.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\front\\ImportsGUI\\ImportsTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>  import {   onMount  }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import {   onMount  }",
    		ctx
    	});

    	return block;
    }

    // (156:1) {:then imports}
    function create_then_block(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, up, offset, imports, newImport*/ 33554471) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(156:1) {:then imports}",
    		ctx
    	});

    	return block;
    }

    // (179:10) <Button outline  color="primary" on:click={insertImport}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insertar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(179:10) <Button outline  color=\\\"primary\\\" on:click={insertImport}>",
    		ctx
    	});

    	return block;
    }

    // (180:6) <Button outline  color="success" on:click={getsearch}>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Busqueda");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(180:6) <Button outline  color=\\\"success\\\" on:click={getsearch}>",
    		ctx
    	});

    	return block;
    }

    // (193:10) <Button outline color="danger" on:click="{deleteImport(imported.country,imported.year)}">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(193:10) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteImport(imported.country,imported.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (184:4) {#each imports as imported}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*imported*/ ctx[22].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*imported*/ ctx[22].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*imported*/ ctx[22].gdamalt + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*imported*/ ctx[22].gdabarley + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*imported*/ ctx[22].gdaoat + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*imported*/ ctx[22].gdawaste + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*imported*/ ctx[22].gdaethylalcohol + "";
    	let t12;
    	let t13;
    	let td7;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deleteImport*/ ctx[9](/*imported*/ ctx[22].country, /*imported*/ ctx[22].year))) /*deleteImport*/ ctx[9](/*imported*/ ctx[22].country, /*imported*/ ctx[22].year).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", a_href_value = "#/import/" + /*imported*/ ctx[22].country + "/" + /*imported*/ ctx[22].year);
    			add_location(a, file$2, 185, 10, 4876);
    			add_location(td0, file$2, 185, 6, 4872);
    			add_location(td1, file$2, 186, 6, 4964);
    			add_location(td2, file$2, 187, 6, 4995);
    			add_location(td3, file$2, 188, 6, 5029);
    			add_location(td4, file$2, 189, 6, 5065);
    			add_location(td5, file$2, 190, 6, 5098);
    			add_location(td6, file$2, 191, 6, 5133);
    			add_location(td7, file$2, 192, 6, 5175);
    			add_location(tr, file$2, 184, 5, 4861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			mount_component(button, td7, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*imports*/ 32) && t0_value !== (t0_value = /*imported*/ ctx[22].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*imports*/ 32 && a_href_value !== (a_href_value = "#/import/" + /*imported*/ ctx[22].country + "/" + /*imported*/ ctx[22].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*imports*/ 32) && t2_value !== (t2_value = /*imported*/ ctx[22].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*imports*/ 32) && t4_value !== (t4_value = /*imported*/ ctx[22].gdamalt + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*imports*/ 32) && t6_value !== (t6_value = /*imported*/ ctx[22].gdabarley + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*imports*/ 32) && t8_value !== (t8_value = /*imported*/ ctx[22].gdaoat + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*imports*/ 32) && t10_value !== (t10_value = /*imported*/ ctx[22].gdawaste + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*imports*/ 32) && t12_value !== (t12_value = /*imported*/ ctx[22].gdaethylalcohol + "")) set_data_dev(t12, t12_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(184:4) {#each imports as imported}",
    		ctx
    	});

    	return block;
    }

    // (198:6) {#if offset != 0}
    function create_if_block_3$1(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				color: "secondary",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*offsetDown*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(198:6) {#if offset != 0}",
    		ctx
    	});

    	return block;
    }

    // (199:6) <Button color="secondary" on:click="{offsetDown}">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("<");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(199:6) <Button color=\\\"secondary\\\" on:click=\\\"{offsetDown}\\\">",
    		ctx
    	});

    	return block;
    }

    // (201:6) {#if up == true}
    function create_if_block_2$1(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				color: "secondary",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*offsetUp*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(201:6) {#if up == true}",
    		ctx
    	});

    	return block;
    }

    // (202:6) <Button color="secondary" on:click="{offsetUp}">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(">");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(202:6) <Button color=\\\"secondary\\\" on:click=\\\"{offsetUp}\\\">",
    		ctx
    	});

    	return block;
    }

    // (206:6) <Button color="success" on:click="{getImports}">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar Todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(206:6) <Button color=\\\"success\\\" on:click=\\\"{getImports}\\\">",
    		ctx
    	});

    	return block;
    }

    // (208:49) <Button color="danger" on:click="{deleteAllImport}">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar Todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(208:49) <Button color=\\\"danger\\\" on:click=\\\"{deleteAllImport}\\\">",
    		ctx
    	});

    	return block;
    }

    // (157:2) <Table bordered>
    function create_default_slot(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t16;
    	let td1;
    	let input1;
    	let t17;
    	let td2;
    	let input2;
    	let t18;
    	let td3;
    	let input3;
    	let t19;
    	let td4;
    	let input4;
    	let t20;
    	let td5;
    	let input5;
    	let t21;
    	let td6;
    	let input6;
    	let t22;
    	let td7;
    	let t23;
    	let t24;
    	let t25;
    	let tr2;
    	let td8;
    	let t26;
    	let t27;
    	let td9;
    	let t28;
    	let td10;
    	let current;
    	let dispose;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*insertImport*/ ctx[8]);

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*getsearch*/ ctx[7]);
    	let each_value = /*imports*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block0 = /*offset*/ ctx[0] != 0 && create_if_block_3$1(ctx);
    	let if_block1 = /*up*/ ctx[1] == true && create_if_block_2$1(ctx);

    	const button2 = new Button({
    			props: {
    				color: "success",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*getImports*/ ctx[6]);

    	const button3 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*deleteAllImport*/ ctx[10]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Malta";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Cebada";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Avena";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Residuos";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Alcohol";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Acciones";
    			t15 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t16 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t17 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t18 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t19 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t20 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t21 = space();
    			td6 = element("td");
    			input6 = element("input");
    			t22 = space();
    			td7 = element("td");
    			create_component(button0.$$.fragment);
    			t23 = space();
    			create_component(button1.$$.fragment);
    			t24 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			tr2 = element("tr");
    			td8 = element("td");
    			if (if_block0) if_block0.c();
    			t26 = space();
    			if (if_block1) if_block1.c();
    			t27 = space();
    			td9 = element("td");
    			create_component(button2.$$.fragment);
    			t28 = space();
    			td10 = element("td");
    			create_component(button3.$$.fragment);
    			add_location(th0, file$2, 159, 5, 4044);
    			add_location(th1, file$2, 160, 5, 4063);
    			add_location(th2, file$2, 161, 5, 4081);
    			add_location(th3, file$2, 162, 5, 4101);
    			add_location(th4, file$2, 163, 5, 4122);
    			add_location(th5, file$2, 164, 5, 4142);
    			add_location(th6, file$2, 165, 5, 4165);
    			add_location(th7, file$2, 166, 5, 4187);
    			add_location(tr0, file$2, 158, 4, 4034);
    			add_location(thead, file$2, 157, 3, 4022);
    			add_location(input0, file$2, 171, 9, 4256);
    			add_location(td0, file$2, 171, 5, 4252);
    			add_location(input1, file$2, 172, 9, 4311);
    			add_location(td1, file$2, 172, 5, 4307);
    			add_location(input2, file$2, 173, 9, 4363);
    			add_location(td2, file$2, 173, 5, 4359);
    			add_location(input3, file$2, 174, 9, 4418);
    			add_location(td3, file$2, 174, 5, 4414);
    			add_location(input4, file$2, 175, 9, 4475);
    			add_location(td4, file$2, 175, 5, 4471);
    			add_location(input5, file$2, 176, 9, 4529);
    			add_location(td5, file$2, 176, 5, 4525);
    			add_location(input6, file$2, 177, 9, 4585);
    			add_location(td6, file$2, 177, 5, 4581);
    			add_location(td7, file$2, 178, 5, 4644);
    			add_location(tr1, file$2, 170, 4, 4242);
    			set_style(td8, "text-align", "center");
    			attr_dev(td8, "colspan", "4");
    			add_location(td8, file$2, 196, 5, 5326);
    			set_style(td9, "text-align", "center");
    			attr_dev(td9, "colspan", "2");
    			add_location(td9, file$2, 204, 5, 5596);
    			set_style(td10, "text-align", "center");
    			attr_dev(td10, "colspan", "2");
    			add_location(td10, file$2, 207, 5, 5732);
    			add_location(tr2, file$2, 195, 4, 5316);
    			add_location(tbody, file$2, 169, 3, 4230);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newImport*/ ctx[2].country);
    			append_dev(tr1, t16);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newImport*/ ctx[2].year);
    			append_dev(tr1, t17);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newImport*/ ctx[2].gdamalt);
    			append_dev(tr1, t18);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newImport*/ ctx[2].gdabarley);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newImport*/ ctx[2].gdaoat);
    			append_dev(tr1, t20);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newImport*/ ctx[2].gdawaste);
    			append_dev(tr1, t21);
    			append_dev(tr1, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*newImport*/ ctx[2].gdaethylalcohol);
    			append_dev(tr1, t22);
    			append_dev(tr1, td7);
    			mount_component(button0, td7, null);
    			append_dev(td7, t23);
    			mount_component(button1, td7, null);
    			append_dev(tbody, t24);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t25);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td8);
    			if (if_block0) if_block0.m(td8, null);
    			append_dev(td8, t26);
    			if (if_block1) if_block1.m(td8, null);
    			append_dev(tr2, t27);
    			append_dev(tr2, td9);
    			mount_component(button2, td9, null);
    			append_dev(tr2, t28);
    			append_dev(tr2, td10);
    			mount_component(button3, td10, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[17]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[18]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[19]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[20]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[21])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newImport*/ 4 && input0.value !== /*newImport*/ ctx[2].country) {
    				set_input_value(input0, /*newImport*/ ctx[2].country);
    			}

    			if (dirty & /*newImport*/ 4 && input1.value !== /*newImport*/ ctx[2].year) {
    				set_input_value(input1, /*newImport*/ ctx[2].year);
    			}

    			if (dirty & /*newImport*/ 4 && input2.value !== /*newImport*/ ctx[2].gdamalt) {
    				set_input_value(input2, /*newImport*/ ctx[2].gdamalt);
    			}

    			if (dirty & /*newImport*/ 4 && input3.value !== /*newImport*/ ctx[2].gdabarley) {
    				set_input_value(input3, /*newImport*/ ctx[2].gdabarley);
    			}

    			if (dirty & /*newImport*/ 4 && input4.value !== /*newImport*/ ctx[2].gdaoat) {
    				set_input_value(input4, /*newImport*/ ctx[2].gdaoat);
    			}

    			if (dirty & /*newImport*/ 4 && input5.value !== /*newImport*/ ctx[2].gdawaste) {
    				set_input_value(input5, /*newImport*/ ctx[2].gdawaste);
    			}

    			if (dirty & /*newImport*/ 4 && input6.value !== /*newImport*/ ctx[2].gdaethylalcohol) {
    				set_input_value(input6, /*newImport*/ ctx[2].gdaethylalcohol);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (dirty & /*deleteImport, imports*/ 544) {
    				each_value = /*imports*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, t25);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*offset*/ ctx[0] != 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*offset*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(td8, t26);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*up*/ ctx[1] == true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*up*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(td8, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(button2);
    			destroy_component(button3);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(157:2) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (154:17)    Loading imports...  {:then imports}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading imports...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(154:17)    Loading imports...  {:then imports}",
    		ctx
    	});

    	return block;
    }

    // (213:1) {#if errorMsg}
    function create_if_block_1$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*errorMsg*/ ctx[3]);
    			set_style(p, "color", "red");
    			add_location(p, file$2, 213, 1, 5914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 8) set_data_dev(t, /*errorMsg*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(213:1) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    // (216:1) {#if correctMsg}
    function create_if_block$3(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*correctMsg*/ ctx[4]);
    			set_style(p, "color", "green");
    			add_location(p, file$2, 216, 1, 5977);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*correctMsg*/ 16) set_data_dev(t, /*correctMsg*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(216:1) {#if correctMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let promise;
    	let t0;
    	let t1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*imports*/ ctx[5], info);
    	let if_block0 = /*errorMsg*/ ctx[3] && create_if_block_1$1(ctx);
    	let if_block1 = /*correctMsg*/ ctx[4] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file$2, 151, 0, 3936);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t0;
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*imports*/ 32 && promise !== (promise = /*imports*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*errorMsg*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*correctMsg*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let limit = 10;
    	let offset = 0;
    	let up = true;
    	let imports = [];

    	let newImport = {
    		country: "",
    		year: 0,
    		gdamalt: 0,
    		gdabarley: 0,
    		gdaoat: 0,
    		gdawaste: 0,
    		gdaethylalcohol: 0
    	};

    	let errorMsg = "";
    	let correctMsg = "";
    	let search = false;
    	onMount(getImports);

    	async function getImports() {
    		console.log("Fetching contacts...");
    		const res = await fetch("/api/v2/imports?offset= " + offset + "&limit=" + limit);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(5, imports = json);
    			search = false;

    			if (imports.length < limit) {
    				$$invalidate(1, up = false);
    			} else {
    				$$invalidate(1, up = true);
    			}

    			
    			console.log("Received " + imports.length + " contacts.");
    		} else {
    			$$invalidate(3, errorMsg = "Su busqueda no es válida");
    			console.log("ERROR!" + errorMsg);
    		}
    	}

    	async function getsearch() {
    		let busqueda = "";

    		if (newImport.year != 0) {
    			busqueda = busqueda + "&year=" + newImport.year;
    		}

    		

    		if (newImport.country != "") {
    			busqueda = busqueda + "&country=" + newImport.country;
    		}

    		

    		if (newImport.gdamalt != 0) {
    			busqueda = busqueda + "&gdamalt=" + newImport.gdamalt;
    		}

    		

    		if (newImport.gdabarley != 0) {
    			busqueda = busqueda + "&gdabarley=" + newImport.gdabarley;
    		}

    		

    		if (newImport.gdaoat != 0) {
    			busqueda = busqueda + "&gdaoat=" + newImport.gdaoat;
    		}

    		

    		if (newImport.gdawaste != 0) {
    			busqueda = busqueda + "&year=" + newImport.gdawaste;
    		}

    		

    		if (newImport.gdaethylalcohol != 0) {
    			busqueda = busqueda + "&year=" + newImport.gdaethylalcohol;
    		}

    		
    		const res = await fetch("/api/v2/imports?offset= " + offset + "&limit=" + limit + busqueda);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(5, imports = json);
    			search = true;

    			if (imports.length < limit) {
    				$$invalidate(1, up = false);
    			} else {
    				$$invalidate(1, up = true);
    			}

    			
    			console.log("Received " + imports.length + " contacts.");
    			$$invalidate(3, errorMsg = "");
    			$$invalidate(4, correctMsg = "");
    		} else {
    			$$invalidate(3, errorMsg = "Su busqueda no es válida");
    			$$invalidate(4, correctMsg = "");
    			console.log("ERROR!" + errorMsg);
    		}
    	}

    	async function insertImport() {
    		console.log("Inserting Import..." + JSON.stringify(newImport));
    		$$invalidate(2, newImport.year = parseInt(newImport.year), newImport);
    		($$invalidate(2, newImport.gdamalt = parseFloat(newImport.gdamalt), newImport), $$invalidate(2, newImport.gdabarley = parseFloat(newImport.gdabarley), newImport), $$invalidate(2, newImport.gdaoat = parseFloat(newImport.gdaoat), newImport), $$invalidate(2, newImport.gdawaste = parseFloat(newImport.gdawaste), newImport), $$invalidate(2, newImport.gdaethylalcohol = parseFloat(newImport.gdaethylalcohol), newImport));

    		const res = await fetch("/api/v2/imports", {
    			method: "POST",
    			body: JSON.stringify(newImport),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			if (res.ok) {
    				getImports();
    				$$invalidate(4, correctMsg = "Se ha insertado el elemento Correctamente");
    				$$invalidate(3, errorMsg = "");
    			} else {
    				$$invalidate(3, errorMsg = "No se pudo insertar el elemento Correctamente");
    				$$invalidate(4, correctMsg = "");
    			}
    		});
    	}

    	async function deleteImport(country, year) {
    		const res = await fetch("/api/v2/imports/" + country + "/" + year, { method: "DELETE" }).then(function (res) {
    			if (res.ok) {
    				getImports();
    				$$invalidate(4, correctMsg = "Se ha eliminado la importación con país: " + country + " y año: " + year);
    			} else {
    				$$invalidate(3, errorMsg = "No se pudo eliminar la importación con país: " + country + " y año: " + year);
    				
    			}
    		});
    	}

    	async function deleteAllImport() {
    		const res = await fetch("/api/v2/imports", { method: "DELETE" }).then(function (res) {
    			if (res.ok) {
    				getImports();
    				$$invalidate(3, errorMsg = "");
    				$$invalidate(4, correctMsg = "Se han eliminado todos los elementos");
    			} else {
    				$$invalidate(3, errorMsg = "No se pudieron eliminar todos los elementos");
    			}
    		});
    	}

    	function offsetUp() {
    		$$invalidate(0, offset = offset + limit);
    		$$invalidate(4, correctMsg = "");
    		$$invalidate(3, errorMsg = "");

    		if (search == true) {
    			getsearch();
    		} else {
    			getImports();
    		}

    		
    	}

    	function offsetDown() {
    		$$invalidate(0, offset = offset - limit);
    		$$invalidate(3, errorMsg = "");
    		$$invalidate(4, correctMsg = "");

    		if (search == true) {
    			getsearch();
    		} else {
    			getImports();
    		}

    		
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ImportsTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ImportsTable", $$slots, []);

    	function input0_input_handler() {
    		newImport.country = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input1_input_handler() {
    		newImport.year = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input2_input_handler() {
    		newImport.gdamalt = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input3_input_handler() {
    		newImport.gdabarley = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input4_input_handler() {
    		newImport.gdaoat = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input5_input_handler() {
    		newImport.gdawaste = this.value;
    		$$invalidate(2, newImport);
    	}

    	function input6_input_handler() {
    		newImport.gdaethylalcohol = this.value;
    		$$invalidate(2, newImport);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Table,
    		Button,
    		limit,
    		offset,
    		up,
    		imports,
    		newImport,
    		errorMsg,
    		correctMsg,
    		search,
    		getImports,
    		getsearch,
    		insertImport,
    		deleteImport,
    		deleteAllImport,
    		offsetUp,
    		offsetDown
    	});

    	$$self.$inject_state = $$props => {
    		if ("limit" in $$props) limit = $$props.limit;
    		if ("offset" in $$props) $$invalidate(0, offset = $$props.offset);
    		if ("up" in $$props) $$invalidate(1, up = $$props.up);
    		if ("imports" in $$props) $$invalidate(5, imports = $$props.imports);
    		if ("newImport" in $$props) $$invalidate(2, newImport = $$props.newImport);
    		if ("errorMsg" in $$props) $$invalidate(3, errorMsg = $$props.errorMsg);
    		if ("correctMsg" in $$props) $$invalidate(4, correctMsg = $$props.correctMsg);
    		if ("search" in $$props) search = $$props.search;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		offset,
    		up,
    		newImport,
    		errorMsg,
    		correctMsg,
    		imports,
    		getImports,
    		getsearch,
    		insertImport,
    		deleteImport,
    		deleteAllImport,
    		offsetUp,
    		offsetDown,
    		search,
    		limit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler
    	];
    }

    class ImportsTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImportsTable",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\front\ImportsGUI\EditImport.svelte generated by Svelte v3.22.2 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\front\\ImportsGUI\\EditImport.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (88:4) {:then imports}
    function create_then_block$1(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedgdaethylalcohol, updatedgdawaste, updatedgdaoat, updatedgdabarley, updatedgdamalt, updatedyear, updatedCountry*/ 262398) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(88:4) {:then imports}",
    		ctx
    	});

    	return block;
    }

    // (111:25) <Button outline  color="primary" on:click={updateImport}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(111:25) <Button outline  color=\\\"primary\\\" on:click={updateImport}>",
    		ctx
    	});

    	return block;
    }

    // (89:8) <Table bordered>
    function create_default_slot_1$1(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let tbody;
    	let tr1;
    	let td0;
    	let t16;
    	let t17;
    	let td1;
    	let t18;
    	let t19;
    	let td2;
    	let input0;
    	let t20;
    	let td3;
    	let input1;
    	let t21;
    	let td4;
    	let input2;
    	let t22;
    	let td5;
    	let input3;
    	let t23;
    	let td6;
    	let input4;
    	let t24;
    	let td7;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateImport*/ ctx[11]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Malta";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Cebada";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Avena";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Residuos";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Alcohol";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Acción";
    			t15 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t16 = text(/*updatedCountry*/ ctx[1]);
    			t17 = space();
    			td1 = element("td");
    			t18 = text(/*updatedyear*/ ctx[2]);
    			t19 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t20 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t21 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t22 = space();
    			td5 = element("td");
    			input3 = element("input");
    			t23 = space();
    			td6 = element("td");
    			input4 = element("input");
    			t24 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$3, 91, 20, 2946);
    			add_location(th1, file$3, 92, 5, 2966);
    			add_location(th2, file$3, 93, 5, 2985);
    			add_location(th3, file$3, 94, 5, 3006);
    			add_location(th4, file$3, 95, 5, 3028);
    			add_location(th5, file$3, 96, 5, 3049);
    			add_location(th6, file$3, 97, 20, 3088);
    			add_location(th7, file$3, 98, 20, 3126);
    			add_location(tr0, file$3, 90, 16, 2920);
    			add_location(thead, file$3, 89, 12, 2895);
    			add_location(td0, file$3, 103, 20, 3251);
    			add_location(td1, file$3, 104, 20, 3298);
    			add_location(input0, file$3, 105, 24, 3346);
    			add_location(td2, file$3, 105, 20, 3342);
    			add_location(input1, file$3, 106, 24, 3414);
    			add_location(td3, file$3, 106, 20, 3410);
    			add_location(input2, file$3, 107, 24, 3484);
    			add_location(td4, file$3, 107, 20, 3480);
    			add_location(input3, file$3, 108, 24, 3551);
    			add_location(td5, file$3, 108, 20, 3547);
    			add_location(input4, file$3, 109, 24, 3620);
    			add_location(td6, file$3, 109, 20, 3616);
    			add_location(td7, file$3, 110, 20, 3692);
    			add_location(tr1, file$3, 102, 16, 3225);
    			add_location(tbody, file$3, 101, 12, 3200);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td1);
    			append_dev(td1, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*updatedgdamalt*/ ctx[3]);
    			append_dev(tr1, t20);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*updatedgdabarley*/ ctx[4]);
    			append_dev(tr1, t21);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*updatedgdaoat*/ ctx[5]);
    			append_dev(tr1, t22);
    			append_dev(tr1, td5);
    			append_dev(td5, input3);
    			set_input_value(input3, /*updatedgdawaste*/ ctx[6]);
    			append_dev(tr1, t23);
    			append_dev(tr1, td6);
    			append_dev(td6, input4);
    			set_input_value(input4, /*updatedgdaethylalcohol*/ ctx[7]);
    			append_dev(tr1, t24);
    			append_dev(tr1, td7);
    			mount_component(button, td7, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[16]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[17])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updatedCountry*/ 2) set_data_dev(t16, /*updatedCountry*/ ctx[1]);
    			if (!current || dirty & /*updatedyear*/ 4) set_data_dev(t18, /*updatedyear*/ ctx[2]);

    			if (dirty & /*updatedgdamalt*/ 8 && input0.value !== /*updatedgdamalt*/ ctx[3]) {
    				set_input_value(input0, /*updatedgdamalt*/ ctx[3]);
    			}

    			if (dirty & /*updatedgdabarley*/ 16 && input1.value !== /*updatedgdabarley*/ ctx[4]) {
    				set_input_value(input1, /*updatedgdabarley*/ ctx[4]);
    			}

    			if (dirty & /*updatedgdaoat*/ 32 && input2.value !== /*updatedgdaoat*/ ctx[5]) {
    				set_input_value(input2, /*updatedgdaoat*/ ctx[5]);
    			}

    			if (dirty & /*updatedgdawaste*/ 64 && input3.value !== /*updatedgdawaste*/ ctx[6]) {
    				set_input_value(input3, /*updatedgdawaste*/ ctx[6]);
    			}

    			if (dirty & /*updatedgdaethylalcohol*/ 128 && input4.value !== /*updatedgdaethylalcohol*/ ctx[7]) {
    				set_input_value(input4, /*updatedgdaethylalcohol*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(89:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (86:20)           Loading contacts...      {:then imports}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading contacts...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(86:20)           Loading contacts...      {:then imports}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#if errorMsg}
    function create_if_block_1$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*errorMsg*/ ctx[8]);
    			set_style(p, "color", "red");
    			add_location(p, file$3, 116, 8, 3882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 256) set_data_dev(t, /*errorMsg*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(116:4) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#if correctMsg}
    function create_if_block$4(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*correctMsg*/ ctx[9]);
    			set_style(p, "color", "green");
    			add_location(p, file$3, 119, 5, 3958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*correctMsg*/ 512) set_data_dev(t, /*correctMsg*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(119:4) {#if correctMsg}",
    		ctx
    	});

    	return block;
    }

    // (122:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Atrás");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(122:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let h3;
    	let t0;
    	let strong;
    	let t1_value = /*params*/ ctx[0].country + "";
    	let t1;
    	let t2;
    	let t3_value = /*params*/ ctx[0].year + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let t6;
    	let t7;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*imports*/ ctx[10], info);
    	let if_block0 = /*errorMsg*/ ctx[8] && create_if_block_1$2(ctx);
    	let if_block1 = /*correctMsg*/ ctx[9] && create_if_block$4(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			t0 = text("Edit Contact ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = text("-");
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$3, 84, 21, 2731);
    			add_location(h3, file$3, 84, 4, 2714);
    			add_location(main, file$3, 83, 0, 2702);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    			append_dev(h3, t0);
    			append_dev(h3, strong);
    			append_dev(strong, t1);
    			append_dev(strong, t2);
    			append_dev(strong, t3);
    			append_dev(main, t4);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t5;
    			append_dev(main, t5);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t6);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t7);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t1_value !== (t1_value = /*params*/ ctx[0].country + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].year + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*imports*/ 1024 && promise !== (promise = /*imports*/ ctx[10]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[10] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*errorMsg*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(main, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*correctMsg*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(main, t7);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let imports = {};
    	let updatedCountry = params.country;
    	let updatedyear = parseInt(params.year);
    	let updatedgdamalt = 0;
    	let updatedgdabarley = 0;
    	let updatedgdaoat = 0;
    	let updatedgdawaste = 0;
    	let updatedgdaethylalcohol = 0;
    	let errorMsg = "";
    	let correctMsg = "";
    	onMount(getImport);

    	async function getImport() {
    		console.log("Fetching contact...");
    		const res = await fetch("/api/v2/imports/" + params.country + "/" + params.year);
    		console.log(params);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(10, imports = json);
    			$$invalidate(1, updatedCountry = imports.country);
    			$$invalidate(2, updatedyear = imports.year);
    			$$invalidate(3, updatedgdamalt = imports.gdamalt);
    			$$invalidate(4, updatedgdabarley = imports.gdabarley);
    			$$invalidate(5, updatedgdaoat = imports.gdaoat);
    			$$invalidate(6, updatedgdawaste = imports.gdawaste);
    			$$invalidate(7, updatedgdaethylalcohol = imports.gdaethylalcohol);
    			console.log("Received contact.");
    		} else {
    			$$invalidate(8, errorMsg = "No se puede mostrar la importación con país: " + updatedCountry + " y año: " + updatedyear);
    			
    		}
    	}

    	async function updateImport() {
    		console.log("Updating contact..." + JSON.stringify(params.contactName));

    		const res = await fetch("/api/v2/imports/" + params.country + "/" + params.year, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: params.country,
    				year: parseInt(params.year),
    				gdamalt: parseFloat(updatedgdamalt),
    				gdabarley: parseFloat(updatedgdabarley),
    				gdaoat: parseFloat(updatedgdaoat),
    				gdawaste: parseFloat(updatedgdawaste),
    				gdaethylalcohol: parseFloat(updatedgdaethylalcohol)
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			if (res.ok) {
    				$$invalidate(9, correctMsg = "Se ha actualizado la importación con país: " + updatedCountry + " y año: " + updatedyear);
    				getImports();
    				$$invalidate(8, errorMsg = "");
    			} else {
    				$$invalidate(9, correctMsg = "");
    				$$invalidate(8, errorMsg = "No se ha podido relizar la actualización de la importación con país: " + updatedCountry + " y año: " + updatedyear);
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<EditImport> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditImport", $$slots, []);

    	function input0_input_handler() {
    		updatedgdamalt = this.value;
    		$$invalidate(3, updatedgdamalt);
    	}

    	function input1_input_handler() {
    		updatedgdabarley = this.value;
    		$$invalidate(4, updatedgdabarley);
    	}

    	function input2_input_handler() {
    		updatedgdaoat = this.value;
    		$$invalidate(5, updatedgdaoat);
    	}

    	function input3_input_handler() {
    		updatedgdawaste = this.value;
    		$$invalidate(6, updatedgdawaste);
    	}

    	function input4_input_handler() {
    		updatedgdaethylalcohol = this.value;
    		$$invalidate(7, updatedgdaethylalcohol);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		params,
    		imports,
    		updatedCountry,
    		updatedyear,
    		updatedgdamalt,
    		updatedgdabarley,
    		updatedgdaoat,
    		updatedgdawaste,
    		updatedgdaethylalcohol,
    		errorMsg,
    		correctMsg,
    		getImport,
    		updateImport
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("imports" in $$props) $$invalidate(10, imports = $$props.imports);
    		if ("updatedCountry" in $$props) $$invalidate(1, updatedCountry = $$props.updatedCountry);
    		if ("updatedyear" in $$props) $$invalidate(2, updatedyear = $$props.updatedyear);
    		if ("updatedgdamalt" in $$props) $$invalidate(3, updatedgdamalt = $$props.updatedgdamalt);
    		if ("updatedgdabarley" in $$props) $$invalidate(4, updatedgdabarley = $$props.updatedgdabarley);
    		if ("updatedgdaoat" in $$props) $$invalidate(5, updatedgdaoat = $$props.updatedgdaoat);
    		if ("updatedgdawaste" in $$props) $$invalidate(6, updatedgdawaste = $$props.updatedgdawaste);
    		if ("updatedgdaethylalcohol" in $$props) $$invalidate(7, updatedgdaethylalcohol = $$props.updatedgdaethylalcohol);
    		if ("errorMsg" in $$props) $$invalidate(8, errorMsg = $$props.errorMsg);
    		if ("correctMsg" in $$props) $$invalidate(9, correctMsg = $$props.correctMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updatedCountry,
    		updatedyear,
    		updatedgdamalt,
    		updatedgdabarley,
    		updatedgdaoat,
    		updatedgdawaste,
    		updatedgdaethylalcohol,
    		errorMsg,
    		correctMsg,
    		imports,
    		updateImport,
    		getImport,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class EditImport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditImport",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get params() {
    		throw new Error("<EditImport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditImport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\NotFound.svelte generated by Svelte v3.22.2 */

    const file$4 = "src\\front\\NotFound.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "La pagina no existe!";
    			add_location(h1, file$4, 1, 4, 12);
    			add_location(main, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", $$slots, []);
    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\front\foodsImportsGUI\FoodImportsTable.svelte generated by Svelte v3.22.2 */

    const { console: console_1$3 } = globals;
    const file$5 = "src\\front\\foodsImportsGUI\\FoodImportsTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import Table from "sveltestrap/src/Table.svelte";      import Button from "sveltestrap/src/Button.svelte";      import {onMount}
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>      import Table from \\\"sveltestrap/src/Table.svelte\\\";      import Button from \\\"sveltestrap/src/Button.svelte\\\";      import {onMount}",
    		ctx
    	});

    	return block;
    }

    // (169:4) {:then foodsImports}
    function create_then_block$2(ctx) {
    	let p;
    	let t1;
    	let label;
    	let a;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let if_block5_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*creado*/ ctx[4] && create_if_block_6(ctx);
    	let if_block1 = /*borrado_reg*/ ctx[5] && create_if_block_5(ctx);
    	let if_block2 = /*errRepe*/ ctx[9] && create_if_block_4(ctx);
    	let if_block3 = /*errNotEmpty*/ ctx[8] && create_if_block_3$2(ctx);

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block4 = /*offset*/ ctx[0] > 0 && create_if_block_1$3(ctx);
    	let if_block5 = /*lenfoodsImports*/ ctx[7] - /*limit*/ ctx[1] * (/*offset_aux*/ ctx[2] + 1) > 0 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Si no aparece ningún dato pulse borrar todo y podrá rellenar la tabla.";
    			t1 = space();
    			label = element("label");
    			a = element("a");
    			t2 = text("Elementos por página: ");
    			input = element("input");
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			create_component(table.$$.fragment);
    			t8 = space();
    			if (if_block4) if_block4.c();
    			t9 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			set_style(p, "color", "green");
    			add_location(p, file$5, 170, 4, 4710);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", /*lenfoodsImports*/ ctx[7]);
    			add_location(input, file$5, 173, 33, 4862);
    			add_location(a, file$5, 173, 8, 4837);
    			add_location(label, file$5, 172, 4, 4820);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label, anchor);
    			append_dev(label, a);
    			append_dev(a, t2);
    			append_dev(a, input);
    			set_input_value(input, /*limit*/ ctx[1]);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(table, target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[20]),
    				listen_dev(input, "click", /*click_handler*/ ctx[21], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*lenfoodsImports*/ 128) {
    				attr_dev(input, "max", /*lenfoodsImports*/ ctx[7]);
    			}

    			if (dirty[0] & /*limit*/ 2 && to_number(input.value) !== /*limit*/ ctx[1]) {
    				set_input_value(input, /*limit*/ ctx[1]);
    			}

    			if (/*creado*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*borrado_reg*/ ctx[5]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(t5.parentNode, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*errRepe*/ ctx[9]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					if_block2.m(t6.parentNode, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*errNotEmpty*/ ctx[8]) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_3$2(ctx);
    					if_block3.c();
    					if_block3.m(t7.parentNode, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			const table_changes = {};

    			if (dirty[0] & /*borrado, foodsImports, newfoodsImports*/ 1096 | dirty[1] & /*$$scope*/ 64) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);

    			if (/*offset*/ ctx[0] > 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*offset*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1$3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t9.parentNode, t9);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*lenfoodsImports*/ ctx[7] - /*limit*/ ctx[1] * (/*offset_aux*/ ctx[2] + 1) > 0) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*lenfoodsImports, limit, offset_aux*/ 134) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block$5(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(169:4) {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (177:4) {#if creado}
    function create_if_block_6(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Registro Creado Correctamente.";
    			set_style(p, "color", "green");
    			add_location(p, file$5, 177, 4, 5013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(177:4) {#if creado}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#if borrado_reg}
    function create_if_block_5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Registro Borrado Correctamente.";
    			set_style(p, "color", "red");
    			add_location(p, file$5, 180, 4, 5111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(180:4) {#if borrado_reg}",
    		ctx
    	});

    	return block;
    }

    // (183:4) {#if errRepe}
    function create_if_block_4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Registro Ya está creado, si deséa actualizarlo búsquelo y haga click en el País.";
    			set_style(p, "color", "red");
    			add_location(p, file$5, 183, 4, 5204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(183:4) {#if errRepe}",
    		ctx
    	});

    	return block;
    }

    // (186:4) {#if errNotEmpty}
    function create_if_block_3$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Registro no valido, puede que tenga algún parámetro vacío.";
    			set_style(p, "color", "red");
    			add_location(p, file$5, 186, 4, 5350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(186:4) {#if errNotEmpty}",
    		ctx
    	});

    	return block;
    }

    // (215:20) <Button outline color="primary" on:click={insertFoodsImports_aux}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insertar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(215:20) <Button outline color=\\\"primary\\\" on:click={insertFoodsImports_aux}>",
    		ctx
    	});

    	return block;
    }

    // (228:24) <Button outline color="danger" on:click={() => deleteFoodsImports(food.name,food.year)}>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(228:24) <Button outline color=\\\"danger\\\" on:click={() => deleteFoodsImports(food.name,food.year)}>",
    		ctx
    	});

    	return block;
    }

    // (218:12) {#each foodsImports as food}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*food*/ ctx[34].name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*food*/ ctx[34].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*food*/ ctx[34].TVegANDPrep + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*food*/ ctx[34].fruitJuice + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*food*/ ctx[34].TSweANDCndy + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*food*/ ctx[34].TLiveAnimal + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*food*/ ctx[34].FishFilletANDMince + "";
    	let t12;
    	let t13;
    	let td7;
    	let current;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[29](/*food*/ ctx[34], ...args);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", a_href_value = "#/foodsImports/" + /*food*/ ctx[34].name + "/" + /*food*/ ctx[34].year);
    			add_location(a, file$5, 219, 24, 6722);
    			add_location(td0, file$5, 219, 20, 6718);
    			add_location(td1, file$5, 221, 20, 6859);
    			add_location(td2, file$5, 222, 20, 6901);
    			add_location(td3, file$5, 223, 20, 6950);
    			add_location(td4, file$5, 224, 20, 6998);
    			add_location(td5, file$5, 225, 20, 7047);
    			add_location(td6, file$5, 226, 20, 7096);
    			add_location(td7, file$5, 227, 20, 7152);
    			add_location(tr, file$5, 218, 16, 6692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			mount_component(button, td7, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t0_value !== (t0_value = /*food*/ ctx[34].name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*foodsImports*/ 1024 && a_href_value !== (a_href_value = "#/foodsImports/" + /*food*/ ctx[34].name + "/" + /*food*/ ctx[34].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t2_value !== (t2_value = /*food*/ ctx[34].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t4_value !== (t4_value = /*food*/ ctx[34].TVegANDPrep + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t6_value !== (t6_value = /*food*/ ctx[34].fruitJuice + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t8_value !== (t8_value = /*food*/ ctx[34].TSweANDCndy + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t10_value !== (t10_value = /*food*/ ctx[34].TLiveAnimal + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty[0] & /*foodsImports*/ 1024) && t12_value !== (t12_value = /*food*/ ctx[34].FishFilletANDMince + "")) set_data_dev(t12, t12_value);
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(218:12) {#each foodsImports as food}",
    		ctx
    	});

    	return block;
    }

    // (232:62) <Button onclick="location.href='/#/foodsImports/SearchFoodsImport/';" type="submit" color="info" size="lg">
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Búsquedas");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(232:62) <Button onclick=\\\"location.href='/#/foodsImports/SearchFoodsImport/';\\\" type=\\\"submit\\\" color=\\\"info\\\" size=\\\"lg\\\">",
    		ctx
    	});

    	return block;
    }

    // (236:16) {:else}
    function create_else_block$3(ctx) {
    	let td;

    	const block = {
    		c: function create() {
    			td = element("td");
    			attr_dev(td, "colspan", "2");
    			add_location(td, file$5, 236, 16, 7883);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(236:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (234:16) {#if borrado==true}
    function create_if_block_2$2(ctx) {
    	let td;
    	let current;

    	const button = new Button({
    			props: {
    				type: "submit",
    				color: "success",
    				size: "lg",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[30]);

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(button.$$.fragment);
    			set_style(td, "text-align", "center");
    			attr_dev(td, "colspan", "2");
    			add_location(td, file$5, 234, 16, 7614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(button, td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(234:16) {#if borrado==true}",
    		ctx
    	});

    	return block;
    }

    // (235:62) <Button  type="submit" color="success" size="lg" on:click={() =>loadInitialFoodsImports()}>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Se han borrado todos los datos, puede volver a cargar los valores iniciales");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(235:62) <Button  type=\\\"submit\\\" color=\\\"success\\\" size=\\\"lg\\\" on:click={() =>loadInitialFoodsImports()}>",
    		ctx
    	});

    	return block;
    }

    // (241:62) <Button color="danger" size="lg" on:click={() => deleteAllFoodsImports()}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar Todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(241:62) <Button color=\\\"danger\\\" size=\\\"lg\\\" on:click={() => deleteAllFoodsImports()}>",
    		ctx
    	});

    	return block;
    }

    // (192:4) <Table bordered>
    function create_default_slot_2$2(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t0;
    	let h6;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t10;
    	let th5;
    	let t12;
    	let th6;
    	let t14;
    	let th7;
    	let t16;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t17;
    	let td1;
    	let input1;
    	let t18;
    	let td2;
    	let input2;
    	let t19;
    	let td3;
    	let input3;
    	let t20;
    	let td4;
    	let input4;
    	let t21;
    	let td5;
    	let input5;
    	let t22;
    	let td6;
    	let input6;
    	let t23;
    	let td7;
    	let t24;
    	let t25;
    	let tr2;
    	let td8;
    	let t26;
    	let td9;
    	let t27;
    	let current_block_type_index;
    	let if_block;
    	let t28;
    	let td10;
    	let t29;
    	let td11;
    	let current;
    	let dispose;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*insertFoodsImports_aux*/ ctx[13]);
    	let each_value = /*foodsImports*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const button1 = new Button({
    			props: {
    				onclick: "location.href='/#/foodsImports/SearchFoodsImport/';",
    				type: "submit",
    				color: "info",
    				size: "lg",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_2$2, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*borrado*/ ctx[3] == true) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const button2 = new Button({
    			props: {
    				color: "danger",
    				size: "lg",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_3*/ ctx[31]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			t0 = text("PAÍS");
    			h6 = element("h6");
    			h6.textContent = "(Click en el nombre para editar)";
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "AÑO";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "VEGETALES Y PREPARADOS";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "ZUMO DE FRUTAS";
    			t8 = space();
    			th4 = element("th");
    			th4.textContent = "DULCES Y CARAMELOS";
    			t10 = space();
    			th5 = element("th");
    			th5.textContent = "ANIMALES VIVOS";
    			t12 = space();
    			th6 = element("th");
    			th6.textContent = "FILETES DE PESCADO Y DESMEDUZADO";
    			t14 = space();
    			th7 = element("th");
    			th7.textContent = "Acciones";
    			t16 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t17 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t18 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t19 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t20 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t21 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t22 = space();
    			td6 = element("td");
    			input6 = element("input");
    			t23 = space();
    			td7 = element("td");
    			create_component(button0.$$.fragment);
    			t24 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			tr2 = element("tr");
    			td8 = element("td");
    			create_component(button1.$$.fragment);
    			t26 = space();
    			td9 = element("td");
    			t27 = space();
    			if_block.c();
    			t28 = space();
    			td10 = element("td");
    			t29 = space();
    			td11 = element("td");
    			create_component(button2.$$.fragment);
    			add_location(h6, file$5, 194, 24, 5550);
    			add_location(th0, file$5, 194, 16, 5542);
    			add_location(th1, file$5, 195, 16, 5614);
    			add_location(th2, file$5, 196, 16, 5644);
    			add_location(th3, file$5, 197, 16, 5693);
    			add_location(th4, file$5, 198, 16, 5734);
    			add_location(th5, file$5, 199, 16, 5779);
    			add_location(th6, file$5, 200, 16, 5820);
    			add_location(th7, file$5, 201, 16, 5879);
    			add_location(tr0, file$5, 193, 12, 5520);
    			add_location(thead, file$5, 192, 8, 5499);
    			add_location(input0, file$5, 207, 20, 5992);
    			add_location(td0, file$5, 207, 16, 5988);
    			add_location(input1, file$5, 208, 20, 6062);
    			add_location(td1, file$5, 208, 16, 6058);
    			add_location(input2, file$5, 209, 20, 6132);
    			add_location(td2, file$5, 209, 16, 6128);
    			add_location(input3, file$5, 210, 20, 6209);
    			add_location(td3, file$5, 210, 16, 6205);
    			add_location(input4, file$5, 211, 20, 6285);
    			add_location(td4, file$5, 211, 16, 6281);
    			add_location(input5, file$5, 212, 20, 6362);
    			add_location(td5, file$5, 212, 16, 6358);
    			add_location(input6, file$5, 213, 20, 6439);
    			add_location(td6, file$5, 213, 16, 6435);
    			add_location(td7, file$5, 214, 16, 6519);
    			add_location(tr1, file$5, 206, 12, 5966);
    			set_style(td8, "text-align", "center");
    			attr_dev(td8, "colspan", "2");
    			add_location(td8, file$5, 231, 16, 7344);
    			attr_dev(td9, "colspan", "1");
    			add_location(td9, file$5, 232, 16, 7538);
    			attr_dev(td10, "colspan", "1");
    			add_location(td10, file$5, 239, 16, 7947);
    			set_style(td11, "text-align", "center");
    			attr_dev(td11, "colspan", "2");
    			add_location(td11, file$5, 240, 16, 7986);
    			add_location(tr2, file$5, 230, 12, 7322);
    			add_location(tbody, file$5, 204, 8, 5943);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, t0);
    			append_dev(th0, h6);
    			append_dev(tr0, t2);
    			append_dev(tr0, th1);
    			append_dev(tr0, t4);
    			append_dev(tr0, th2);
    			append_dev(tr0, t6);
    			append_dev(tr0, th3);
    			append_dev(tr0, t8);
    			append_dev(tr0, th4);
    			append_dev(tr0, t10);
    			append_dev(tr0, th5);
    			append_dev(tr0, t12);
    			append_dev(tr0, th6);
    			append_dev(tr0, t14);
    			append_dev(tr0, th7);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newfoodsImports*/ ctx[6].name);
    			append_dev(tr1, t17);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newfoodsImports*/ ctx[6].year);
    			append_dev(tr1, t18);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newfoodsImports*/ ctx[6].TVegANDPrep);
    			append_dev(tr1, t19);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newfoodsImports*/ ctx[6].fruitJuice);
    			append_dev(tr1, t20);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newfoodsImports*/ ctx[6].TSweANDCndy);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newfoodsImports*/ ctx[6].TLiveAnimal);
    			append_dev(tr1, t22);
    			append_dev(tr1, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*newfoodsImports*/ ctx[6].FishFilletANDMince);
    			append_dev(tr1, t23);
    			append_dev(tr1, td7);
    			mount_component(button0, td7, null);
    			append_dev(tbody, t24);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t25);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td8);
    			mount_component(button1, td8, null);
    			append_dev(tr2, t26);
    			append_dev(tr2, td9);
    			append_dev(tr2, t27);
    			if_blocks[current_block_type_index].m(tr2, null);
    			append_dev(tr2, t28);
    			append_dev(tr2, td10);
    			append_dev(tr2, t29);
    			append_dev(tr2, td11);
    			mount_component(button2, td11, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[22]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[23]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[24]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[25]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[26]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[27]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[28])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newfoodsImports*/ 64 && input0.value !== /*newfoodsImports*/ ctx[6].name) {
    				set_input_value(input0, /*newfoodsImports*/ ctx[6].name);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input1.value !== /*newfoodsImports*/ ctx[6].year) {
    				set_input_value(input1, /*newfoodsImports*/ ctx[6].year);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input2.value !== /*newfoodsImports*/ ctx[6].TVegANDPrep) {
    				set_input_value(input2, /*newfoodsImports*/ ctx[6].TVegANDPrep);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input3.value !== /*newfoodsImports*/ ctx[6].fruitJuice) {
    				set_input_value(input3, /*newfoodsImports*/ ctx[6].fruitJuice);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input4.value !== /*newfoodsImports*/ ctx[6].TSweANDCndy) {
    				set_input_value(input4, /*newfoodsImports*/ ctx[6].TSweANDCndy);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input5.value !== /*newfoodsImports*/ ctx[6].TLiveAnimal) {
    				set_input_value(input5, /*newfoodsImports*/ ctx[6].TLiveAnimal);
    			}

    			if (dirty[0] & /*newfoodsImports*/ 64 && input6.value !== /*newfoodsImports*/ ctx[6].FishFilletANDMince) {
    				set_input_value(input6, /*newfoodsImports*/ ctx[6].FishFilletANDMince);
    			}

    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (dirty[0] & /*deleteFoodsImports, foodsImports*/ 33792) {
    				each_value = /*foodsImports*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, t25);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(tr2, t28);
    			}

    			const button2_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button1);
    			if_blocks[current_block_type_index].d();
    			destroy_component(button2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(192:4) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (246:4) {#if offset>0}
    function create_if_block_1$3(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_4*/ ctx[32]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(246:4) {#if offset>0}",
    		ctx
    	});

    	return block;
    }

    // (247:4) <Button on:click={() =>disoffset()}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Anterior");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(247:4) <Button on:click={() =>disoffset()}>",
    		ctx
    	});

    	return block;
    }

    // (249:4) {#if lenfoodsImports-limit*(offset_aux+1)>0}
    function create_if_block$5(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_5*/ ctx[33]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(249:4) {#if lenfoodsImports-limit*(offset_aux+1)>0}",
    		ctx
    	});

    	return block;
    }

    // (250:4) <Button on:click={() =>aumoffset()}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Siguiente");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(250:4) <Button on:click={() =>aumoffset()}>",
    		ctx
    	});

    	return block;
    }

    // (168:25)       {:then foodsImports}
    function create_pending_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(168:25)       {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*foodsImports*/ ctx[10], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			add_location(main, file$5, 166, 0, 4639);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*foodsImports*/ 1024 && promise !== (promise = /*foodsImports*/ ctx[10]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[10] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let offset = 0;
    	let limit = 10;
    	let offset_aux = 0;
    	let borrado = false;
    	let creado = false;
    	let borrado_reg = false;
    	let foodsImports = [];

    	let newfoodsImports = {
    		name: "",
    		year: "",
    		TVegANDPrep: "",
    		fruitJuice: "",
    		TSweANDCndy: "",
    		TLiveAnimal: "",
    		FishFilletANDMince: ""
    	};

    	let lenfoodsImports = 10;
    	let errNotEmpty = false;
    	let errRepe = false;
    	onMount(getFoodsImports);

    	async function initFoods() {
    		const res_aux = await fetch("/api/v2/foodsImports");
    		const json_aux = await res_aux.json();
    		let foodsImports_aux = json_aux;
    		$$invalidate(7, lenfoodsImports = foodsImports_aux.length);
    	}

    	async function loadInitialFoodsImports() {
    		$$invalidate(3, borrado = false);
    		const res_aux = await fetch("/api/v2/foodsImports/loadInitialData");
    		getFoodsImports();
    	}

    	async function getFoodsImports(off, off_aux) {
    		$$invalidate(4, creado = false);
    		$$invalidate(5, borrado_reg = false);
    		$$invalidate(8, errNotEmpty = false);
    		$$invalidate(9, errRepe = false);

    		$$invalidate(6, newfoodsImports = {
    			name: "",
    			year: "",
    			TVegANDPrep: "",
    			fruitJuice: "",
    			TSweANDCndy: "",
    			TLiveAnimal: "",
    			FishFilletANDMince: ""
    		});

    		initFoods();

    		if (off == undefined) {
    			$$invalidate(0, offset = 0);
    			$$invalidate(2, offset_aux = 0);
    		} else {
    			$$invalidate(0, offset = off);
    			$$invalidate(2, offset_aux = off_aux);
    		}

    		console.log("Fetching Foods...");
    		const res = await fetch("/api/v2/foodsImports?offset=" + offset + "&limit=" + limit);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(10, foodsImports = json);
    			console.log("Received " + foodsImports.length + " foods");
    		} else {
    			console.log("Error");
    		}
    	}

    	async function insertFoodsImports_aux() {
    		$$invalidate(8, errNotEmpty = false);
    		$$invalidate(9, errRepe = false);

    		if (newfoodsImports.name == "" || newfoodsImports.year == "" || newfoodsImports.TVegANDPrep == "" || newfoodsImports.fruitJuice == "" || newfoodsImports.TSweANDCndy == "" || newfoodsImports.TLiveAnimal == "" || newfoodsImports.FishFilletANDMince == "") {
    			$$invalidate(8, errNotEmpty = true);
    		} else {
    			const res = await fetch("/api/v2/foodsImports");
    			const json = await res.json();
    			$$invalidate(10, foodsImports = json);

    			foodsImports.forEach(i => {
    				if (i.name == newfoodsImports.name && i.year == newfoodsImports.year) {
    					$$invalidate(9, errRepe = true);
    				}
    			});

    			if (errRepe == false) {
    				insertFoodsImports();
    			}
    		}
    	}

    	async function insertFoodsImports() {
    		console.log("Insertando Importaciones de Comida...." + JSON.stringify(newfoodsImports));

    		const res = await fetch("/api/v2/foodsImports", {
    			method: "POST",
    			body: JSON.stringify(newfoodsImports),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getFoodsImports(offset, offset_aux);
    			$$invalidate(4, creado = true);
    		});
    	}

    	

    	async function deleteAllFoodsImports() {
    		console.log("Queremos eliminar:");

    		const res = await fetch("/api/v2/foodsImports/", { method: "DELETE" }).then(function (res) {
    			getFoodsImports(offset, offset_aux);
    			$$invalidate(3, borrado = true);
    		});
    	}

    	async function deleteFoodsImports(name, year) {
    		console.log("Queremos eliminar: " + name + " " + year + "/api/v2/foodsImports/" + name + "/" + year);

    		const res = await fetch("/api/v2/foodsImports/" + name + "/" + year, { method: "DELETE" }).then(function (res) {
    			getFoodsImports(offset, offset_aux);
    			$$invalidate(5, borrado_reg = true);
    		});
    	}

    	function aumoffset() {
    		$$invalidate(0, offset = offset + limit);
    		$$invalidate(2, offset_aux = offset_aux + 1);
    		console.log("Offset: " + offset);
    		getFoodsImports(offset, offset_aux);
    	}

    	function disoffset() {
    		if (offset >= 1) {
    			$$invalidate(0, offset = offset - limit);
    			$$invalidate(2, offset_aux = offset_aux - 1);
    			console.log("Offset: " + offset);
    			getFoodsImports(offset, offset_aux);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<FoodImportsTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FoodImportsTable", $$slots, []);

    	function input_input_handler() {
    		limit = to_number(this.value);
    		$$invalidate(1, limit);
    	}

    	const click_handler = () => getFoodsImports(0, 0);

    	function input0_input_handler() {
    		newfoodsImports.name = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input1_input_handler() {
    		newfoodsImports.year = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input2_input_handler() {
    		newfoodsImports.TVegANDPrep = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input3_input_handler() {
    		newfoodsImports.fruitJuice = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input4_input_handler() {
    		newfoodsImports.TSweANDCndy = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input5_input_handler() {
    		newfoodsImports.TLiveAnimal = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	function input6_input_handler() {
    		newfoodsImports.FishFilletANDMince = this.value;
    		$$invalidate(6, newfoodsImports);
    	}

    	const click_handler_1 = food => deleteFoodsImports(food.name, food.year);
    	const click_handler_2 = () => loadInitialFoodsImports();
    	const click_handler_3 = () => deleteAllFoodsImports();
    	const click_handler_4 = () => disoffset();
    	const click_handler_5 = () => aumoffset();

    	$$self.$capture_state = () => ({
    		Table,
    		Button,
    		onMount,
    		offset,
    		limit,
    		offset_aux,
    		borrado,
    		creado,
    		borrado_reg,
    		foodsImports,
    		newfoodsImports,
    		lenfoodsImports,
    		errNotEmpty,
    		errRepe,
    		initFoods,
    		loadInitialFoodsImports,
    		getFoodsImports,
    		insertFoodsImports_aux,
    		insertFoodsImports,
    		deleteAllFoodsImports,
    		deleteFoodsImports,
    		aumoffset,
    		disoffset
    	});

    	$$self.$inject_state = $$props => {
    		if ("offset" in $$props) $$invalidate(0, offset = $$props.offset);
    		if ("limit" in $$props) $$invalidate(1, limit = $$props.limit);
    		if ("offset_aux" in $$props) $$invalidate(2, offset_aux = $$props.offset_aux);
    		if ("borrado" in $$props) $$invalidate(3, borrado = $$props.borrado);
    		if ("creado" in $$props) $$invalidate(4, creado = $$props.creado);
    		if ("borrado_reg" in $$props) $$invalidate(5, borrado_reg = $$props.borrado_reg);
    		if ("foodsImports" in $$props) $$invalidate(10, foodsImports = $$props.foodsImports);
    		if ("newfoodsImports" in $$props) $$invalidate(6, newfoodsImports = $$props.newfoodsImports);
    		if ("lenfoodsImports" in $$props) $$invalidate(7, lenfoodsImports = $$props.lenfoodsImports);
    		if ("errNotEmpty" in $$props) $$invalidate(8, errNotEmpty = $$props.errNotEmpty);
    		if ("errRepe" in $$props) $$invalidate(9, errRepe = $$props.errRepe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		offset,
    		limit,
    		offset_aux,
    		borrado,
    		creado,
    		borrado_reg,
    		newfoodsImports,
    		lenfoodsImports,
    		errNotEmpty,
    		errRepe,
    		foodsImports,
    		loadInitialFoodsImports,
    		getFoodsImports,
    		insertFoodsImports_aux,
    		deleteAllFoodsImports,
    		deleteFoodsImports,
    		aumoffset,
    		disoffset,
    		initFoods,
    		insertFoodsImports,
    		input_input_handler,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class FoodImportsTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FoodImportsTable",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\front\foodsImportsGUI\EditFoodsImports.svelte generated by Svelte v3.22.2 */

    const { console: console_1$4 } = globals;
    const file$6 = "src\\front\\foodsImportsGUI\\EditFoodsImports.svelte";

    // (1:0) <script>      export let params={}
    function create_catch_block$3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>      export let params={}",
    		ctx
    	});

    	return block;
    }

    // (71:4) {:then foodsImports}
    function create_then_block$3(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updateFoodsImportsFishFilletANDMince, updateFoodsImportsTLiveAnimal, updateFoodsImportsTSweANDCndy, updateFoodsImportsfruitJuice, updateFoodsImportsTVegANDPrep, updateFoodsImportsYear, updateFoodsImportsName*/ 131326) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(71:4) {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (97:20) <Button outline color="primary" on:click={updateFoodsImports}>
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(97:20) <Button outline color=\\\"primary\\\" on:click={updateFoodsImports}>",
    		ctx
    	});

    	return block;
    }

    // (74:4) <Table bordered>
    function create_default_slot$3(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let tbody;
    	let tr1;
    	let td0;
    	let t16;
    	let t17;
    	let td1;
    	let t18;
    	let t19;
    	let td2;
    	let input0;
    	let t20;
    	let td3;
    	let input1;
    	let t21;
    	let td4;
    	let input2;
    	let t22;
    	let td5;
    	let input3;
    	let t23;
    	let td6;
    	let input4;
    	let t24;
    	let td7;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateFoodsImports*/ ctx[10]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "PAÍS";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "AÑO";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "VEGETALES Y PREPARADOS";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "ZUMO DE FRUTAS";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "DULCES Y CARAMELOS";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "ANIMALES VIVOS";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "FILETES DE PESCADO Y DESMEDUZADO";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Acciones";
    			t15 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t16 = text(/*updateFoodsImportsName*/ ctx[1]);
    			t17 = space();
    			td1 = element("td");
    			t18 = text(/*updateFoodsImportsYear*/ ctx[2]);
    			t19 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t20 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t21 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t22 = space();
    			td5 = element("td");
    			input3 = element("input");
    			t23 = space();
    			td6 = element("td");
    			input4 = element("input");
    			t24 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$6, 76, 16, 2774);
    			add_location(th1, file$6, 77, 16, 2805);
    			add_location(th2, file$6, 78, 16, 2835);
    			add_location(th3, file$6, 79, 16, 2884);
    			add_location(th4, file$6, 80, 16, 2925);
    			add_location(th5, file$6, 81, 16, 2970);
    			add_location(th6, file$6, 82, 16, 3011);
    			add_location(th7, file$6, 83, 16, 3070);
    			add_location(tr0, file$6, 75, 12, 2752);
    			add_location(thead, file$6, 74, 8, 2731);
    			add_location(td0, file$6, 89, 16, 3179);
    			add_location(td1, file$6, 90, 16, 3230);
    			add_location(input0, file$6, 91, 20, 3285);
    			add_location(td2, file$6, 91, 16, 3281);
    			add_location(input1, file$6, 92, 20, 3364);
    			add_location(td3, file$6, 92, 16, 3360);
    			add_location(input2, file$6, 93, 20, 3442);
    			add_location(td4, file$6, 93, 16, 3438);
    			add_location(input3, file$6, 94, 20, 3521);
    			add_location(td5, file$6, 94, 16, 3517);
    			add_location(input4, file$6, 95, 20, 3600);
    			add_location(td6, file$6, 95, 16, 3596);
    			add_location(td7, file$6, 96, 16, 3682);
    			add_location(tr1, file$6, 88, 12, 3157);
    			add_location(tbody, file$6, 86, 8, 3134);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td1);
    			append_dev(td1, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*updateFoodsImportsTVegANDPrep*/ ctx[3]);
    			append_dev(tr1, t20);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*updateFoodsImportsfruitJuice*/ ctx[4]);
    			append_dev(tr1, t21);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*updateFoodsImportsTSweANDCndy*/ ctx[5]);
    			append_dev(tr1, t22);
    			append_dev(tr1, td5);
    			append_dev(td5, input3);
    			set_input_value(input3, /*updateFoodsImportsTLiveAnimal*/ ctx[6]);
    			append_dev(tr1, t23);
    			append_dev(tr1, td6);
    			append_dev(td6, input4);
    			set_input_value(input4, /*updateFoodsImportsFishFilletANDMince*/ ctx[7]);
    			append_dev(tr1, t24);
    			append_dev(tr1, td7);
    			mount_component(button, td7, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[14]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[15]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[16])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updateFoodsImportsName*/ 2) set_data_dev(t16, /*updateFoodsImportsName*/ ctx[1]);
    			if (!current || dirty & /*updateFoodsImportsYear*/ 4) set_data_dev(t18, /*updateFoodsImportsYear*/ ctx[2]);

    			if (dirty & /*updateFoodsImportsTVegANDPrep*/ 8 && input0.value !== /*updateFoodsImportsTVegANDPrep*/ ctx[3]) {
    				set_input_value(input0, /*updateFoodsImportsTVegANDPrep*/ ctx[3]);
    			}

    			if (dirty & /*updateFoodsImportsfruitJuice*/ 16 && input1.value !== /*updateFoodsImportsfruitJuice*/ ctx[4]) {
    				set_input_value(input1, /*updateFoodsImportsfruitJuice*/ ctx[4]);
    			}

    			if (dirty & /*updateFoodsImportsTSweANDCndy*/ 32 && input2.value !== /*updateFoodsImportsTSweANDCndy*/ ctx[5]) {
    				set_input_value(input2, /*updateFoodsImportsTSweANDCndy*/ ctx[5]);
    			}

    			if (dirty & /*updateFoodsImportsTLiveAnimal*/ 64 && input3.value !== /*updateFoodsImportsTLiveAnimal*/ ctx[6]) {
    				set_input_value(input3, /*updateFoodsImportsTLiveAnimal*/ ctx[6]);
    			}

    			if (dirty & /*updateFoodsImportsFishFilletANDMince*/ 128 && input4.value !== /*updateFoodsImportsFishFilletANDMince*/ ctx[7]) {
    				set_input_value(input4, /*updateFoodsImportsFishFilletANDMince*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(74:4) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (70:28)       {:then foodsImports}
    function create_pending_block$3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(70:28)       {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (103:4) {#if errorMsg}
    function create_if_block$6(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("ERROR: ");
    			t1 = text(/*errorMsg*/ ctx[8]);
    			set_style(p, "color", "red");
    			add_location(p, file$6, 103, 4, 3865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 256) set_data_dev(t1, /*errorMsg*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(103:4) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let h3;
    	let t0;
    	let strong0;
    	let t1_value = /*params*/ ctx[0].foodsName + "";
    	let t1;
    	let t2;
    	let strong1;
    	let t3_value = /*params*/ ctx[0].foodsYear + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*foodsImports*/ ctx[9][0], info);
    	let if_block = /*errorMsg*/ ctx[8] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			t0 = text("Estas editando las importaciones a ");
    			strong0 = element("strong");
    			t1 = text(t1_value);
    			t2 = text(" en ");
    			strong1 = element("strong");
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(strong0, file$6, 68, 43, 2547);
    			add_location(strong1, file$6, 68, 82, 2586);
    			add_location(h3, file$6, 68, 4, 2508);
    			add_location(main, file$6, 67, 0, 2496);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    			append_dev(h3, t0);
    			append_dev(h3, strong0);
    			append_dev(strong0, t1);
    			append_dev(h3, t2);
    			append_dev(h3, strong1);
    			append_dev(strong1, t3);
    			append_dev(main, t4);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t5;
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t1_value !== (t1_value = /*params*/ ctx[0].foodsName + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].foodsYear + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*foodsImports*/ 512 && promise !== (promise = /*foodsImports*/ ctx[9][0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*errorMsg*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let foodsImports = {};
    	let updateFoodsImportsName = "";
    	let updateFoodsImportsYear = "";
    	let updateFoodsImportsTVegANDPrep = "";
    	let updateFoodsImportsfruitJuice = "";
    	let updateFoodsImportsTSweANDCndy = "";
    	let updateFoodsImportsTLiveAnimal = "";
    	let updateFoodsImportsFishFilletANDMince = "";
    	let errorMsg = "";

    	async function updateFoodsImports() {
    		console.log("Actualizando Importaciones de Comida...." + params.foodsName + " " + params.foodsYear);

    		const res = await fetch("/api/v2/foodsImports/" + params.foodsName + "/" + params.foodsYear, {
    			method: "PUT",
    			body: JSON.stringify({
    				name: params.foodsName,
    				year: params.foodsYear,
    				TVegANDPrep: updateFoodsImportsTVegANDPrep,
    				fruitJuice: updateFoodsImportsfruitJuice,
    				TSweANDCndy: updateFoodsImportsTSweANDCndy,
    				TLiveAnimal: updateFoodsImportsTLiveAnimal,
    				FishFilletANDMince: updateFoodsImportsFishFilletANDMince
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getFoodsImport();
    		});
    	}

    	onMount(getFoodsImport);

    	async function getFoodsImport() {
    		console.log("Fetching Food...");
    		const res = await fetch("/api/v2/foodsImports/" + params.foodsName + "/" + params.foodsYear);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(9, foodsImports = json);
    			console.log("Datos: " + foodsImports.name);
    			$$invalidate(1, updateFoodsImportsName = foodsImports.name);
    			$$invalidate(2, updateFoodsImportsYear = foodsImports.year);
    			$$invalidate(3, updateFoodsImportsTVegANDPrep = foodsImports.TVegANDPrep);
    			$$invalidate(4, updateFoodsImportsfruitJuice = foodsImports.fruitJuice);
    			$$invalidate(5, updateFoodsImportsTSweANDCndy = foodsImports.TSweANDCndy);
    			$$invalidate(6, updateFoodsImportsTLiveAnimal = foodsImports.TLiveAnimal);
    			$$invalidate(7, updateFoodsImportsFishFilletANDMince = foodsImports.FishFilletANDMince);
    			console.log("Received food");
    		} else {
    			$$invalidate(8, errorMsg = res.status + ": " + res.statusText);
    			console.log("Error" + errorMsg);
    		}
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<EditFoodsImports> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditFoodsImports", $$slots, []);

    	function input0_input_handler() {
    		updateFoodsImportsTVegANDPrep = this.value;
    		$$invalidate(3, updateFoodsImportsTVegANDPrep);
    	}

    	function input1_input_handler() {
    		updateFoodsImportsfruitJuice = this.value;
    		$$invalidate(4, updateFoodsImportsfruitJuice);
    	}

    	function input2_input_handler() {
    		updateFoodsImportsTSweANDCndy = this.value;
    		$$invalidate(5, updateFoodsImportsTSweANDCndy);
    	}

    	function input3_input_handler() {
    		updateFoodsImportsTLiveAnimal = this.value;
    		$$invalidate(6, updateFoodsImportsTLiveAnimal);
    	}

    	function input4_input_handler() {
    		updateFoodsImportsFishFilletANDMince = this.value;
    		$$invalidate(7, updateFoodsImportsFishFilletANDMince);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		params,
    		foodsImports,
    		Table,
    		Button,
    		onMount,
    		updateFoodsImportsName,
    		updateFoodsImportsYear,
    		updateFoodsImportsTVegANDPrep,
    		updateFoodsImportsfruitJuice,
    		updateFoodsImportsTSweANDCndy,
    		updateFoodsImportsTLiveAnimal,
    		updateFoodsImportsFishFilletANDMince,
    		errorMsg,
    		updateFoodsImports,
    		getFoodsImport
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("foodsImports" in $$props) $$invalidate(9, foodsImports = $$props.foodsImports);
    		if ("updateFoodsImportsName" in $$props) $$invalidate(1, updateFoodsImportsName = $$props.updateFoodsImportsName);
    		if ("updateFoodsImportsYear" in $$props) $$invalidate(2, updateFoodsImportsYear = $$props.updateFoodsImportsYear);
    		if ("updateFoodsImportsTVegANDPrep" in $$props) $$invalidate(3, updateFoodsImportsTVegANDPrep = $$props.updateFoodsImportsTVegANDPrep);
    		if ("updateFoodsImportsfruitJuice" in $$props) $$invalidate(4, updateFoodsImportsfruitJuice = $$props.updateFoodsImportsfruitJuice);
    		if ("updateFoodsImportsTSweANDCndy" in $$props) $$invalidate(5, updateFoodsImportsTSweANDCndy = $$props.updateFoodsImportsTSweANDCndy);
    		if ("updateFoodsImportsTLiveAnimal" in $$props) $$invalidate(6, updateFoodsImportsTLiveAnimal = $$props.updateFoodsImportsTLiveAnimal);
    		if ("updateFoodsImportsFishFilletANDMince" in $$props) $$invalidate(7, updateFoodsImportsFishFilletANDMince = $$props.updateFoodsImportsFishFilletANDMince);
    		if ("errorMsg" in $$props) $$invalidate(8, errorMsg = $$props.errorMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updateFoodsImportsName,
    		updateFoodsImportsYear,
    		updateFoodsImportsTVegANDPrep,
    		updateFoodsImportsfruitJuice,
    		updateFoodsImportsTSweANDCndy,
    		updateFoodsImportsTLiveAnimal,
    		updateFoodsImportsFishFilletANDMince,
    		errorMsg,
    		foodsImports,
    		updateFoodsImports,
    		getFoodsImport,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class EditFoodsImports extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditFoodsImports",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get params() {
    		throw new Error("<EditFoodsImports>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditFoodsImports>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\foodsImportsGUI\SearchFoodsImport.svelte generated by Svelte v3.22.2 */

    const { console: console_1$5 } = globals;
    const file$7 = "src\\front\\foodsImportsGUI\\SearchFoodsImport.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (124:20) <Button outline color="primary" on:click={getFoodsImport_aux1} >
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(124:20) <Button outline color=\\\"primary\\\" on:click={getFoodsImport_aux1} >",
    		ctx
    	});

    	return block;
    }

    // (111:4) <Table bordered>
    function create_default_slot_3$2(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t4;
    	let td1;
    	let input1;
    	let t5;
    	let td2;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*getFoodsImport_aux1*/ ctx[14]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "PAÍS";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "AÑO";
    			t3 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t4 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t5 = space();
    			td2 = element("td");
    			create_component(button.$$.fragment);
    			attr_dev(th0, "colspan", "4");
    			add_location(th0, file$7, 113, 16, 4016);
    			attr_dev(th1, "colspan", "4");
    			add_location(th1, file$7, 114, 16, 4059);
    			add_location(tr0, file$7, 112, 12, 3994);
    			add_location(thead, file$7, 111, 8, 3973);
    			add_location(input0, file$7, 121, 32, 4209);
    			attr_dev(td0, "colspan", "4");
    			add_location(td0, file$7, 121, 16, 4193);
    			add_location(input1, file$7, 122, 32, 4278);
    			attr_dev(td1, "colspan", "4");
    			add_location(td1, file$7, 122, 16, 4262);
    			add_location(td2, file$7, 123, 16, 4331);
    			add_location(tr1, file$7, 120, 12, 4171);
    			add_location(tbody, file$7, 118, 8, 4148);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*busName*/ ctx[0]);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*busYear*/ ctx[1]);
    			append_dev(tr1, t5);
    			append_dev(tr1, td2);
    			mount_component(button, td2, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[20])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*busName*/ 1 && input0.value !== /*busName*/ ctx[0]) {
    				set_input_value(input0, /*busName*/ ctx[0]);
    			}

    			if (dirty & /*busYear*/ 2 && input1.value !== /*busYear*/ ctx[1]) {
    				set_input_value(input1, /*busYear*/ ctx[1]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 67108864) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(111:4) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (128:4) {#if tipo==1}
    function create_if_block_6$1(ctx) {
    	let h1;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Estás Buscando en el año: ");
    			t1 = text(/*busYear*/ ctx[1]);
    			add_location(h1, file$7, 128, 4, 4495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*busYear*/ 2) set_data_dev(t1, /*busYear*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(128:4) {#if tipo==1}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if tipo==2}
    function create_if_block_5$1(ctx) {
    	let h1;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Estás Buscando en el país: ");
    			t1 = text(/*busName*/ ctx[0]);
    			add_location(h1, file$7, 131, 4, 4576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*busName*/ 1) set_data_dev(t1, /*busName*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(131:4) {#if tipo==2}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#if tipo==3}
    function create_if_block_4$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Estás Buscando en el país:");
    			t1 = text(/*busName*/ ctx[0]);
    			t2 = text(" y año: ");
    			t3 = text(/*busYear*/ ctx[1]);
    			add_location(h1, file$7, 134, 4, 4658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*busName*/ 1) set_data_dev(t1, /*busName*/ ctx[0]);
    			if (dirty & /*busYear*/ 2) set_data_dev(t3, /*busYear*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(134:4) {#if tipo==3}",
    		ctx
    	});

    	return block;
    }

    // (189:12) {:else}
    function create_else_block_1$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(189:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (152:12) {#if on}
    function create_if_block_1$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$3, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*varios*/ ctx[10]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(152:12) {#if on}",
    		ctx
    	});

    	return block;
    }

    // (169:16) {:else}
    function create_else_block$4(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 13,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*foodsImports*/ ctx[13], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*foodsImports*/ 8192 && promise !== (promise = /*foodsImports*/ ctx[13]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[13] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(169:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (153:16) {#if varios}
    function create_if_block_2$3(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 13,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*foodsImports*/ ctx[13], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*foodsImports*/ 8192 && promise !== (promise = /*foodsImports*/ ctx[13]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[13] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(153:16) {#if varios}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      let foodsImports={}
    function create_catch_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>      let foodsImports={}",
    		ctx
    	});

    	return block;
    }

    // (171:20) {:then foodsImports}
    function create_then_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*searchedFoodsImportsTSweANDCndy*/ ctx[6] != undefined && create_if_block_3$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*searchedFoodsImportsTSweANDCndy*/ ctx[6] != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*searchedFoodsImportsTSweANDCndy*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(171:20) {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (172:24) {#if searchedFoodsImportsTSweANDCndy!=undefined}
    function create_if_block_3$3(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2;
    	let t3;
    	let td2;
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let t7;
    	let td4;
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let t11;
    	let td6;
    	let t12;
    	let t13;
    	let td7;
    	let current;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*foodsImports*/ ctx[13], ...args);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(/*searchedFoodsImportsName*/ ctx[2]);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(/*searchedFoodsImportsYear*/ ctx[3]);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(/*searchedFoodsImportsTVegANDPrep*/ ctx[4]);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(/*searchedFoodsImportsfruitJuice*/ ctx[5]);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(/*searchedFoodsImportsTSweANDCndy*/ ctx[6]);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(/*searchedFoodsImportsTLiveAnimal*/ ctx[7]);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(/*searchedFoodsImportsFishFilletANDMince*/ ctx[8]);
    			t13 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", a_href_value = "#/foodsImports/" + /*foodsImports*/ ctx[13].name + "/" + /*foodsImports*/ ctx[13].year);
    			add_location(a, file$7, 175, 36, 6440);
    			add_location(td0, file$7, 174, 28, 6398);
    			add_location(td1, file$7, 177, 28, 6629);
    			add_location(td2, file$7, 178, 28, 6694);
    			add_location(td3, file$7, 179, 28, 6766);
    			add_location(td4, file$7, 180, 28, 6837);
    			add_location(td5, file$7, 181, 28, 6909);
    			add_location(td6, file$7, 182, 28, 6981);
    			add_location(td7, file$7, 183, 28, 7060);
    			add_location(tr, file$7, 172, 24, 6334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			mount_component(button, td7, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*searchedFoodsImportsName*/ 4) set_data_dev(t0, /*searchedFoodsImportsName*/ ctx[2]);

    			if (!current || dirty & /*foodsImports*/ 8192 && a_href_value !== (a_href_value = "#/foodsImports/" + /*foodsImports*/ ctx[13].name + "/" + /*foodsImports*/ ctx[13].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*searchedFoodsImportsYear*/ 8) set_data_dev(t2, /*searchedFoodsImportsYear*/ ctx[3]);
    			if (!current || dirty & /*searchedFoodsImportsTVegANDPrep*/ 16) set_data_dev(t4, /*searchedFoodsImportsTVegANDPrep*/ ctx[4]);
    			if (!current || dirty & /*searchedFoodsImportsfruitJuice*/ 32) set_data_dev(t6, /*searchedFoodsImportsfruitJuice*/ ctx[5]);
    			if (!current || dirty & /*searchedFoodsImportsTSweANDCndy*/ 64) set_data_dev(t8, /*searchedFoodsImportsTSweANDCndy*/ ctx[6]);
    			if (!current || dirty & /*searchedFoodsImportsTLiveAnimal*/ 128) set_data_dev(t10, /*searchedFoodsImportsTLiveAnimal*/ ctx[7]);
    			if (!current || dirty & /*searchedFoodsImportsFishFilletANDMince*/ 256) set_data_dev(t12, /*searchedFoodsImportsFishFilletANDMince*/ ctx[8]);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 67108864) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(172:24) {#if searchedFoodsImportsTSweANDCndy!=undefined}",
    		ctx
    	});

    	return block;
    }

    // (184:32) <Button outline color="danger" on:click={() => deleteFoodsImports(foodsImports.name,foodsImports.year)}>
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(184:32) <Button outline color=\\\"danger\\\" on:click={() => deleteFoodsImports(foodsImports.name,foodsImports.year)}>",
    		ctx
    	});

    	return block;
    }

    // (170:41)                       {:then foodsImports}
    function create_pending_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(170:41)                       {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      let foodsImports={}
    function create_catch_block$4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(1:0) <script>      let foodsImports={}",
    		ctx
    	});

    	return block;
    }

    // (155:20) {:then foodsImports}
    function create_then_block$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*foodsImports*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*deleteFoodsImports, foodsImports*/ 8192) {
    				each_value = /*foodsImports*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(155:20) {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (165:36) <Button outline color="danger" on:click={() => deleteFoodsImports(food.Name,food.Year)}>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(165:36) <Button outline color=\\\"danger\\\" on:click={() => deleteFoodsImports(food.Name,food.Year)}>",
    		ctx
    	});

    	return block;
    }

    // (156:24) {#each foodsImports as food}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*food*/ ctx[23].name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*food*/ ctx[23].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*food*/ ctx[23].TVegANDPrep + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*food*/ ctx[23].fruitJuice + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*food*/ ctx[23].TSweANDCndy + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*food*/ ctx[23].TLiveAnimal + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*food*/ ctx[23].FishFilletANDMince + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14;
    	let current;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[21](/*food*/ ctx[23], ...args);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			create_component(button.$$.fragment);
    			t14 = space();
    			attr_dev(a, "href", a_href_value = "#/foodsImports/" + /*food*/ ctx[23].name + "/" + /*food*/ ctx[23].year);
    			add_location(a, file$7, 157, 36, 5446);
    			add_location(td0, file$7, 157, 32, 5442);
    			add_location(td1, file$7, 158, 32, 5549);
    			add_location(td2, file$7, 159, 32, 5603);
    			add_location(td3, file$7, 160, 32, 5664);
    			add_location(td4, file$7, 161, 32, 5724);
    			add_location(td5, file$7, 162, 32, 5785);
    			add_location(td6, file$7, 163, 32, 5846);
    			add_location(td7, file$7, 164, 32, 5914);
    			add_location(tr, file$7, 156, 28, 5404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			mount_component(button, td7, null);
    			append_dev(tr, t14);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*foodsImports*/ 8192) && t0_value !== (t0_value = /*food*/ ctx[23].name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*foodsImports*/ 8192 && a_href_value !== (a_href_value = "#/foodsImports/" + /*food*/ ctx[23].name + "/" + /*food*/ ctx[23].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*foodsImports*/ 8192) && t2_value !== (t2_value = /*food*/ ctx[23].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*foodsImports*/ 8192) && t4_value !== (t4_value = /*food*/ ctx[23].TVegANDPrep + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*foodsImports*/ 8192) && t6_value !== (t6_value = /*food*/ ctx[23].fruitJuice + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*foodsImports*/ 8192) && t8_value !== (t8_value = /*food*/ ctx[23].TSweANDCndy + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*foodsImports*/ 8192) && t10_value !== (t10_value = /*food*/ ctx[23].TLiveAnimal + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*foodsImports*/ 8192) && t12_value !== (t12_value = /*food*/ ctx[23].FishFilletANDMince + "")) set_data_dev(t12, t12_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 67108864) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(156:24) {#each foodsImports as food}",
    		ctx
    	});

    	return block;
    }

    // (154:41)                       {:then foodsImports}
    function create_pending_block$4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(154:41)                       {:then foodsImports}",
    		ctx
    	});

    	return block;
    }

    // (138:4) <Table bordered>
    function create_default_slot$4(ctx) {
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let tbody;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*on*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "PAÍS";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "AÑO";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "VEGETALES Y PREPARADOS";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "ZUMO DE FRUTAS";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "DULCES Y CARAMELOS";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "ANIMALES VIVOS";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "FILETES DE PESCADO Y DESMEDUZADO";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Acciones";
    			t15 = space();
    			tbody = element("tbody");
    			if_block.c();
    			add_location(th0, file$7, 140, 16, 4812);
    			add_location(th1, file$7, 141, 16, 4843);
    			add_location(th2, file$7, 142, 16, 4873);
    			add_location(th3, file$7, 143, 16, 4922);
    			add_location(th4, file$7, 144, 16, 4963);
    			add_location(th5, file$7, 145, 16, 5008);
    			add_location(th6, file$7, 146, 16, 5049);
    			add_location(th7, file$7, 147, 16, 5108);
    			add_location(tr, file$7, 139, 12, 4790);
    			add_location(thead, file$7, 138, 8, 4769);
    			add_location(tbody, file$7, 150, 8, 5172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(tr, t11);
    			append_dev(tr, th6);
    			append_dev(tr, t13);
    			append_dev(tr, th7);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, tbody, anchor);
    			if_blocks[current_block_type_index].m(tbody, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(tbody, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(tbody);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(138:4) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (194:4) {#if errorMsg}
    function create_if_block$7(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("ERROR: ");
    			t1 = text(/*errorMsg*/ ctx[9]);
    			t2 = text(". No se ha logrado encontrar su/s registro/s, inténtelo de nuevo con otros parámetros");
    			set_style(p, "color", "red");
    			add_location(p, file$7, 194, 4, 7415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 512) set_data_dev(t1, /*errorMsg*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(194:4) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const table0 = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*tipo*/ ctx[12] == 1 && create_if_block_6$1(ctx);
    	let if_block1 = /*tipo*/ ctx[12] == 2 && create_if_block_5$1(ctx);
    	let if_block2 = /*tipo*/ ctx[12] == 3 && create_if_block_4$1(ctx);

    	const table1 = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block3 = /*errorMsg*/ ctx[9] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(table0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			create_component(table1.$$.fragment);
    			t4 = space();
    			if (if_block3) if_block3.c();
    			add_location(main, file$7, 106, 0, 3913);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(table0, main, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t3);
    			mount_component(table1, main, null);
    			append_dev(main, t4);
    			if (if_block3) if_block3.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table0_changes = {};

    			if (dirty & /*$$scope, busYear, busName*/ 67108867) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);

    			if (/*tipo*/ ctx[12] == 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tipo*/ ctx[12] == 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$1(ctx);
    					if_block1.c();
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*tipo*/ ctx[12] == 3) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$1(ctx);
    					if_block2.c();
    					if_block2.m(main, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const table1_changes = {};

    			if (dirty & /*$$scope, foodsImports, varios, searchedFoodsImportsFishFilletANDMince, searchedFoodsImportsTLiveAnimal, searchedFoodsImportsTSweANDCndy, searchedFoodsImportsfruitJuice, searchedFoodsImportsTVegANDPrep, searchedFoodsImportsYear, searchedFoodsImportsName, on*/ 67120636) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);

    			if (/*errorMsg*/ ctx[9]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$7(ctx);
    					if_block3.c();
    					if_block3.m(main, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(table0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(table1);
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function deleteFoodsImports(name, year) {
    	console.log("Queremos eliminar: " + name + " " + year + "/api/v2/foodsImports/" + name + "/" + year);

    	const res = await fetch("/api/v2/foodsImports/" + name + "/" + year, { method: "DELETE" }).then(function (res) {
    		getFoodsImports(offset, offset_aux);
    	});
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let foodsImports = {};

    	//Parametros de búsqueda 
    	let busName = "";

    	let busYear = "";

    	//Introducción y creación de tablas con un único elemento
    	let searchedFoodsImportsName = "";

    	let searchedFoodsImportsYear = "";
    	let searchedFoodsImportsTVegANDPrep = "";
    	let searchedFoodsImportsfruitJuice = "";
    	let searchedFoodsImportsTSweANDCndy = "";
    	let searchedFoodsImportsTLiveAnimal = "";
    	let searchedFoodsImportsFishFilletANDMince = "";

    	//Mensaje de Error
    	let errorMsg = "";

    	//Varios elementos para generar varias filas y no solo una
    	let varios = false;

    	//Se ha realizado una busqueda? ON=si 
    	let on = false;

    	//Tipo de Búsqueda, null=0,año=1, país=2 o ambas=3;
    	let tipo = 0;

    	async function getFoodsImport_aux1() {
    		$$invalidate(10, varios = false);

    		if ((busName == "" || busName == undefined) && (busYear != undefined && busYear != "")) {
    			getFoodsImportYear();
    		}

    		if (busName != "" && busName != undefined && (busYear == undefined || busYear == "")) {
    			getFoodsImportName();
    		}

    		if (busName != "" && busName != undefined && (busYear != undefined && busYear != "")) {
    			getFoodsImportAll();
    		}
    	}

    	async function getFoodsImportYear() {
    		$$invalidate(12, tipo = 1);
    		const res = await fetch("/api/v2/foodsImports/" + busYear);
    		getFoodsImport(res);
    	}

    	async function getFoodsImportName() {
    		$$invalidate(12, tipo = 2);
    		const res = await fetch("/api/v2/foodsImports/" + busName);
    		getFoodsImport(res);
    	}

    	async function getFoodsImportAll() {
    		$$invalidate(12, tipo = 3);
    		const res = await fetch("/api/v2/foodsImports/" + busName + "/" + busYear);
    		getFoodsImport(res);
    	}

    	async function getFoodsImport(res) {
    		console.log("Fetching Food...");
    		console.log("Name:" + busName + " Year:" + busYear);
    		console.log("RES: " + res.ok);

    		if (res.ok) {
    			$$invalidate(11, on = true);
    			console.log("Ok:");
    			$$invalidate(9, errorMsg = "");
    			const json = await res.json();
    			$$invalidate(13, foodsImports = json);

    			if (foodsImports.length > 1) {
    				$$invalidate(10, varios = true);
    			} else {
    				if (foodsImports.length == undefined) ; else {
    					$$invalidate(13, foodsImports = foodsImports[0]);
    				}
    			}

    			console.log("Datitoss: " + foodsImports.name);
    			$$invalidate(2, searchedFoodsImportsName = foodsImports.name);
    			$$invalidate(3, searchedFoodsImportsYear = foodsImports.year);
    			$$invalidate(4, searchedFoodsImportsTVegANDPrep = foodsImports.TVegANDPrep);
    			$$invalidate(5, searchedFoodsImportsfruitJuice = foodsImports.fruitJuice);
    			$$invalidate(6, searchedFoodsImportsTSweANDCndy = foodsImports.TSweANDCndy);
    			$$invalidate(7, searchedFoodsImportsTLiveAnimal = foodsImports.TLiveAnimal);
    			$$invalidate(8, searchedFoodsImportsFishFilletANDMince = foodsImports.FishFilletANDMince);
    			console.log("Received food");
    		} else {
    			$$invalidate(4, searchedFoodsImportsTVegANDPrep = undefined);
    			$$invalidate(5, searchedFoodsImportsfruitJuice = undefined);
    			$$invalidate(6, searchedFoodsImportsTSweANDCndy = undefined);
    			$$invalidate(7, searchedFoodsImportsTLiveAnimal = undefined);
    			$$invalidate(8, searchedFoodsImportsFishFilletANDMince = undefined);
    			$$invalidate(9, errorMsg = res.status + ": " + res.statusText);
    			console.log("Error" + errorMsg);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<SearchFoodsImport> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SearchFoodsImport", $$slots, []);

    	function input0_input_handler() {
    		busName = this.value;
    		$$invalidate(0, busName);
    	}

    	function input1_input_handler() {
    		busYear = this.value;
    		$$invalidate(1, busYear);
    	}

    	const click_handler = food => deleteFoodsImports(food.Name, food.Year);
    	const click_handler_1 = foodsImports => deleteFoodsImports(foodsImports.name, foodsImports.year);

    	$$self.$capture_state = () => ({
    		foodsImports,
    		Table,
    		Button,
    		onMount,
    		busName,
    		busYear,
    		searchedFoodsImportsName,
    		searchedFoodsImportsYear,
    		searchedFoodsImportsTVegANDPrep,
    		searchedFoodsImportsfruitJuice,
    		searchedFoodsImportsTSweANDCndy,
    		searchedFoodsImportsTLiveAnimal,
    		searchedFoodsImportsFishFilletANDMince,
    		errorMsg,
    		varios,
    		on,
    		tipo,
    		getFoodsImport_aux1,
    		getFoodsImportYear,
    		getFoodsImportName,
    		getFoodsImportAll,
    		getFoodsImport,
    		deleteFoodsImports
    	});

    	$$self.$inject_state = $$props => {
    		if ("foodsImports" in $$props) $$invalidate(13, foodsImports = $$props.foodsImports);
    		if ("busName" in $$props) $$invalidate(0, busName = $$props.busName);
    		if ("busYear" in $$props) $$invalidate(1, busYear = $$props.busYear);
    		if ("searchedFoodsImportsName" in $$props) $$invalidate(2, searchedFoodsImportsName = $$props.searchedFoodsImportsName);
    		if ("searchedFoodsImportsYear" in $$props) $$invalidate(3, searchedFoodsImportsYear = $$props.searchedFoodsImportsYear);
    		if ("searchedFoodsImportsTVegANDPrep" in $$props) $$invalidate(4, searchedFoodsImportsTVegANDPrep = $$props.searchedFoodsImportsTVegANDPrep);
    		if ("searchedFoodsImportsfruitJuice" in $$props) $$invalidate(5, searchedFoodsImportsfruitJuice = $$props.searchedFoodsImportsfruitJuice);
    		if ("searchedFoodsImportsTSweANDCndy" in $$props) $$invalidate(6, searchedFoodsImportsTSweANDCndy = $$props.searchedFoodsImportsTSweANDCndy);
    		if ("searchedFoodsImportsTLiveAnimal" in $$props) $$invalidate(7, searchedFoodsImportsTLiveAnimal = $$props.searchedFoodsImportsTLiveAnimal);
    		if ("searchedFoodsImportsFishFilletANDMince" in $$props) $$invalidate(8, searchedFoodsImportsFishFilletANDMince = $$props.searchedFoodsImportsFishFilletANDMince);
    		if ("errorMsg" in $$props) $$invalidate(9, errorMsg = $$props.errorMsg);
    		if ("varios" in $$props) $$invalidate(10, varios = $$props.varios);
    		if ("on" in $$props) $$invalidate(11, on = $$props.on);
    		if ("tipo" in $$props) $$invalidate(12, tipo = $$props.tipo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		busName,
    		busYear,
    		searchedFoodsImportsName,
    		searchedFoodsImportsYear,
    		searchedFoodsImportsTVegANDPrep,
    		searchedFoodsImportsfruitJuice,
    		searchedFoodsImportsTSweANDCndy,
    		searchedFoodsImportsTLiveAnimal,
    		searchedFoodsImportsFishFilletANDMince,
    		errorMsg,
    		varios,
    		on,
    		tipo,
    		foodsImports,
    		getFoodsImport_aux1,
    		getFoodsImportYear,
    		getFoodsImportName,
    		getFoodsImportAll,
    		getFoodsImport,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class SearchFoodsImport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchFoodsImport",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\front\Home.svelte generated by Svelte v3.22.2 */

    const file$8 = "src\\front\\Home.svelte";

    function create_fragment$9(ctx) {
    	let a0;
    	let t1;
    	let a1;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			a0.textContent = "GUI del recurso Jorge";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "GUI del recurso Juan Antonio";
    			attr_dev(a0, "href", "#/import");
    			add_location(a0, file$8, 0, 0, 0);
    			attr_dev(a1, "href", "#/foodsImports");
    			add_location(a1, file$8, 2, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\front\ImportsGUI\Home.svelte generated by Svelte v3.22.2 */

    function create_fragment$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("This is ImportsGUI");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	return [];
    }

    class Home$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\front\App.svelte generated by Svelte v3.22.2 */
    const file$9 = "src\\front\\App.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let current;

    	const router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Apis del Grupo 7 SOS";
    			t1 = space();
    			create_component(router.$$.fragment);
    			add_location(h1, file$9, 28, 1, 878);
    			attr_dev(main, "class", "svelte-1k9u9rj");
    			add_location(main, file$9, 27, 0, 869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const routes = {
    		"/": Home,
    		"/import/:country/:year": EditImport,
    		"/import": ImportsTable,
    		"/foodsImports": FoodImportsTable,
    		"/foodsImports/:foodsName/:foodsYear": EditFoodsImports,
    		"/foodsImports/SearchFoodsImport/": SearchFoodsImport,
    		"/importsgui": Home$1,
    		"*": NotFound
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		ImportsTable,
    		EditImport,
    		NotFound,
    		FoodImportsTable,
    		EditFoodsImports,
    		SearchFoodsImport,
    		Home,
    		GUIIMPORTS: Home$1,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector('#SvelteApp')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
