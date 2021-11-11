
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
            set_current_component(null);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function fix_and_destroy_block(block, lookup) {
        block.f();
        destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
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

    const store = readable({
      tech: [
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
          href: "https://www.javascript.com/",
        },
        {
          name: "TypeScript",
          src: "images/icons/iconTypescript.png",
          href: "https://www.typescriptlang.org/",
        },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
          href: "https://developer.mozilla.org/en-US/docs/Glossary/HTML5",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
          href: "https://www.css3.info/",
        },
        {
          name: "React",
          class: "fab fa-react",
          color: "#61dafb",
          href: "https://reactjs.org/",
        },
        {
          name: "React Native",
          class: "fab fa-react",
          color: "#61dafb",
          href: "https://reactnative.dev",
        },
        {
          name: "Svelte",
          src: "images/icons/iconSvelte.png",
          href: "https://svelte.dev",
        },
        {
          name: "Node.js",
          class: "fab fa-node-js",
          color: "#68a063",
          href: "https://nodejs.dev",
        },
        {
          name: "Express",
          src: "images/icons/iconExpress.png",
          href: "https://expressjs.com",
        },
        {
          name: "Postgres",
          src: "images/icons/iconPostgres.png",
          href: "https://www.postgresql.org",
        },
        {
          name: "MongoDB",
          src: "images/icons/iconMongodb.png",
          href: "https://www.mongodb.com",
        },
        {
          name: "GraphQL",
          src: "images/icons/iconGraphql.png",
          href: "https://graphql.org",
        },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
          href: "https://git-scm.com",
        },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
          href: "https://www.github.com",
        },
        {
          name: "Terminal",
          class: "fas fa-terminal",
          color: "white",
          href: "https://en.wikipedia.org/wiki/Bash_(Unix_shell)",
        },
        {
          name: "Heroku",
          src: "images/icons/iconHeroku.png",
          href: "https://www.heroku.com",
        },
        {
          name: "Apollo Client/Server",
          src: "images/icons/iconApollo.png",
          href: "https://www.apollographql.com",
        },
        {
          name: "Testim",
          src: "images/icons/testim.jpg",
          href: "https://testim.io",
        },
        {
          name: "Azure DevOps",
          src: "images/icons/azure.png",
          href: "https://azure.microsoft.com/en-us/services/devops/",
        },
        {
          name: "Elasticsearch",
          src: "images/icons/iconElastic.png",
          href: "https://www.elastic.co/",
        },
      ],
      learning: [
        // { name: "ASP.NET Core", src: "images/icons/iconDotnet.png" },
        // { name: "C#", src: "images/icons/iconCsharp.png" },
        // { name: "Java", src: "images/icons/iconJava.png" },
        { name: "Test Automation", class: "fas fa-bug", color: "white" },
        {
          name: "Performance Testing",
          class: "fas fa-tachometer-alt",
          color: "white",
        },
        {
          name: "Data Visualization",
          class: "fas fa-chart-bar",
          color: "white",
        },
        { name: "Front End Development", class: "fas fa-code", color: "white" },
        { name: "Back End Development", class: "fas fa-database", color: "white" },
        { name: "Communication", class: "far fa-comment-alt", color: "white" },
      ],
      OTmobile: {
        name: "Overtime Tracker",
        tech: {
          frontend: [
            { name: "React Native", class: "fab fa-react", color: "#61dafb" },
            { name: "TypeScript", src: "images/icons/iconTypescript.png" },
            { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
            { name: "CSS", class: "fab fa-css3", color: "#264de4" },
          ],
          misc: [
            { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
            { name: "Git", class: "fab fa-git-alt", color: "#f05030" },
            { name: "Expo", src: "images/icons/iconExpo.png" },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/OT/OThome.png" },
          { src: "images/OT/OTnew.png" },
          { src: "images/OT/OTdatepicker.png" },
          { src: "images/OT/OTadded.png" },
          { src: "images/OT/OTall.png" },
          { src: "images/OT/OTupdate.png" },
          { src: "images/OT/OTdelete.png" },
        ],
      },
      safetyBlanket: {
        name: "Safety Blanket",
        tech: {
          frontend: [
            { name: "React Native", class: "fab fa-react", color: "#61dafb" },
            { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
            { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
            { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
            { name: "GraphQL", src: "images/icons/iconGraphql.png" },
            { name: "Apollo Client", src: "images/icons/iconApollo.png" },
          ],
          backend: [
            { name: "MongoDB", src: "images/icons/iconMongodb.png" },
            { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
            { name: "GraphQL", src: "images/icons/iconGraphql.png" },
            { name: "Apollo Server", src: "images/icons/iconApollo.png" },
          ],
          misc: [
            { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
            { name: "Git", class: "fab fa-git-alt", color: "#f05030" },
            { name: "Expo", src: "images/icons/iconExpo.png" },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/safetyblanket/safetyHome.png" },
          { src: "images/safetyblanket/safetyHomeBottom.png" },
          { src: "images/safetyblanket/safetyCall.png" },
          { src: "images/safetyblanket/safetyStateList.png" },
          { src: "images/safetyblanket/safetyDeptList.png" },
          { src: "images/safetyblanket/safetyAddContact.png" },
          { src: "images/safetyblanket/safetyContactAdded.png" },
          { src: "images/safetyblanket/safetyFaq.png" },
        ],
      },
      uxDashboard: {
        name: "UX Test Dashboard",
        tech: {
          frontend: [{ name: "Kibana", src: "images/icons/kibana.svg" }],
          backend: [
            { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
            { name: "Elasticsearch", src: "images/icons/iconElastic.png" },
            { name: "Express", src: "images/icons/iconExpress.png" },
          ],
          misc: [
            { name: "Testim.io", src: "images/icons/testim.jpg" },
            { name: "Git", class: "fab fa-git-alt", color: "#f05030" },
          ],
        },
        images: [{ src: "images/dashboardscreenshot.PNG" }],
      },
      fypMobile: {
        name: "Find Your Park Mobile",
        tech: {
          frontend: [
            {
              name: "React Native",
              class: "fab fa-react",
              color: "#61dafb",
            },
            {
              name: "JavaScript",
              class: "fab fa-js",
              color: "#eace2c",
            },
            {
              name: "HTML5",
              class: "fab fa-html5",
              color: "rgb(234,100,51)",
            },
            {
              name: "CSS3",
              class: "fab fa-css3",
              color: "#264de4",
            },
          ],
          backend: [
            {
              name: "Postgres",
              src: "images/icons/iconPostgres.png",
            },
            { name: "Express", src: "images/icons/iconExpress.png" },
            {
              name: "Node.js",
              class: "fab fa-node-js",
              color: "#68a063",
            },
            { name: "Knex", src: "images/icons/iconKnex.png" },
          ],
          misc: [
            {
              name: "npm",
              class: "fab fa-npm",
              color: "rgb(181,52,54)",
            },
            {
              name: "Git",
              class: "fab fa-git-alt",
              color: "#f05030",
            },
            { name: "Heroku", src: "images/icons/iconHeroku.png" },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/fypmobile/fypMobileHome.png" },
          { src: "images/fypmobile/fypMobileMap.png" },
          { src: "images/fypmobile/fypMobilePark.png" },
          { src: "images/fypmobile/fypMobileComments.png" },
          { src: "images/fypmobile/fypMobileSignup.png" },
          { src: "images/fypmobile/fypMobileLogin2.png" },
        ],
      },
      hearsay: {
        name: "Hearsay",
        tech: {
          frontend: [
            {
              name: "React",
              class: "fab fa-react",
              color: "#61dafb",
            },
            {
              name: "JavaScript",
              class: "fab fa-js",
              color: "#eace2c",
            },
            {
              name: "HTML5",
              class: "fab fa-html5",
              color: "rgb(234,100,51)",
            },
            {
              name: "CSS3",
              class: "fab fa-css3",
              color: "#264de4",
            },
          ],
          backend: [
            { name: "Node.js", color: "#68a063", class: "fab fa-node-js" },
            { name: "Postgres", src: "images/icons/iconPostgres.png" },
            { name: "Express", src: "images/icons/iconExpress.png" },
            { name: "Knex", src: "images/icons/iconKnex.png" },
          ],
          misc: [
            {
              name: "npm",
              class: "fab fa-npm",
              color: "rgb(181,52,54)",
            },
            { name: "Heroku", src: "images/icons/iconHeroku.png" },
            { name: "Vercel", src: "images/icons/iconVercel.jpg" },
            {
              name: "Git",
              class: "fab fa-git-alt",
              color: "#f05030",
            },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/hearsay/hearsayHome.png" },
          { src: "images/hearsay/hearsayAgencies.png" },
          { src: "images/hearsay/hearsayRegister.png" },
          { src: "images/hearsay/hearsayLogin.png" },
          { src: "images/hearsay/hearsayReview.png" },
          { src: "images/hearsay/hearsayDiscussion.png" },
        ],
      },
      fyp: {
        name: "Find Your Park",
        tech: {
          frontend: [
            {
              name: "React",
              class: "fab fa-react",
              color: "#61dafb",
            },
            {
              name: "JavaScript",
              class: "fab fa-js",
              color: "#eace2c",
            },
            {
              name: "HTML5",
              class: "fab fa-html5",
              color: "rgb(234,100,51)",
            },
            {
              name: "CSS3",
              class: "fab fa-css3",
              color: "#264de4",
            },
          ],
          backend: [
            {
              name: "Node.js",
              class: "fab fa-node-js",
              color: "#68a063",
            },
            { name: "Postgres", src: "images/icons/iconPostgres.png" },
            { name: "Express", src: "images/icons/iconExpress.png" },
            { name: "Knex", src: "images/icons/iconKnex.png" },
          ],
          misc: [
            {
              name: "npm",
              class: "fab fa-npm",
              color: "rgb(181,52,54)",
            },
            { name: "Heroku", src: "images/icons/iconHeroku.png" },
            { name: "Netlify", src: "images/icons/iconNetlify.png" },
            {
              name: "Git",
              class: "fab fa-git-alt",
              color: "#f05030",
            },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/fyp/fypHome.jpg" },
          { src: "images/fyp/fypPark.jpg" },
          { src: "images/fyp/fypList.jpg" },
          { src: "images/fyp/fypSignup.jpg" },
          { src: "images/fyp/fypLogin.jpg" },
          { src: "images/fyp/fypComments.jpg" },
        ],
      },
      mealGenerator: {
        name: "Meal Generator",
        tech: {
          frontend: [
            {
              name: "JavaScript",
              class: "fab fa-js",
              color: "#eace2c",
            },
            { name: "jQuery", src: "images/icons/iconJquery.png" },
            {
              name: "HTML5",
              class: "fab fa-html5",
              color: "rgb(234,100,51)",
            },
            {
              name: "CSS3",
              class: "fab fa-css3",
              color: "#264de4",
            },
          ],
          misc: [
            {
              name: "npm",
              class: "fab fa-npm",
              color: "rgb(181,52,54)",
            },
            {
              name: "Git",
              class: "fab fa-git-alt",
              color: "#f05030",
            },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [
          { src: "images/mealgenerator/meal.png" },
          { src: "images/mealgenerator/mealList.png" },
          { src: "images/mealgenerator/mealIngredients.png" },
        ],
      },
      portfolio: {
        name: "Portfolio",
        tech: {
          frontend: [
            {
              name: "Svelte",
              src: "images/icons/iconSvelte.png",
            },
            {
              name: "JavaScript",
              class: "fab fa-js",
              color: "#eace2c",
            },
            {
              name: "HTML5",
              class: "fab fa-html5",
              color: "rgb(234,100,51)",
            },
            {
              name: "CSS3",
              class: "fab fa-css3",
              color: "#264de4",
            },
          ],
          misc: [
            {
              name: "npm",
              class: "fab fa-npm",
              color: "rgb(181,52,54)",
            },
            {
              name: "Git",
              class: "fab fa-git-alt",
              color: "#f05030",
            },
            {
              name: "GitHub",
              class: "fab fa-github",
              color: "rgb(210,105,35)",
            },
          ],
        },
        images: [{ src: "images/portfoliohome.png" }],
      },
      experience1: `I currently work as a Jr. Software Development Engineer in Test at Axos Bank in
  San Diego, working mainly on test automation and testing metrics. During my first few months
  at the bank I established myself as a leader within the testing team. I took the initiative to 
  expand on our automation framework, Testim.io, by building out a Node.js/Express API that fed
  our testing data into an Elasticsearch cluster. Within Elasticsearch I then visualized the data
  using Kibana, so internal teams could see how their applications were performaing in both production 
  and test environments. In addition to gathering data on applications, I also created a pipeline to 
  ingest metadata from the testing framework itself, allowing the team to see how efficiently we were
  using it.`,
      experience2: `In my free time I enjoy coding full-stack web applications. I regularly work with React, Node.js, 
  SQL and NoSQL Databases (mainly Postgres & MongoDB), REST & GraphQL APIs, and of 
  course HTML & CSS. I've recently branched
    out on the front-end - I picked up Vue fairly quickly and started
    working with Svelte (which is what I rebuilt this site with!), as well
    as the back-end - I've been refactoring my "Find Your Park" app from a
    REST to a GraphQL API. In addition to the web, I've published a mobile
    version of one of my apps to Apple's app store using React Native, and I
    have another in production.`,
      experience3: `I genuinely love to program - creating something from nothing is just
    awesome. On the other hand, digging deep into somebody elses code to
    figure out how it works or to troubleshoot a problem is equally
    rewarding. I find the process of learning new technologies both exciting
    and humbling - the software development field has a way of telling you
    how little you truly know and how much more knowledge there will always
    be to gain.`,
      experience4: `Fun Fact: I worked for nearly 5 years as a 911 Emergency Dispatcher.
  This experience has taught me how to be an oustanding communicator with both co-workers and the public, as well 
  as how to remain calm and deliver results under stressful circumstances.  
  `,
      about1: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
      about2: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
      subtitle: [
        "F",
        "u",
        "l",
        "l",
        " ",
        "S",
        "t",
        "a",
        "c",
        "k",
        " ",
        "W",
        "e",
        "b",
        " ",
        "D",
        "e",
        "v",
        "e",
        "l",
        "o",
        "p",
        "e",
        "r",
      ],
    });

    const darkmode = writable(false);

    /* src/components/utils/Switch.svelte generated by Svelte v3.31.0 */

    const file = "src/components/utils/Switch.svelte";

    function create_fragment(ctx) {
    	let label;
    	let input;
    	let t0;
    	let div1;
    	let div0;
    	let i0;
    	let t1;
    	let div2;
    	let i1;
    	let t2;
    	let div3;
    	let i2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t1 = space();
    			div2 = element("div");
    			i1 = element("i");
    			t2 = space();
    			div3 = element("div");
    			i2 = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			label = claim_element(nodes, "LABEL", { class: true });
    			var label_nodes = children(label);
    			input = claim_element(label_nodes, "INPUT", { type: true, class: true });
    			t0 = claim_space(label_nodes);
    			div1 = claim_element(label_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i0 = claim_element(div0_nodes, "I", { class: true, id: true });
    			children(i0).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t1 = claim_space(label_nodes);
    			div2 = claim_element(label_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			i1 = claim_element(div2_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(label_nodes);
    			div3 = claim_element(label_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			i2 = claim_element(div3_nodes, "I", { class: true });
    			children(i2).forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			label_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-1rx3hhz");
    			add_location(input, file, 81, 4, 1665);
    			attr_dev(i0, "class", "fas fa-caret-left svelte-1rx3hhz");
    			attr_dev(i0, "id", "arrow");
    			add_location(i0, file, 83, 31, 1760);
    			attr_dev(div0, "class", "arrow-box svelte-1rx3hhz");
    			add_location(div0, file, 83, 8, 1737);
    			attr_dev(div1, "class", "slider svelte-1rx3hhz");
    			add_location(div1, file, 82, 4, 1708);
    			attr_dev(i1, "class", "fas fa-sun svelte-1rx3hhz");
    			add_location(i1, file, 85, 31, 1851);
    			attr_dev(div2, "class", "icon-box-left svelte-1rx3hhz");
    			add_location(div2, file, 85, 4, 1824);
    			attr_dev(i2, "class", "fas fa-moon svelte-1rx3hhz");
    			add_location(i2, file, 86, 32, 1914);
    			attr_dev(div3, "class", "icon-box-right svelte-1rx3hhz");
    			add_location(div3, file, 86, 4, 1886);
    			attr_dev(label, "class", "switch svelte-1rx3hhz");
    			add_location(label, file, 80, 0, 1638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i0);
    			append_dev(label, t1);
    			append_dev(label, div2);
    			append_dev(div2, i1);
    			append_dev(label, t2);
    			append_dev(label, div3);
    			append_dev(div3, i2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, []);
    	let { checked = false } = $$props;
    	const writable_props = ["checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ checked });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/components/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (18:8) {#each $store.subtitle as letter, i}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*letter*/ ctx[3] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$1, 18, 10, 479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && t_value !== (t_value = /*letter*/ ctx[3] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fade, {
    						delay: /*i*/ ctx[5] * 100,
    						duration: 1000
    					});

    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:8) {#each $store.subtitle as letter, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let div3;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let div0;
    	let h2;
    	let t3;
    	let div2;
    	let switch_1;
    	let updating_checked;
    	let div3_class_value;
    	let div3_intro;
    	let current;
    	let each_value = /*$store*/ ctx[1].subtitle;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[2].call(null, value);
    	}

    	let switch_1_props = {};

    	if (/*$darkmode*/ ctx[0] !== void 0) {
    		switch_1_props.checked = /*$darkmode*/ ctx[0];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "checked", switch_1_checked_binding));

    	const block = {
    		c: function create() {
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text("Ross MacDonald");
    			t2 = space();
    			div0 = element("div");
    			h2 = element("h2");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			create_component(switch_1.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-18a7xwj\"]", document.head);
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Ross MacDonald");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h2 = claim_element(div0_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(h2_nodes);
    			}

    			h2_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t3 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(switch_1.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Ross MacDonald";
    			attr_dev(h1, "class", "svelte-9ja34g");
    			add_location(h1, file$1, 14, 4, 360);
    			attr_dev(h2, "class", "svelte-9ja34g");
    			add_location(h2, file$1, 16, 6, 419);
    			attr_dev(div0, "class", "sub-header svelte-9ja34g");
    			add_location(div0, file$1, 15, 4, 388);
    			attr_dev(div1, "class", "container svelte-9ja34g");
    			add_location(div1, file$1, 13, 2, 332);
    			attr_dev(div2, "class", "switch-box svelte-9ja34g");
    			add_location(div2, file$1, 23, 2, 596);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[0] ? "page-box dark" : "page-box") + " svelte-9ja34g"));
    			add_location(div3, file$1, 9, 0, 222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, h2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(h2, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(switch_1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$store*/ 2) {
    				each_value = /*$store*/ ctx[1].subtitle;
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
    						each_blocks[i].m(h2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*$darkmode*/ 1) {
    				updating_checked = true;
    				switch_1_changes.checked = /*$darkmode*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);

    			if (!current || dirty & /*$darkmode*/ 1 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[0] ? "page-box dark" : "page-box") + " svelte-9ja34g"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(switch_1.$$.fragment, local);

    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, fly, { duration: 1000, y: 300, delay: 400 });
    					div3_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(switch_1);
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
    	let $darkmode;
    	let $store;
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(0, $darkmode = $$value));
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(1, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function switch_1_checked_binding(value) {
    		$darkmode = value;
    		darkmode.set($darkmode);
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		store,
    		darkmode,
    		Switch,
    		$darkmode,
    		$store
    	});

    	return [$darkmode, $store, switch_1_checked_binding];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/utils/CornerLogo.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/components/utils/CornerLogo.svelte";

    // (61:0) {#if y < 200}
    function create_if_block(ctx) {
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let hr;
    	let t2;
    	let div0;
    	let h2;
    	let t3;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text("Ross MacDonald");
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t3 = text("Full Stack Web Developer");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Ross MacDonald");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			hr = claim_element(div1_nodes, "HR", { class: true });
    			t2 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h2 = claim_element(div0_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t3 = claim_text(h2_nodes, "Full Stack Web Developer");
    			h2_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "corner-name svelte-6i5zmz");
    			add_location(h1, file$2, 65, 8, 1359);
    			attr_dev(hr, "class", "svelte-6i5zmz");
    			add_location(hr, file$2, 66, 8, 1411);
    			attr_dev(h2, "class", "corner-sub svelte-6i5zmz");
    			add_location(h2, file$2, 68, 12, 1463);
    			attr_dev(div0, "class", "sub-header svelte-6i5zmz");
    			add_location(div0, file$2, 67, 8, 1426);
    			attr_dev(div1, "class", "container svelte-6i5zmz");
    			add_location(div1, file$2, 61, 4, 1216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, hr);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t3);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { delay: 500, y: -100, duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fly, { duration: 1000, y: -100 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(61:0) {#if y < 200}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[1]);
    	let if_block = /*y*/ ctx[0] < 200 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[1]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*y*/ ctx[0] < 200) {
    				if (if_block) {
    					if (dirty & /*y*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CornerLogo", slots, []);
    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CornerLogo> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ y, fly });

    	$$self.$inject_state = $$props => {
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [y, onwindowscroll];
    }

    class CornerLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CornerLogo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/utils/Layout.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/components/utils/Layout.svelte";

    function create_fragment$3(ctx) {
    	let div3;
    	let div1;
    	let cornerlogo;
    	let t0;
    	let div0;
    	let div0_intro;
    	let div0_outro;
    	let t1;
    	let div2;
    	let switch_1;
    	let updating_checked;
    	let div3_class_value;
    	let current;
    	cornerlogo = new CornerLogo({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[3].call(null, value);
    	}

    	let switch_1_props = {};

    	if (/*$darkmode*/ ctx[0] !== void 0) {
    		switch_1_props.checked = /*$darkmode*/ ctx[0];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "checked", switch_1_checked_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			create_component(cornerlogo.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div2 = element("div");
    			create_component(switch_1.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div3 = claim_element(nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			claim_component(cornerlogo.$$.fragment, div1_nodes);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(switch_1.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "slot-container svelte-1wc5wwj");
    			add_location(div0, file$3, 10, 4, 295);
    			attr_dev(div1, "class", "container svelte-1wc5wwj");
    			add_location(div1, file$3, 8, 2, 248);
    			attr_dev(div2, "class", "switch-box svelte-1wc5wwj");
    			add_location(div2, file$3, 18, 2, 459);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[0] ? "page dark" : "page") + " svelte-1wc5wwj"));
    			add_location(div3, file$3, 7, 0, 199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(cornerlogo, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(switch_1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*$darkmode*/ 1) {
    				updating_checked = true;
    				switch_1_changes.checked = /*$darkmode*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);

    			if (!current || dirty & /*$darkmode*/ 1 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[0] ? "page dark" : "page") + " svelte-1wc5wwj"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cornerlogo.$$.fragment, local);
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, fly, { duration: 1500, y: 500, delay: 600 });
    				div0_intro.start();
    			});

    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cornerlogo.$$.fragment, local);
    			transition_out(default_slot, local);
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fade, { duration: 1 });
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(cornerlogo);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_outro) div0_outro.end();
    			destroy_component(switch_1);
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
    	let $darkmode;
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(0, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	function switch_1_checked_binding(value) {
    		$darkmode = value;
    		darkmode.set($darkmode);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		CornerLogo,
    		fade,
    		fly,
    		Switch,
    		darkmode,
    		$darkmode
    	});

    	return [$darkmode, $$scope, slots, switch_1_checked_binding];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/experience.md generated by Svelte v3.31.0 */

    const file$4 = "src/experience.md";

    function create_fragment$4(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;
    	let p2;
    	let t4;
    	let t5;
    	let hr0;
    	let t6;
    	let p3;
    	let strong;
    	let t7;
    	let t8;
    	let t9;
    	let hr1;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("I currently work as a Jr. Software Development Engineer in Test at Axos Bank in\nSan Diego, working mainly on test automation and testing metrics. During my first few months at the bank I established myself as a leader within the testing team. I took the initiative to expand on our automation framework, Testim.io, by building out a Node.js/Express API that fed our testing data into an Elasticsearch cluster. Within Elasticsearch I then visualized the data using Kibana, so internal teams could see how their applications were performaing in both production and test environments. In addition to gathering data on applications, I also created a pipeline to ingest metadata from the testing framework itself, allowing the team to see how efficiently we were\nusing it.");
    			t1 = space();
    			p1 = element("p");
    			t2 = text("In my free time I enjoy coding full-stack web applications. I regularly work with React, Node.js, SQL and NoSQL Databases (mainly Postgres & MongoDB), REST & GraphQL APIs, and of\ncourse HTML & CSS. I’ve recently branched out on the front-end - I picked up Vue fairly quickly and started working with Svelte (which is what I rebuilt this site with!), as well\nas the back-end - I’ve been refactoring my “Find Your Park” app from a REST to a GraphQL API. In addition to the web, I’ve published a mobile version of one of my apps to Apple’s app store using React Native, and I have another in production.");
    			t3 = space();
    			p2 = element("p");
    			t4 = text("I genuinely love to program - creating something from nothing is just\nawesome. On the other hand, digging deep into somebody elses code to figure out how it works or to troubleshoot a problem is equally rewarding. I find the process of learning new technologies both exciting and humbling - the software development field has a way of telling you how little you truly know and how much more knowledge there will always be to gain.");
    			t5 = space();
    			hr0 = element("hr");
    			t6 = space();
    			p3 = element("p");
    			strong = element("strong");
    			t7 = text("Fun Fact:");
    			t8 = text(" I worked for nearly 5 years as a 911 Emergency Dispatcher. This experience has taught me how to be an oustanding communicator with both co-workers and the public, as well as how to remain calm and deliver results under stressful circumstances.");
    			t9 = space();
    			hr1 = element("hr");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p0 = claim_element(nodes, "P", {});
    			var p0_nodes = children(p0);
    			t0 = claim_text(p0_nodes, "I currently work as a Jr. Software Development Engineer in Test at Axos Bank in\nSan Diego, working mainly on test automation and testing metrics. During my first few months at the bank I established myself as a leader within the testing team. I took the initiative to expand on our automation framework, Testim.io, by building out a Node.js/Express API that fed our testing data into an Elasticsearch cluster. Within Elasticsearch I then visualized the data using Kibana, so internal teams could see how their applications were performaing in both production and test environments. In addition to gathering data on applications, I also created a pipeline to ingest metadata from the testing framework itself, allowing the team to see how efficiently we were\nusing it.");
    			p0_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", {});
    			var p1_nodes = children(p1);
    			t2 = claim_text(p1_nodes, "In my free time I enjoy coding full-stack web applications. I regularly work with React, Node.js, SQL and NoSQL Databases (mainly Postgres & MongoDB), REST & GraphQL APIs, and of\ncourse HTML & CSS. I’ve recently branched out on the front-end - I picked up Vue fairly quickly and started working with Svelte (which is what I rebuilt this site with!), as well\nas the back-end - I’ve been refactoring my “Find Your Park” app from a REST to a GraphQL API. In addition to the web, I’ve published a mobile version of one of my apps to Apple’s app store using React Native, and I have another in production.");
    			p1_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			p2 = claim_element(nodes, "P", {});
    			var p2_nodes = children(p2);
    			t4 = claim_text(p2_nodes, "I genuinely love to program - creating something from nothing is just\nawesome. On the other hand, digging deep into somebody elses code to figure out how it works or to troubleshoot a problem is equally rewarding. I find the process of learning new technologies both exciting and humbling - the software development field has a way of telling you how little you truly know and how much more knowledge there will always be to gain.");
    			p2_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			hr0 = claim_element(nodes, "HR", {});
    			t6 = claim_space(nodes);
    			p3 = claim_element(nodes, "P", {});
    			var p3_nodes = children(p3);
    			strong = claim_element(p3_nodes, "STRONG", {});
    			var strong_nodes = children(strong);
    			t7 = claim_text(strong_nodes, "Fun Fact:");
    			strong_nodes.forEach(detach_dev);
    			t8 = claim_text(p3_nodes, " I worked for nearly 5 years as a 911 Emergency Dispatcher. This experience has taught me how to be an oustanding communicator with both co-workers and the public, as well as how to remain calm and deliver results under stressful circumstances.");
    			p3_nodes.forEach(detach_dev);
    			t9 = claim_space(nodes);
    			hr1 = claim_element(nodes, "HR", {});
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(p0, file$4, 1, 0, 1);
    			add_location(p1, file$4, 4, 0, 776);
    			add_location(p2, file$4, 7, 0, 1384);
    			add_location(hr0, file$4, 9, 0, 1822);
    			add_location(strong, file$4, 10, 3, 1830);
    			add_location(p3, file$4, 10, 0, 1827);
    			add_location(hr1, file$4, 11, 0, 2105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, strong);
    			append_dev(strong, t7);
    			append_dev(p3, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, hr1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(hr1);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Experience", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Experience extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Experience.svelte generated by Svelte v3.31.0 */

    const { window: window_1 } = globals;
    const file$5 = "src/components/Experience.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (30:2) {#if y > 50 || window.innerWidth > 1500}
    function create_if_block$1(ctx) {
    	let h10;
    	let t0;
    	let h10_intro;
    	let t1;
    	let div0;
    	let div0_intro;
    	let t2;
    	let h11;
    	let t3;
    	let h11_intro;
    	let t4;
    	let div1;
    	let div1_intro;
    	let each_value_1 = /*$store*/ ctx[1].tech;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$store*/ ctx[1].learning;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			t0 = text("Tech");
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			h11 = element("h1");
    			t3 = text("Skills");
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			h10 = claim_element(nodes, "H1", { class: true });
    			var h10_nodes = children(h10);
    			t0 = claim_text(h10_nodes, "Tech");
    			h10_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			h11 = claim_element(nodes, "H1", { class: true });
    			var h11_nodes = children(h11);
    			t3 = claim_text(h11_nodes, "Skills");
    			h11_nodes.forEach(detach_dev);
    			t4 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div1_nodes);
    			}

    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h10, "class", "header svelte-c45y2x");
    			add_location(h10, file$5, 30, 4, 643);
    			attr_dev(div0, "class", "tech-grid svelte-c45y2x");
    			add_location(div0, file$5, 31, 4, 712);
    			attr_dev(h11, "class", "header svelte-c45y2x");
    			add_location(h11, file$5, 45, 4, 1228);
    			attr_dev(div1, "class", "tech-grid svelte-c45y2x");
    			add_location(div1, file$5, 49, 4, 1312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			append_dev(h10, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, h11, anchor);
    			append_dev(h11, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, $darkmode*/ 6) {
    				each_value_1 = /*$store*/ ctx[1].tech;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$darkmode, $store*/ 6) {
    				each_value = /*$store*/ ctx[1].learning;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!h10_intro) {
    				add_render_callback(() => {
    					h10_intro = create_in_transition(h10, fly, { y: 1000, duration: 750 });
    					h10_intro.start();
    				});
    			}

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fly, { y: 1000, duration: 750 });
    					div0_intro.start();
    				});
    			}

    			if (!h11_intro) {
    				add_render_callback(() => {
    					h11_intro = create_in_transition(h11, fly, { y: 1000, duration: 750 });
    					h11_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { y: 1000, duration: 750 });
    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:2) {#if y > 50 || window.innerWidth > 1500}",
    		ctx
    	});

    	return block;
    }

    // (37:10) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, height: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*tech*/ ctx[7].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*tech*/ ctx[7].name);
    			attr_dev(img, "height", "30");
    			add_location(img, file$5, 37, 12, 1030);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && img.src !== (img_src_value = /*tech*/ ctx[7].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$store*/ 2 && img_alt_value !== (img_alt_value = /*tech*/ ctx[7].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(37:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:10) {#if tech.class}
    function create_if_block_2(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true, style: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*tech*/ ctx[7].class) + " svelte-c45y2x"));
    			set_style(i, "color", /*tech*/ ctx[7].color);
    			add_location(i, file$5, 35, 12, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*tech*/ ctx[7].class) + " svelte-c45y2x"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*$store*/ 2) {
    				set_style(i, "color", /*tech*/ ctx[7].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(35:10) {#if tech.class}",
    		ctx
    	});

    	return block;
    }

    // (33:6) {#each $store.tech as tech}
    function create_each_block_1(ctx) {
    	let a;
    	let t0;
    	let div;
    	let p;
    	let t1_value = /*tech*/ ctx[7].name + "";
    	let t1;
    	let t2;
    	let a_href_value;
    	let a_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*tech*/ ctx[7].class) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			t0 = space();
    			div = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, class: true, target: true });
    			var a_nodes = children(a);
    			if_block.l(a_nodes);
    			t0 = claim_space(a_nodes);
    			div = claim_element(a_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { id: true });
    			var p_nodes = children(p);
    			t1 = claim_text(p_nodes, t1_value);
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			t2 = claim_space(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "id", "name");
    			add_location(p, file$5, 40, 12, 1138);
    			attr_dev(div, "class", "name svelte-c45y2x");
    			add_location(div, file$5, 39, 10, 1107);
    			attr_dev(a, "href", a_href_value = /*tech*/ ctx[7].href);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-c45y2x"));

    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 33, 8, 814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_block.m(a, null);
    			append_dev(a, t0);
    			append_dev(a, div);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(a, t0);
    				}
    			}

    			if (dirty & /*$store*/ 2 && t1_value !== (t1_value = /*tech*/ ctx[7].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$store*/ 2 && a_href_value !== (a_href_value = /*tech*/ ctx[7].href)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$darkmode*/ 4 && a_class_value !== (a_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-c45y2x"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(33:6) {#each $store.tech as tech}",
    		ctx
    	});

    	return block;
    }

    // (55:10) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, height: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*learning*/ ctx[4].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*learning*/ ctx[4].name);
    			attr_dev(img, "height", "30");
    			add_location(img, file$5, 55, 12, 1620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && img.src !== (img_src_value = /*learning*/ ctx[4].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$store*/ 2 && img_alt_value !== (img_alt_value = /*learning*/ ctx[4].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(55:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:10) {#if learning.class}
    function create_if_block_1(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true, style: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*learning*/ ctx[4].class) + " svelte-c45y2x"));
    			set_style(i, "color", /*learning*/ ctx[4].color);
    			add_location(i, file$5, 53, 12, 1529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*learning*/ ctx[4].class) + " svelte-c45y2x"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*$store*/ 2) {
    				set_style(i, "color", /*learning*/ ctx[4].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(53:10) {#if learning.class}",
    		ctx
    	});

    	return block;
    }

    // (51:6) {#each $store.learning as learning}
    function create_each_block$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let p;
    	let t1_value = /*learning*/ ctx[4].name + "";
    	let t1;
    	let t2;
    	let div1_class_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*learning*/ ctx[4].class) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if_block.l(div1_nodes);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			p = claim_element(div0_nodes, "P", { id: true });
    			var p_nodes = children(p);
    			t1 = claim_text(p_nodes, t1_value);
    			p_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "id", "name");
    			add_location(p, file$5, 58, 12, 1736);
    			attr_dev(div0, "class", "name svelte-c45y2x");
    			add_location(div0, file$5, 57, 10, 1705);

    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-c45y2x"));

    			add_location(div1, file$5, 51, 8, 1422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			}

    			if (dirty & /*$store*/ 2 && t1_value !== (t1_value = /*learning*/ ctx[4].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$darkmode*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-c45y2x"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(51:6) {#each $store.learning as learning}",
    		ctx
    	});

    	return block;
    }

    // (13:0) <Layout>
    function create_default_slot(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div;
    	let experience;
    	let t2;
    	let if_block_anchor;
    	let current;
    	experience = new Experience({ $$inline: true });
    	let if_block = (/*y*/ ctx[0] > 50 || window.innerWidth > 1500) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Experience");
    			t1 = space();
    			div = element("div");
    			create_component(experience.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Experience");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(experience.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "header svelte-c45y2x");
    			add_location(h1, file$5, 13, 2, 311);
    			attr_dev(div, "class", "main-p svelte-c45y2x");
    			add_location(div, file$5, 26, 2, 551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(experience, div, null);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*y*/ ctx[0] > 50 || window.innerWidth > 1500) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*y*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(experience.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(experience.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(experience);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let t;
    	let layout;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-18lwn25\"]", document.head);
    			head_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			claim_component(layout.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Experience";
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[3]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			const layout_changes = {};

    			if (dirty & /*$$scope, $store, $darkmode, y*/ 1031) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    			mounted = false;
    			dispose();
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

    function instance$5($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(1, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(2, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Experience", slots, []);
    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, y = window_1.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		Layout,
    		store,
    		darkmode,
    		fly,
    		Experience,
    		y,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [y, $store, $darkmode, onwindowscroll];
    }

    class Experience_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience_1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const alert = writable({
      text: "New Message",
      isActive: false,
    });

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var EmailJSResponseStatus_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmailJSResponseStatus = void 0;
    var EmailJSResponseStatus = /** @class */ (function () {
        function EmailJSResponseStatus(httpResponse) {
            this.status = httpResponse.status;
            this.text = httpResponse.responseText;
        }
        return EmailJSResponseStatus;
    }());
    exports.EmailJSResponseStatus = EmailJSResponseStatus;
    });

    var UI_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UI = void 0;
    var UI = /** @class */ (function () {
        function UI() {
        }
        UI.clearAll = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.remove(this.DONE);
            form.classList.remove(this.ERROR);
        };
        UI.progressState = function (form) {
            this.clearAll(form);
            form.classList.add(this.PROGRESS);
        };
        UI.successState = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.add(this.DONE);
        };
        UI.errorState = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.add(this.ERROR);
        };
        UI.PROGRESS = 'emailjs-sending';
        UI.DONE = 'emailjs-success';
        UI.ERROR = 'emailjs-error';
        return UI;
    }());
    exports.UI = UI;
    });

    var source = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmailJSResponseStatus = exports.sendForm = exports.send = exports.init = void 0;

    Object.defineProperty(exports, "EmailJSResponseStatus", { enumerable: true, get: function () { return EmailJSResponseStatus_1.EmailJSResponseStatus; } });

    var _userID = null;
    var _origin = 'https://api.emailjs.com';
    function sendPost(url, data, headers) {
        if (headers === void 0) { headers = {}; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function (event) {
                var responseStatus = new EmailJSResponseStatus_1.EmailJSResponseStatus(event.target);
                if (responseStatus.status === 200 || responseStatus.text === 'OK') {
                    resolve(responseStatus);
                }
                else {
                    reject(responseStatus);
                }
            });
            xhr.addEventListener('error', function (event) {
                reject(new EmailJSResponseStatus_1.EmailJSResponseStatus(event.target));
            });
            xhr.open('POST', url, true);
            for (var key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
            xhr.send(data);
        });
    }
    function appendGoogleCaptcha(templatePrams) {
        var element = document && document.getElementById('g-recaptcha-response');
        if (element && element.value) {
            templatePrams['g-recaptcha-response'] = element.value;
        }
        element = null;
        return templatePrams;
    }
    function fixIdSelector(selector) {
        if (selector[0] !== '#' && selector[0] !== '.') {
            return '#' + selector;
        }
        return selector;
    }
    /**
     * Initiation
     * @param {string} userID - set the EmailJS user ID
     * @param {string} origin - set the EmailJS origin
     */
    function init(userID, origin) {
        _userID = userID;
        _origin = origin || 'https://api.emailjs.com';
    }
    exports.init = init;
    /**
     * Send a template to the specific EmailJS service
     * @param {string} serviceID - the EmailJS service ID
     * @param {string} templateID - the EmailJS template ID
     * @param {Object} templatePrams - the template params, what will be set to the EmailJS template
     * @param {string} userID - the EmailJS user ID
     * @returns {Promise<EmailJSResponseStatus>}
     */
    function send(serviceID, templateID, templatePrams, userID) {
        var params = {
            lib_version: '2.6.4',
            user_id: userID || _userID,
            service_id: serviceID,
            template_id: templateID,
            template_params: appendGoogleCaptcha(templatePrams)
        };
        return sendPost(_origin + '/api/v1.0/email/send', JSON.stringify(params), {
            'Content-type': 'application/json'
        });
    }
    exports.send = send;
    /**
     * Send a form the specific EmailJS service
     * @param {string} serviceID - the EmailJS service ID
     * @param {string} templateID - the EmailJS template ID
     * @param {string | HTMLFormElement} form - the form element or selector
     * @param {string} userID - the EmailJS user ID
     * @returns {Promise<EmailJSResponseStatus>}
     */
    function sendForm(serviceID, templateID, form, userID) {
        if (typeof form === 'string') {
            form = document.querySelector(fixIdSelector(form));
        }
        if (!form || form.nodeName !== 'FORM') {
            throw 'Expected the HTML form element or the style selector of form';
        }
        UI_1.UI.progressState(form);
        var formData = new FormData(form);
        formData.append('lib_version', '2.6.4');
        formData.append('service_id', serviceID);
        formData.append('template_id', templateID);
        formData.append('user_id', userID || _userID);
        return sendPost(_origin + '/api/v1.0/email/send-form', formData)
            .then(function (response) {
            UI_1.UI.successState(form);
            return response;
        }, function (error) {
            UI_1.UI.errorState(form);
            return Promise.reject(error);
        });
    }
    exports.sendForm = sendForm;
    exports.default = {
        init: init,
        send: send,
        sendForm: sendForm
    };
    });

    var emailjs = /*@__PURE__*/getDefaultExportFromCjs(source);

    /* src/components/utils/Toast.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/components/utils/Toast.svelte";

    // (39:0) {#if $alert.isActive}
    function create_if_block$2(ctx) {
    	let div;
    	let p;
    	let t_value = /*$alert*/ ctx[0].text + "";
    	let t;
    	let div_id_value;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, id: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, t_value);
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-p2sbbd");
    			add_location(p, file$6, 44, 8, 950);
    			attr_dev(div, "class", "toast svelte-p2sbbd");
    			attr_dev(div, "id", div_id_value = /*$alert*/ ctx[0].text.includes("required") && "red");
    			add_location(div, file$6, 39, 4, 791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*closeAlert*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$alert*/ 1) && t_value !== (t_value = /*$alert*/ ctx[0].text + "")) set_data_dev(t, t_value);

    			if (!current || dirty & /*$alert*/ 1 && div_id_value !== (div_id_value = /*$alert*/ ctx[0].text.includes("required") && "red")) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { y: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { y: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(39:0) {#if $alert.isActive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$alert*/ ctx[0].isActive && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$alert*/ ctx[0].isActive) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$alert*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $alert;
    	validate_store(alert, "alert");
    	component_subscribe($$self, alert, $$value => $$invalidate(0, $alert = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Toast", slots, []);

    	function closeAlert() {
    		alert.set({ text: $alert.text, isActive: false });
    	}

    	alert.subscribe(value => {
    		if (value.isActive) {
    			setTimeout(closeAlert, 3000);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toast> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide, alert, closeAlert, $alert });
    	return [$alert, closeAlert];
    }

    class Toast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toast",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.31.0 */

    const { console: console_1, document: document_1 } = globals;
    const file$7 = "src/components/Contact.svelte";

    // (58:0) <Layout>
    function create_default_slot$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div1;
    	let form;
    	let label0;
    	let t2;
    	let t3;
    	let input0;
    	let input0_required_value;
    	let t4;
    	let label1;
    	let t5;
    	let t6;
    	let input1;
    	let input1_required_value;
    	let t7;
    	let label2;
    	let t8;
    	let t9;
    	let textarea;
    	let textarea_required_value;
    	let t10;
    	let div0;
    	let a0;
    	let i0;
    	let t11;
    	let a1;
    	let i1;
    	let t12;
    	let a2;
    	let i2;
    	let t13;
    	let a3;
    	let i3;
    	let t14;
    	let button;
    	let t15;
    	let t16;
    	let toast;
    	let current;
    	let mounted;
    	let dispose;
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Get in touch");
    			t1 = space();
    			div1 = element("div");
    			form = element("form");
    			label0 = element("label");
    			t2 = text("email");
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("name");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			label2 = element("label");
    			t8 = text("message");
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t11 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t12 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t13 = space();
    			a3 = element("a");
    			i3 = element("i");
    			t14 = space();
    			button = element("button");
    			t15 = text("send");
    			t16 = space();
    			create_component(toast.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Get in touch");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			form = claim_element(div1_nodes, "FORM", { class: true });
    			var form_nodes = children(form);
    			label0 = claim_element(form_nodes, "LABEL", { for: true, class: true });
    			var label0_nodes = children(label0);
    			t2 = claim_text(label0_nodes, "email");
    			label0_nodes.forEach(detach_dev);
    			t3 = claim_space(form_nodes);

    			input0 = claim_element(form_nodes, "INPUT", {
    				type: true,
    				id: true,
    				required: true,
    				class: true
    			});

    			t4 = claim_space(form_nodes);
    			label1 = claim_element(form_nodes, "LABEL", { for: true, class: true });
    			var label1_nodes = children(label1);
    			t5 = claim_text(label1_nodes, "name");
    			label1_nodes.forEach(detach_dev);
    			t6 = claim_space(form_nodes);

    			input1 = claim_element(form_nodes, "INPUT", {
    				type: true,
    				id: true,
    				required: true,
    				class: true
    			});

    			t7 = claim_space(form_nodes);
    			label2 = claim_element(form_nodes, "LABEL", { for: true, class: true });
    			var label2_nodes = children(label2);
    			t8 = claim_text(label2_nodes, "message");
    			label2_nodes.forEach(detach_dev);
    			t9 = claim_space(form_nodes);

    			textarea = claim_element(form_nodes, "TEXTAREA", {
    				type: true,
    				id: true,
    				required: true,
    				class: true
    			});

    			children(textarea).forEach(detach_dev);
    			t10 = claim_space(form_nodes);
    			div0 = claim_element(form_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			a0 = claim_element(div0_nodes, "A", { href: true, target: true, rel: true });
    			var a0_nodes = children(a0);
    			i0 = claim_element(a0_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			a0_nodes.forEach(detach_dev);
    			t11 = claim_space(div0_nodes);
    			a1 = claim_element(div0_nodes, "A", { href: true, target: true, rel: true });
    			var a1_nodes = children(a1);
    			i1 = claim_element(a1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			a1_nodes.forEach(detach_dev);
    			t12 = claim_space(div0_nodes);
    			a2 = claim_element(div0_nodes, "A", { href: true, target: true, rel: true });
    			var a2_nodes = children(a2);
    			i2 = claim_element(a2_nodes, "I", { class: true });
    			children(i2).forEach(detach_dev);
    			a2_nodes.forEach(detach_dev);
    			t13 = claim_space(div0_nodes);
    			a3 = claim_element(div0_nodes, "A", { href: true, target: true, rel: true });
    			var a3_nodes = children(a3);
    			i3 = claim_element(a3_nodes, "I", { class: true });
    			children(i3).forEach(detach_dev);
    			a3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t14 = claim_space(form_nodes);
    			button = claim_element(form_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t15 = claim_text(button_nodes, "send");
    			button_nodes.forEach(detach_dev);
    			form_nodes.forEach(detach_dev);
    			t16 = claim_space(div1_nodes);
    			claim_component(toast.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "header svelte-wyzh46");
    			add_location(h1, file$7, 58, 2, 1425);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "svelte-wyzh46");
    			add_location(label0, file$7, 62, 6, 1504);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "id", "email");
    			input0.required = input0_required_value = true;
    			attr_dev(input0, "class", "svelte-wyzh46");
    			add_location(input0, file$7, 63, 6, 1543);
    			attr_dev(label1, "for", "name");
    			attr_dev(label1, "class", "svelte-wyzh46");
    			add_location(label1, file$7, 64, 6, 1618);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "name");
    			input1.required = input1_required_value = true;
    			attr_dev(input1, "class", "svelte-wyzh46");
    			add_location(input1, file$7, 65, 6, 1655);
    			attr_dev(label2, "for", "message");
    			attr_dev(label2, "class", "svelte-wyzh46");
    			add_location(label2, file$7, 66, 6, 1727);
    			attr_dev(textarea, "type", "textarea");
    			attr_dev(textarea, "id", "message");
    			textarea.required = textarea_required_value = true;
    			attr_dev(textarea, "class", "svelte-wyzh46");
    			add_location(textarea, file$7, 67, 6, 1770);
    			attr_dev(i0, "class", "fab fa-linkedin-in svelte-wyzh46");
    			add_location(i0, file$7, 77, 36, 2044);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/rsmacdonald/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			add_location(a0, file$7, 74, 8, 1921);
    			attr_dev(i1, "class", "fab fa-medium-m svelte-wyzh46");
    			add_location(i1, file$7, 82, 36, 2221);
    			attr_dev(a1, "href", "https://ross-scott-macdonald.medium.com/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			add_location(a1, file$7, 79, 8, 2098);
    			attr_dev(i2, "class", "fab fa-github svelte-wyzh46");
    			add_location(i2, file$7, 87, 36, 2382);
    			attr_dev(a2, "href", "https://github.com/rmac2289");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			add_location(a2, file$7, 84, 8, 2272);
    			attr_dev(i3, "class", "fab fa-stack-overflow svelte-wyzh46");
    			add_location(i3, file$7, 92, 36, 2571);
    			attr_dev(a3, "href", "https://stackoverflow.com/users/12433240/ross?tab=profile");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "rel", "noopener noreferrer");
    			add_location(a3, file$7, 89, 8, 2431);
    			attr_dev(div0, "class", "icons svelte-wyzh46");
    			add_location(div0, file$7, 73, 6, 1893);
    			attr_dev(button, "class", "svelte-wyzh46");
    			add_location(button, file$7, 95, 6, 2639);
    			attr_dev(form, "class", "svelte-wyzh46");
    			add_location(form, file$7, 61, 4, 1491);
    			attr_dev(div1, "class", "content svelte-wyzh46");
    			add_location(div1, file$7, 60, 2, 1465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, form);
    			append_dev(form, label0);
    			append_dev(label0, t2);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, t5);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			set_input_value(input1, /*name*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, label2);
    			append_dev(label2, t8);
    			append_dev(form, t9);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*message*/ ctx[2]);
    			append_dev(form, t10);
    			append_dev(form, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(div0, t11);
    			append_dev(div0, a1);
    			append_dev(a1, i1);
    			append_dev(div0, t12);
    			append_dev(div0, a2);
    			append_dev(a2, i2);
    			append_dev(div0, t13);
    			append_dev(div0, a3);
    			append_dev(a3, i3);
    			append_dev(form, t14);
    			append_dev(form, button);
    			append_dev(button, t15);
    			append_dev(div1, t16);
    			mount_component(toast, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    					listen_dev(button, "click", prevent_default(/*handleSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 2 && input1.value !== /*name*/ ctx[1]) {
    				set_input_value(input1, /*name*/ ctx[1]);
    			}

    			if (dirty & /*message*/ 4) {
    				set_input_value(textarea, /*message*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(toast);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(58:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t;
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-s20oyr\"]", document_1.head);
    			head_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			claim_component(layout.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1.title = "Contact Me";
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope, message, name, email*/ 135) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);

    	(function () {
    		emailjs.init("user_uXigZw2RYzgOCTjVxakmu");
    	})();

    	let email = "";
    	let name = "";
    	let message = "";
    	console.log(document.body);

    	//   onMount(() => {
    	//     if ($darkmode) {
    	//       document.body
    	//     }
    	//   });
    	function handleSubmit() {
    		if (!email) {
    			alert.set({
    				isActive: true,
    				text: "Email is required."
    			});

    			return;
    		}

    		if (!name) {
    			alert.set({
    				isActive: true,
    				text: "Name is required."
    			});

    			return;
    		}

    		if (!message) {
    			alert.set({
    				isActive: true,
    				text: "Message is required."
    			});

    			return;
    		}

    		let params = {
    			reply_to: email,
    			from_name: name,
    			message_html: message
    		};

    		emailjs.send("gmail", "template_DMlIudKC", params, "user_uXigZw2RYzgOCTjVxakmu").then(() => {
    			alert.set({
    				isActive: true,
    				text: "Thanks for reaching out! I'll get back to you shortly."
    			});
    		}).catch(() => {
    			alert.set({
    				isActive: true,
    				text: "Sorry, looks like something went wrong."
    			});
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(2, message);
    	}

    	$$self.$capture_state = () => ({
    		alert,
    		Layout,
    		emailjs,
    		email,
    		name,
    		message,
    		Toast,
    		onMount,
    		darkmode,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		name,
    		message,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/components/utils/Carousel.svelte generated by Svelte v3.31.0 */
    const file$8 = "src/components/utils/Carousel.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (21:0) {#each [images[currentIdx]] as photo (currentIdx)}
    function create_each_block$2(key_1, ctx) {
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_class_value;
    	let img_intro;
    	let div1_class_value;
    	let rect;
    	let stop_animation = noop;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t = claim_space(div1_nodes);
    			img = claim_element(div1_nodes, "IMG", { src: true, alt: true, class: true });
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "controls svelte-zl41jg");
    			add_location(div0, file$8, 22, 4, 660);
    			if (img.src !== (img_src_value = /*photo*/ ctx[6].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*photo*/ ctx[6].name);
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*projectClass*/ ctx[1]) + " svelte-zl41jg"));
    			add_location(img, file$8, 23, 4, 689);
    			attr_dev(div1, "class", div1_class_value = "container " + /*projectClass*/ ctx[1] + " svelte-zl41jg");
    			add_location(div1, file$8, 21, 2, 604);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images, currentIdx*/ 9 && img.src !== (img_src_value = /*photo*/ ctx[6].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*images, currentIdx*/ 9 && img_alt_value !== (img_alt_value = /*photo*/ ctx[6].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*projectClass*/ 2 && img_class_value !== (img_class_value = "" + (null_to_empty(/*projectClass*/ ctx[1]) + " svelte-zl41jg"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*projectClass*/ 2 && div1_class_value !== (div1_class_value = "container " + /*projectClass*/ ctx[1] + " svelte-zl41jg")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		r: function measure() {
    			rect = div1.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div1);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div1, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, blur, { duration: 400 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(21:0) {#each [images[currentIdx]] as photo (currentIdx)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div0;
    	let i0;
    	let t0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let div1;
    	let i1;
    	let t2;
    	let div2;
    	let p;
    	let t3;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = [/*images*/ ctx[0][/*currentIdx*/ ctx[3]]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*currentIdx*/ ctx[3];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			i1 = element("i");
    			t2 = space();
    			div2 = element("div");
    			p = element("p");
    			t3 = text("X");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i0 = claim_element(div0_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			t1 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			i1 = claim_element(div1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p = claim_element(div2_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t3 = claim_text(p_nodes, "X");
    			p_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i0, "class", "fas fa-chevron-left svelte-zl41jg");
    			add_location(i0, file$8, 19, 34, 511);
    			attr_dev(div0, "class", "prev svelte-zl41jg");
    			add_location(div0, file$8, 19, 0, 477);
    			attr_dev(i1, "class", "fas fa-chevron-right svelte-zl41jg");
    			add_location(i1, file$8, 31, 34, 858);
    			attr_dev(div1, "class", "next svelte-zl41jg");
    			add_location(div1, file$8, 31, 0, 824);
    			attr_dev(p, "class", "close-button-text svelte-zl41jg");
    			add_location(p, file$8, 38, 2, 1002);
    			attr_dev(div2, "class", "close-button svelte-zl41jg");
    			add_location(div2, file$8, 32, 0, 899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, i0);
    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*next*/ ctx[4], false, false, false),
    					listen_dev(div1, "click", /*prev*/ ctx[5], false, false, false),
    					listen_dev(
    						div2,
    						"click",
    						function () {
    							if (is_function(/*openCarousel*/ ctx[2])) /*openCarousel*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*projectClass, images, currentIdx*/ 11) {
    				const each_value = [/*images*/ ctx[0][/*currentIdx*/ ctx[3]]];
    				validate_each_argument(each_value);
    				for (let i = 0; i < 1; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t1.parentNode, fix_and_destroy_block, create_each_block$2, t1, get_each_context$2);
    				for (let i = 0; i < 1; i += 1) each_blocks[i].a();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, fly, { y: -50 });
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fly, { y: -50 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, []);
    	let { images = [] } = $$props;
    	let { projectClass } = $$props;
    	let { openCarousel } = $$props;
    	let currentIdx = 0;

    	const next = () => {
    		$$invalidate(3, currentIdx = (currentIdx + 1) % images.length);
    	};

    	const prev = () => {
    		currentIdx === 0
    		? $$invalidate(3, currentIdx = images.length - 1)
    		: $$invalidate(3, currentIdx = (currentIdx - 1) % images.length);
    	};

    	const writable_props = ["images", "projectClass", "openCarousel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("projectClass" in $$props) $$invalidate(1, projectClass = $$props.projectClass);
    		if ("openCarousel" in $$props) $$invalidate(2, openCarousel = $$props.openCarousel);
    	};

    	$$self.$capture_state = () => ({
    		images,
    		projectClass,
    		flip,
    		fly,
    		openCarousel,
    		currentIdx,
    		next,
    		prev,
    		blur
    	});

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("projectClass" in $$props) $$invalidate(1, projectClass = $$props.projectClass);
    		if ("openCarousel" in $$props) $$invalidate(2, openCarousel = $$props.openCarousel);
    		if ("currentIdx" in $$props) $$invalidate(3, currentIdx = $$props.currentIdx);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images, projectClass, openCarousel, currentIdx, next, prev];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			images: 0,
    			projectClass: 1,
    			openCarousel: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projectClass*/ ctx[1] === undefined && !("projectClass" in props)) {
    			console.warn("<Carousel> was created without expected prop 'projectClass'");
    		}

    		if (/*openCarousel*/ ctx[2] === undefined && !("openCarousel" in props)) {
    			console.warn("<Carousel> was created without expected prop 'openCarousel'");
    		}
    	}

    	get images() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectClass() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectClass(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openCarousel() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openCarousel(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/utils/ProjectTechGrid.svelte generated by Svelte v3.31.0 */

    const file$9 = "src/components/utils/ProjectTechGrid.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (96:16) {:else}
    function create_else_block_2(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { style: true, class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(i, "color", /*tech*/ ctx[1].color);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"));
    			add_location(i, file$9, 95, 23, 2178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1) {
    				set_style(i, "color", /*tech*/ ctx[1].color);
    			}

    			if (dirty & /*techUsed*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(96:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:16) {#if tech.src}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*tech*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*tech*/ ctx[1].name);
    			attr_dev(img, "class", "svelte-dr1y8r");
    			add_location(img, file$9, 94, 20, 2116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && img.src !== (img_src_value = /*tech*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*techUsed*/ 1 && img_alt_value !== (img_alt_value = /*tech*/ ctx[1].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(94:16) {#if tech.src}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#each techUsed.frontend as tech}
    function create_each_block_2(ctx) {
    	let div;
    	let p;
    	let t0_value = /*tech*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*tech*/ ctx[1].src) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, t0_value);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			if_block.l(div_nodes);
    			t2 = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-dr1y8r");
    			add_location(p, file$9, 92, 16, 2046);
    			attr_dev(div, "class", "grid-item svelte-dr1y8r");
    			add_location(div, file$9, 91, 12, 2006);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && t0_value !== (t0_value = /*tech*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(91:8) {#each techUsed.frontend as tech}",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if techUsed.backend}
    function create_if_block_1$1(ctx) {
    	let div;
    	let h4;
    	let t0;
    	let t1;
    	let each_value_1 = /*techUsed*/ ctx[0].backend;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text("Backend");
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			h4 = claim_element(div_nodes, "H4", { class: true });
    			var h4_nodes = children(h4);
    			t0 = claim_text(h4_nodes, "Backend");
    			h4_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h4, "class", "grid-subtitle svelte-dr1y8r");
    			add_location(h4, file$9, 101, 12, 2354);
    			attr_dev(div, "class", "grid-title svelte-dr1y8r");
    			add_location(div, file$9, 100, 8, 2317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1) {
    				each_value_1 = /*techUsed*/ ctx[0].backend;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(100:4) {#if techUsed.backend}",
    		ctx
    	});

    	return block;
    }

    // (111:20) {:else}
    function create_else_block_1$1(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { style: true, class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(i, "color", /*tech*/ ctx[1].color);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"));
    			add_location(i, file$9, 111, 24, 2796);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1) {
    				set_style(i, "color", /*tech*/ ctx[1].color);
    			}

    			if (dirty & /*techUsed*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(111:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:20) {#if tech.src}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { class: true, src: true, alt: true });
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*tech*/ ctx[1].name === "mongoDB" && "mongodb") + " svelte-dr1y8r"));
    			if (img.src !== (img_src_value = /*tech*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*tech*/ ctx[1].name);
    			add_location(img, file$9, 106, 24, 2576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && img_class_value !== (img_class_value = "" + (null_to_empty(/*tech*/ ctx[1].name === "mongoDB" && "mongodb") + " svelte-dr1y8r"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*techUsed*/ 1 && img.src !== (img_src_value = /*tech*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*techUsed*/ 1 && img_alt_value !== (img_alt_value = /*tech*/ ctx[1].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(106:20) {#if tech.src}",
    		ctx
    	});

    	return block;
    }

    // (103:12) {#each techUsed.backend as tech}
    function create_each_block_1$1(ctx) {
    	let div;
    	let p;
    	let t0_value = /*tech*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type_1(ctx, dirty) {
    		if (/*tech*/ ctx[1].src) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, t0_value);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			if_block.l(div_nodes);
    			t2 = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-dr1y8r");
    			add_location(p, file$9, 104, 20, 2498);
    			attr_dev(div, "class", "grid-item svelte-dr1y8r");
    			add_location(div, file$9, 103, 16, 2454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && t0_value !== (t0_value = /*tech*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(103:12) {#each techUsed.backend as tech}",
    		ctx
    	});

    	return block;
    }

    // (126:16) {:else}
    function create_else_block$1(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { style: true, class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(i, "color", /*tech*/ ctx[1].color);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"));
    			add_location(i, file$9, 125, 23, 3249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1) {
    				set_style(i, "color", /*tech*/ ctx[1].color);
    			}

    			if (dirty & /*techUsed*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*tech*/ ctx[1].class) + " svelte-dr1y8r"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(126:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:16) {#if tech.src}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*tech*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*tech*/ ctx[1].name);
    			attr_dev(img, "class", "svelte-dr1y8r");
    			add_location(img, file$9, 124, 20, 3187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && img.src !== (img_src_value = /*tech*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*techUsed*/ 1 && img_alt_value !== (img_alt_value = /*tech*/ ctx[1].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(124:16) {#if tech.src}",
    		ctx
    	});

    	return block;
    }

    // (121:8) {#each techUsed.misc as tech}
    function create_each_block$3(ctx) {
    	let div;
    	let p;
    	let t0_value = /*tech*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type_2(ctx, dirty) {
    		if (/*tech*/ ctx[1].src) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, t0_value);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			if_block.l(div_nodes);
    			t2 = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-dr1y8r");
    			add_location(p, file$9, 122, 16, 3117);
    			attr_dev(div, "class", "grid-item svelte-dr1y8r");
    			add_location(div, file$9, 121, 12, 3077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*techUsed*/ 1 && t0_value !== (t0_value = /*tech*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(121:8) {#each techUsed.misc as tech}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let h40;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let h41;
    	let t4;
    	let t5;
    	let each_value_2 = /*techUsed*/ ctx[0].frontend;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block = /*techUsed*/ ctx[0].backend && create_if_block_1$1(ctx);
    	let each_value = /*techUsed*/ ctx[0].misc;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			t0 = text("Frontend");
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			t4 = text("Misc");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h40 = claim_element(div0_nodes, "H4", { class: true });
    			var h40_nodes = children(h40);
    			t0 = claim_text(h40_nodes, "Frontend");
    			h40_nodes.forEach(detach_dev);
    			t1 = claim_space(div0_nodes);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			if (if_block) if_block.l(div2_nodes);
    			t3 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { id: true, class: true });
    			var div1_nodes = children(div1);
    			h41 = claim_element(div1_nodes, "H4", { class: true });
    			var h41_nodes = children(h41);
    			t4 = claim_text(h41_nodes, "Misc");
    			h41_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div1_nodes);
    			}

    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h40, "class", "grid-subtitle svelte-dr1y8r");
    			add_location(h40, file$9, 89, 8, 1912);
    			attr_dev(div0, "class", "grid-title svelte-dr1y8r");
    			add_location(div0, file$9, 88, 4, 1879);
    			attr_dev(h41, "class", "grid-subtitle svelte-dr1y8r");
    			add_location(h41, file$9, 119, 8, 2991);
    			attr_dev(div1, "id", "misc");
    			attr_dev(div1, "class", "grid-title svelte-dr1y8r");
    			add_location(div1, file$9, 118, 4, 2948);
    			attr_dev(div2, "class", "tech-grid svelte-dr1y8r");
    			add_location(div2, file$9, 87, 0, 1851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(h40, t0);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, h41);
    			append_dev(h41, t4);
    			append_dev(div1, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*techUsed*/ 1) {
    				each_value_2 = /*techUsed*/ ctx[0].frontend;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (/*techUsed*/ ctx[0].backend) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div2, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*techUsed*/ 1) {
    				each_value = /*techUsed*/ ctx[0].misc;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
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

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectTechGrid", slots, []);
    	let { techUsed } = $$props;
    	const writable_props = ["techUsed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectTechGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("techUsed" in $$props) $$invalidate(0, techUsed = $$props.techUsed);
    	};

    	$$self.$capture_state = () => ({ techUsed });

    	$$self.$inject_state = $$props => {
    		if ("techUsed" in $$props) $$invalidate(0, techUsed = $$props.techUsed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [techUsed];
    }

    class ProjectTechGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { techUsed: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectTechGrid",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*techUsed*/ ctx[0] === undefined && !("techUsed" in props)) {
    			console.warn("<ProjectTechGrid> was created without expected prop 'techUsed'");
    		}
    	}

    	get techUsed() {
    		throw new Error("<ProjectTechGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set techUsed(value) {
    		throw new Error("<ProjectTechGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/projects/SafetyBlanket.svelte generated by Svelte v3.31.0 */
    const file$a = "src/components/projects/SafetyBlanket.svelte";

    // (48:2) {#if carouselOpen}
    function create_if_block$4(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "safety-blanket",
    				images: /*safetyImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$a, 48, 4, 1513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(48:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Safety Blanket");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("Safety Blanket is a full stack mobile app that provides users with\n      emergency and non-emergency public safety help at their fingertips. A\n      user's geolocation is used to find agencies closest to them. The landing\n      screen give the user the option to call an agency, open up the location in\n      google maps, or to save the contact information in their phone.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Safety Blanket");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);

    			img = claim_element(header_nodes, "IMG", {
    				class: true,
    				width: true,
    				src: true,
    				alt: true
    			});

    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Safety Blanket is a full stack mobile app that provides users with\n      emergency and non-emergency public safety help at their fingertips. A\n      user's geolocation is used to find agencies closest to them. The landing\n      screen give the user the option to call an agency, open up the location in\n      google maps, or to save the contact information in their phone.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-7qmubs");
    			add_location(h2, file$a, 22, 6, 689);
    			attr_dev(i, "class", "fas fa-photo-video svelte-7qmubs");
    			add_location(i, file$a, 24, 8, 776);
    			attr_dev(div0, "class", "image-icon svelte-7qmubs");
    			add_location(div0, file$a, 23, 6, 719);
    			attr_dev(div1, "class", "title svelte-7qmubs");
    			add_location(div1, file$a, 21, 4, 663);
    			attr_dev(div2, "class", "header-left svelte-7qmubs");
    			add_location(div2, file$a, 27, 4, 837);
    			attr_dev(img, "class", "thumbnail svelte-7qmubs");
    			attr_dev(img, "width", "150");
    			if (img.src !== (img_src_value = "images/safetyblanket/safetyHome.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "fyp");
    			add_location(img, file$a, 30, 4, 915);
    			attr_dev(header, "class", "svelte-7qmubs");
    			add_location(header, file$a, 20, 2, 650);
    			attr_dev(p, "class", "svelte-7qmubs");
    			add_location(p, file$a, 39, 4, 1087);
    			add_location(div3, file$a, 38, 2, 1077);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"));
    			add_location(div4, file$a, 19, 0, 591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SafetyBlanket", slots, []);
    	let safetyImages = $store.safetyBlanket.images;
    	let techUsed = $store.safetyBlanket.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SafetyBlanket> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		fly,
    		safetyImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("safetyImages" in $$props) $$invalidate(2, safetyImages = $$props.safetyImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		carouselOpen,
    		$darkmode,
    		safetyImages,
    		techUsed,
    		openCarousel,
    		clickOutsideClose
    	];
    }

    class SafetyBlanket extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SafetyBlanket",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/projects/Hearsay.svelte generated by Svelte v3.31.0 */
    const file$b = "src/components/projects/Hearsay.svelte";

    // (47:2) {#if carouselOpen}
    function create_if_block$5(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "hearsay",
    				images: /*hearsayImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$b, 47, 4, 1445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(47:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Hearsay");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("Hearsay is a full-stack application built with social justice in mind.\n      Users can log encounters with law enforcement and speak on discussion\n      boards about criminal justice issues. This app was built with current\n      events in mind - with so much turmoil and change, I feel we need more\n      venues for people to make their voices heard.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Hearsay");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);
    			img = claim_element(header_nodes, "IMG", { class: true, src: true, alt: true });
    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Hearsay is a full-stack application built with social justice in mind.\n      Users can log encounters with law enforcement and speak on discussion\n      boards about criminal justice issues. This app was built with current\n      events in mind - with so much turmoil and change, I feel we need more\n      venues for people to make their voices heard.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-1s09193");
    			add_location(h2, file$b, 22, 6, 673);
    			attr_dev(i, "class", "fas fa-photo-video svelte-1s09193");
    			add_location(i, file$b, 24, 8, 753);
    			attr_dev(div0, "class", "image-icon svelte-1s09193");
    			add_location(div0, file$b, 23, 6, 696);
    			attr_dev(div1, "class", "title svelte-1s09193");
    			add_location(div1, file$b, 21, 4, 647);
    			attr_dev(div2, "class", "header-left svelte-1s09193");
    			add_location(div2, file$b, 27, 4, 814);
    			attr_dev(img, "class", "thumbnail svelte-1s09193");
    			if (img.src !== (img_src_value = "images/hearsay/hearsay.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "hearsay");
    			add_location(img, file$b, 30, 4, 892);
    			attr_dev(header, "class", "svelte-1s09193");
    			add_location(header, file$b, 20, 2, 634);
    			attr_dev(p, "class", "svelte-1s09193");
    			add_location(p, file$b, 38, 4, 1041);
    			add_location(div3, file$b, 37, 2, 1031);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1s09193"));
    			add_location(div4, file$b, 19, 0, 575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1s09193"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
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
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hearsay", slots, []);
    	let hearsayImages = $store.hearsay.images;
    	let techUsed = $store.hearsay.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hearsay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		hearsayImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("hearsayImages" in $$props) $$invalidate(2, hearsayImages = $$props.hearsayImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		carouselOpen,
    		$darkmode,
    		hearsayImages,
    		techUsed,
    		openCarousel,
    		clickOutsideClose
    	];
    }

    class Hearsay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hearsay",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/projects/FypMobile.svelte generated by Svelte v3.31.0 */
    const file$c = "src/components/projects/FypMobile.svelte";

    // (48:2) {#if carouselOpen}
    function create_if_block$6(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "fyp-mobile",
    				images: /*fypMobileImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$c, 48, 4, 1430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(48:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Find Your Park Mobile");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("The Find Your Park iOS mobile app. Built with React Native, the app uses\n      similar logic to the original app but refactored to native standards.\n      Mobile version contains all functionality of the web app, with slightly\n      different formatting. Available now on the Apple App Store.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Find Your Park Mobile");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);

    			img = claim_element(header_nodes, "IMG", {
    				class: true,
    				width: true,
    				src: true,
    				alt: true
    			});

    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "The Find Your Park iOS mobile app. Built with React Native, the app uses\n      similar logic to the original app but refactored to native standards.\n      Mobile version contains all functionality of the web app, with slightly\n      different formatting. Available now on the Apple App Store.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-1swea5r");
    			add_location(h2, file$c, 23, 6, 680);
    			attr_dev(i, "class", "fas fa-photo-video svelte-1swea5r");
    			add_location(i, file$c, 25, 8, 774);
    			attr_dev(div0, "class", "image-icon svelte-1swea5r");
    			add_location(div0, file$c, 24, 6, 717);
    			attr_dev(div1, "class", "title svelte-1swea5r");
    			add_location(div1, file$c, 22, 4, 654);
    			attr_dev(div2, "class", "header-left svelte-1swea5r");
    			add_location(div2, file$c, 28, 4, 835);
    			attr_dev(img, "class", "thumbnail svelte-1swea5r");
    			attr_dev(img, "width", "140");
    			if (img.src !== (img_src_value = "images/fypmobile/fypMobileHome.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "fyp");
    			add_location(img, file$c, 31, 4, 913);
    			attr_dev(header, "class", "svelte-1swea5r");
    			add_location(header, file$c, 21, 2, 641);
    			attr_dev(p, "class", "svelte-1swea5r");
    			add_location(p, file$c, 40, 4, 1084);
    			add_location(div3, file$c, 39, 2, 1074);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1swea5r"));
    			add_location(div4, file$c, 20, 0, 582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1swea5r"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FypMobile", slots, []);
    	let fypMobileImages = $store.fypMobile.images;
    	let techUsed = $store.fypMobile.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FypMobile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fypMobileImages,
    		techUsed,
    		fade,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("fypMobileImages" in $$props) $$invalidate(2, fypMobileImages = $$props.fypMobileImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		carouselOpen,
    		$darkmode,
    		fypMobileImages,
    		techUsed,
    		openCarousel,
    		clickOutsideClose
    	];
    }

    class FypMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FypMobile",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/projects/Fyp.svelte generated by Svelte v3.31.0 */
    const file$d = "src/components/projects/Fyp.svelte";

    // (48:2) {#if carouselOpen}
    function create_if_block$7(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "fyp",
    				images: /*fypImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$d, 48, 4, 1486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(48:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Find Your Park");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("A full-stack application for Californians looking to head outdoors. The\n      app allows a user to find parks in their area via several different search\n      methods. I built this because of what I saw as a shortage of aggregated\n      data on parks run by different agencies (state, national, county, etc.).\n      Through further data aggregation, the app will soon be available for other\n      states.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Find Your Park");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);
    			img = claim_element(header_nodes, "IMG", { class: true, src: true, alt: true });
    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "A full-stack application for Californians looking to head outdoors. The\n      app allows a user to find parks in their area via several different search\n      methods. I built this because of what I saw as a shortage of aggregated\n      data on parks run by different agencies (state, national, county, etc.).\n      Through further data aggregation, the app will soon be available for other\n      states.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-1h5icqg");
    			add_location(h2, file$d, 22, 6, 661);
    			attr_dev(i, "class", "fas fa-photo-video svelte-1h5icqg");
    			add_location(i, file$d, 24, 8, 748);
    			attr_dev(div0, "class", "image-icon svelte-1h5icqg");
    			add_location(div0, file$d, 23, 6, 691);
    			attr_dev(div1, "class", "title svelte-1h5icqg");
    			add_location(div1, file$d, 21, 4, 635);
    			attr_dev(div2, "class", "header-left svelte-1h5icqg");
    			add_location(div2, file$d, 27, 4, 809);
    			attr_dev(img, "class", "thumbnail svelte-1h5icqg");
    			if (img.src !== (img_src_value = "images/fyp/fypHome.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "fyp");
    			add_location(img, file$d, 30, 4, 887);
    			attr_dev(header, "class", "svelte-1h5icqg");
    			add_location(header, file$d, 20, 2, 622);
    			attr_dev(p, "class", "svelte-1h5icqg");
    			add_location(p, file$d, 38, 4, 1028);
    			add_location(div3, file$d, 37, 2, 1018);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1h5icqg"));
    			add_location(div4, file$d, 19, 0, 563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1h5icqg"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fyp", slots, []);
    	let fypImages = $store.fyp.images;
    	let techUsed = $store.fyp.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fyp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		fypImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("fypImages" in $$props) $$invalidate(2, fypImages = $$props.fypImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [carouselOpen, $darkmode, fypImages, techUsed, openCarousel, clickOutsideClose];
    }

    class Fyp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fyp",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/projects/Portfolio.svelte generated by Svelte v3.31.0 */
    const file$e = "src/components/projects/Portfolio.svelte";

    // (46:2) {#if carouselOpen}
    function create_if_block$8(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "portfolio",
    				images: /*portfolioImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$e, 46, 4, 1391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(46:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("This site!");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("My personal portfolio site, built with Svelte. The previous iteration of\n      my site was built with React - though I enjoy React and work with it\n      often, in this use case Svelte significantly reduced bundle size and\n      boilerplate code, allowing for better overall performance.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "This site!");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);
    			img = claim_element(header_nodes, "IMG", { class: true, src: true, alt: true });
    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "My personal portfolio site, built with Svelte. The previous iteration of\n      my site was built with React - though I enjoy React and work with it\n      often, in this use case Svelte significantly reduced bundle size and\n      boilerplate code, allowing for better overall performance.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-mr1q9h");
    			add_location(h2, file$e, 22, 6, 679);
    			attr_dev(i, "class", "fas fa-photo-video svelte-mr1q9h");
    			add_location(i, file$e, 24, 8, 762);
    			attr_dev(div0, "class", "image-icon svelte-mr1q9h");
    			add_location(div0, file$e, 23, 6, 705);
    			attr_dev(div1, "class", "title svelte-mr1q9h");
    			add_location(div1, file$e, 21, 4, 653);
    			attr_dev(div2, "class", "header-left svelte-mr1q9h");
    			add_location(div2, file$e, 27, 4, 823);
    			attr_dev(img, "class", "thumbnail svelte-mr1q9h");
    			if (img.src !== (img_src_value = "images/portfoliohome.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "portfolio");
    			add_location(img, file$e, 30, 4, 901);
    			attr_dev(header, "class", "svelte-mr1q9h");
    			add_location(header, file$e, 20, 2, 640);
    			attr_dev(p, "class", "svelte-mr1q9h");
    			add_location(p, file$e, 38, 4, 1050);
    			add_location(div3, file$e, 37, 2, 1040);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-mr1q9h"));
    			add_location(div4, file$e, 19, 0, 581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-mr1q9h"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Portfolio", slots, []);
    	let portfolioImages = $store.portfolio.images;
    	let techUsed = $store.portfolio.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		portfolioImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("portfolioImages" in $$props) $$invalidate(2, portfolioImages = $$props.portfolioImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		carouselOpen,
    		$darkmode,
    		portfolioImages,
    		techUsed,
    		openCarousel,
    		clickOutsideClose
    	];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/projects/MealGenerator.svelte generated by Svelte v3.31.0 */
    const file$f = "src/components/projects/MealGenerator.svelte";

    // (49:2) {#if carouselOpen}
    function create_if_block$9(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "meal-generator",
    				images: /*mealImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$f, 49, 4, 1484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(49:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Meal Generator");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("The meal generator is a single-page app that allows the user to create a\n      meal plan for the week. I built this out of necessity - working full time\n      while learning to code has been tough at times; the meal generator maps\n      out every meal and provides links to recipes, automating a time-consuming\n      task for your week.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Meal Generator");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);

    			img = claim_element(header_nodes, "IMG", {
    				class: true,
    				height: true,
    				width: true,
    				src: true,
    				alt: true
    			});

    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "The meal generator is a single-page app that allows the user to create a\n      meal plan for the week. I built this out of necessity - working full time\n      while learning to code has been tough at times; the meal generator maps\n      out every meal and provides links to recipes, automating a time-consuming\n      task for your week.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-aiordq");
    			add_location(h2, file$f, 22, 6, 682);
    			attr_dev(i, "class", "fas fa-photo-video svelte-aiordq");
    			add_location(i, file$f, 24, 8, 769);
    			attr_dev(div0, "class", "image-icon svelte-aiordq");
    			add_location(div0, file$f, 23, 6, 712);
    			attr_dev(div1, "class", "title svelte-aiordq");
    			add_location(div1, file$f, 21, 4, 656);
    			attr_dev(div2, "class", "header-left svelte-aiordq");
    			add_location(div2, file$f, 27, 4, 830);
    			attr_dev(img, "class", "thumbnail svelte-aiordq");
    			attr_dev(img, "height", "200");
    			attr_dev(img, "width", "165");
    			if (img.src !== (img_src_value = "images/mealgenerator/meal.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "meal");
    			add_location(img, file$f, 30, 4, 908);
    			attr_dev(header, "class", "svelte-aiordq");
    			add_location(header, file$f, 20, 2, 643);
    			attr_dev(p, "class", "svelte-aiordq");
    			add_location(p, file$f, 40, 4, 1094);
    			add_location(div3, file$f, 39, 2, 1084);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-aiordq"));
    			add_location(div4, file$f, 19, 0, 584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-aiordq"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MealGenerator", slots, []);
    	let mealImages = $store.mealGenerator.images;
    	let techUsed = $store.mealGenerator.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MealGenerator> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		mealImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("mealImages" in $$props) $$invalidate(2, mealImages = $$props.mealImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [carouselOpen, $darkmode, mealImages, techUsed, openCarousel, clickOutsideClose];
    }

    class MealGenerator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MealGenerator",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/projects/OTmobile.svelte generated by Svelte v3.31.0 */
    const file$g = "src/components/projects/OTmobile.svelte";

    // (49:2) {#if carouselOpen}
    function create_if_block$a(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "overtime-tracker",
    				images: /*OTImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$g, 49, 4, 1612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(49:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Overtime Tracker");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("Before breaking into the tech world I worked as a 9-1-1 Dispatcher. Due to the horrendous amount of\n      overtime, I became tired of wading through all of my calendar's events\n      to see when I was working week to week. I spun up this little app using\n      React Native, TypeScript, and different aspects of the Expo calendar API.\n      Identifying problems in my life and creating my own automated solutions\n      has been the most rewarding part of software development thus far.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Overtime Tracker");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);

    			img = claim_element(header_nodes, "IMG", {
    				class: true,
    				width: true,
    				src: true,
    				alt: true
    			});

    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Before breaking into the tech world I worked as a 9-1-1 Dispatcher. Due to the horrendous amount of\n      overtime, I became tired of wading through all of my calendar's events\n      to see when I was working week to week. I spun up this little app using\n      React Native, TypeScript, and different aspects of the Expo calendar API.\n      Identifying problems in my life and creating my own automated solutions\n      has been the most rewarding part of software development thus far.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-7qmubs");
    			add_location(h2, file$g, 22, 6, 675);
    			attr_dev(i, "class", "fas fa-photo-video svelte-7qmubs");
    			add_location(i, file$g, 24, 8, 764);
    			attr_dev(div0, "class", "image-icon svelte-7qmubs");
    			add_location(div0, file$g, 23, 6, 707);
    			attr_dev(div1, "class", "title svelte-7qmubs");
    			add_location(div1, file$g, 21, 4, 649);
    			attr_dev(div2, "class", "header-left svelte-7qmubs");
    			add_location(div2, file$g, 27, 4, 825);
    			attr_dev(img, "class", "thumbnail svelte-7qmubs");
    			attr_dev(img, "width", "150");
    			if (img.src !== (img_src_value = "images/OT/OThome.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Overtime Tracker");
    			add_location(img, file$g, 30, 4, 903);
    			attr_dev(header, "class", "svelte-7qmubs");
    			add_location(header, file$g, 20, 2, 636);
    			attr_dev(p, "class", "svelte-7qmubs");
    			add_location(p, file$g, 39, 4, 1073);
    			add_location(div3, file$g, 38, 2, 1063);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"));
    			add_location(div4, file$g, 19, 0, 577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("OTmobile", slots, []);
    	let OTImages = $store.OTmobile.images;
    	let techUsed = $store.OTmobile.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OTmobile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		fly,
    		OTImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("OTImages" in $$props) $$invalidate(2, OTImages = $$props.OTImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [carouselOpen, $darkmode, OTImages, techUsed, openCarousel, clickOutsideClose];
    }

    class OTmobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OTmobile",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/projects/UxDashboard.svelte generated by Svelte v3.31.0 */
    const file$h = "src/components/projects/UxDashboard.svelte";

    // (46:4) {#if carouselOpen}
    function create_if_block$b(ctx) {
    	let div;
    	let carousel;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	carousel = new Carousel({
    			props: {
    				openCarousel: /*openCarousel*/ ctx[4],
    				projectClass: "uxDashboard",
    				images: /*uxImages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(carousel.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "carousel-container");
    			add_location(div, file$h, 46, 6, 1551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carousel, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickOutsideClose*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carousel);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(46:4) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div4;
    	let header;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2;
    	let div2;
    	let projecttechgrid;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p;
    	let t5;
    	let t6;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Test Data Pipeline/Dashboard - Axos Bank");
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = space();
    			div2 = element("div");
    			create_component(projecttechgrid.$$.fragment);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			t5 = text("Built a data pipeline from the Testim.io test automation framework to a node.js api, which\n        dumped the data into Elasticsearch. I visualized the data in Kibana to enable teams to check \n        on the performance metrics of their applications in different testing and production environments.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			header = claim_element(div4_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Test Data Pipeline/Dashboard - Axos Bank");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			div2 = claim_element(header_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			claim_component(projecttechgrid.$$.fragment, div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);

    			img = claim_element(header_nodes, "IMG", {
    				class: true,
    				width: true,
    				src: true,
    				alt: true
    			});

    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Built a data pipeline from the Testim.io test automation framework to a node.js api, which\n        dumped the data into Elasticsearch. I visualized the data in Kibana to enable teams to check \n        on the performance metrics of their applications in different testing and production environments.");
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-1wfxytk");
    			add_location(h2, file$h, 22, 8, 725);
    			attr_dev(i, "class", "fas fa-photo-video svelte-1wfxytk");
    			add_location(i, file$h, 24, 10, 842);
    			attr_dev(div0, "class", "image-icon svelte-1wfxytk");
    			add_location(div0, file$h, 23, 8, 783);
    			attr_dev(div1, "class", "title svelte-1wfxytk");
    			add_location(div1, file$h, 21, 6, 697);
    			attr_dev(div2, "class", "header-left svelte-1wfxytk");
    			add_location(div2, file$h, 27, 6, 909);
    			attr_dev(img, "class", "thumbnail svelte-1wfxytk");
    			attr_dev(img, "width", "350");
    			if (img.src !== (img_src_value = "images/dashboardscreenshot.PNG")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "UX Dashboard");
    			add_location(img, file$h, 30, 6, 993);
    			attr_dev(header, "class", "svelte-1wfxytk");
    			add_location(header, file$h, 20, 4, 682);
    			attr_dev(p, "class", "svelte-1wfxytk");
    			add_location(p, file$h, 39, 6, 1187);
    			add_location(div3, file$h, 38, 4, 1175);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1wfxytk"));
    			add_location(div4, file$h, 19, 2, 621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(projecttechgrid, div2, null);
    			append_dev(header, t3);
    			append_dev(header, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t5);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(img, "click", /*openCarousel*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carouselOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carouselOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-1wfxytk"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(projecttechgrid);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $store;
    	let $darkmode;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(6, $store = $$value));
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(1, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UxDashboard", slots, []);
    	let uxImages = $store.uxDashboard.images;
    	let techUsed = $store.uxDashboard.tech;
    	let carouselOpen = false;

    	function openCarousel() {
    		$$invalidate(0, carouselOpen = !carouselOpen);
    	}

    	function clickOutsideClose(e) {
    		if (carouselOpen && e.target.className.includes("carousel-container")) {
    			$$invalidate(0, carouselOpen = !carouselOpen);
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UxDashboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carousel,
    		store,
    		darkmode,
    		fade,
    		fly,
    		uxImages,
    		techUsed,
    		ProjectTechGrid,
    		carouselOpen,
    		openCarousel,
    		clickOutsideClose,
    		$store,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("uxImages" in $$props) $$invalidate(2, uxImages = $$props.uxImages);
    		if ("techUsed" in $$props) $$invalidate(3, techUsed = $$props.techUsed);
    		if ("carouselOpen" in $$props) $$invalidate(0, carouselOpen = $$props.carouselOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [carouselOpen, $darkmode, uxImages, techUsed, openCarousel, clickOutsideClose];
    }

    class UxDashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UxDashboard",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/Projects.svelte generated by Svelte v3.31.0 */
    const file$i = "src/components/Projects.svelte";

    // (17:0) <Layout>
    function create_default_slot$2(ctx) {
    	let div;
    	let uxdashboard;
    	let t0;
    	let otmobile;
    	let t1;
    	let safetyblanket;
    	let t2;
    	let fyp;
    	let t3;
    	let hearsay;
    	let t4;
    	let portfolio;
    	let t5;
    	let fypmobile;
    	let t6;
    	let mealgenerator;
    	let div_transition;
    	let current;
    	uxdashboard = new UxDashboard({ $$inline: true });
    	otmobile = new OTmobile({ $$inline: true });
    	safetyblanket = new SafetyBlanket({ $$inline: true });
    	fyp = new Fyp({ $$inline: true });
    	hearsay = new Hearsay({ $$inline: true });
    	portfolio = new Portfolio({ $$inline: true });
    	fypmobile = new FypMobile({ $$inline: true });
    	mealgenerator = new MealGenerator({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(uxdashboard.$$.fragment);
    			t0 = space();
    			create_component(otmobile.$$.fragment);
    			t1 = space();
    			create_component(safetyblanket.$$.fragment);
    			t2 = space();
    			create_component(fyp.$$.fragment);
    			t3 = space();
    			create_component(hearsay.$$.fragment);
    			t4 = space();
    			create_component(portfolio.$$.fragment);
    			t5 = space();
    			create_component(fypmobile.$$.fragment);
    			t6 = space();
    			create_component(mealgenerator.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(uxdashboard.$$.fragment, div_nodes);
    			t0 = claim_space(div_nodes);
    			claim_component(otmobile.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(safetyblanket.$$.fragment, div_nodes);
    			t2 = claim_space(div_nodes);
    			claim_component(fyp.$$.fragment, div_nodes);
    			t3 = claim_space(div_nodes);
    			claim_component(hearsay.$$.fragment, div_nodes);
    			t4 = claim_space(div_nodes);
    			claim_component(portfolio.$$.fragment, div_nodes);
    			t5 = claim_space(div_nodes);
    			claim_component(fypmobile.$$.fragment, div_nodes);
    			t6 = claim_space(div_nodes);
    			claim_component(mealgenerator.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "grid svelte-174ovxb");
    			add_location(div, file$i, 17, 2, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(uxdashboard, div, null);
    			append_dev(div, t0);
    			mount_component(otmobile, div, null);
    			append_dev(div, t1);
    			mount_component(safetyblanket, div, null);
    			append_dev(div, t2);
    			mount_component(fyp, div, null);
    			append_dev(div, t3);
    			mount_component(hearsay, div, null);
    			append_dev(div, t4);
    			mount_component(portfolio, div, null);
    			append_dev(div, t5);
    			mount_component(fypmobile, div, null);
    			append_dev(div, t6);
    			mount_component(mealgenerator, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uxdashboard.$$.fragment, local);
    			transition_in(otmobile.$$.fragment, local);
    			transition_in(safetyblanket.$$.fragment, local);
    			transition_in(fyp.$$.fragment, local);
    			transition_in(hearsay.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(fypmobile.$$.fragment, local);
    			transition_in(mealgenerator.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: 1000, y: 500 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uxdashboard.$$.fragment, local);
    			transition_out(otmobile.$$.fragment, local);
    			transition_out(safetyblanket.$$.fragment, local);
    			transition_out(fyp.$$.fragment, local);
    			transition_out(hearsay.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(fypmobile.$$.fragment, local);
    			transition_out(mealgenerator.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: 1000, y: 500 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(uxdashboard);
    			destroy_component(otmobile);
    			destroy_component(safetyblanket);
    			destroy_component(fyp);
    			destroy_component(hearsay);
    			destroy_component(portfolio);
    			destroy_component(fypmobile);
    			destroy_component(mealgenerator);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(17:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t;
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-1en3a0b\"]", document.head);
    			head_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			claim_component(layout.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Projects";
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Projects", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Layout,
    		SafetyBlanket,
    		Hearsay,
    		FypMobile,
    		Fyp,
    		Portfolio,
    		MealGenerator,
    		fly,
    		OTmobile,
    		UxDashboard
    	});

    	return [];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/Resume.svelte generated by Svelte v3.31.0 */
    const file$j = "src/components/Resume.svelte";

    // (8:0) <Layout>
    function create_default_slot$3(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			iframe = claim_element(div_nodes, "IFRAME", { class: true, src: true, title: true });
    			children(iframe).forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(iframe, "class", "iframe svelte-1031sef");
    			if (iframe.src !== (iframe_src_value = "images/resume.pdf")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "resume");
    			add_location(iframe, file$j, 9, 4, 158);
    			attr_dev(div, "class", "container svelte-1031sef");
    			add_location(div, file$j, 8, 2, 130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(8:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let t;
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-ssytgw\"]", document.head);
    			head_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			claim_component(layout.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Resume";
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Resume", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resume> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Layout });
    	return [];
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.31.0 */

    function create_fragment$k(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
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
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.31.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
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
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
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
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
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
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * An action to be added at a root element of your application to
     * capture all relative links and push them onto the history stack.
     *
     * Example:
     * ```html
     * <div use:links>
     *   <Router>
     *     <Route path="/" component={Home} />
     *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
     *     {#each projects as project}
     *       <a href="/p/{project.id}">{project.title}</a>
     *     {/each}
     *   </Router>
     * </div>
     * ```
     */
    function links(node) {
      function findClosest(tagName, el) {
        while (el && el.tagName !== tagName) {
          el = el.parentNode;
        }
        return el;
      }

      function onClick(event) {
        const anchor = findClosest("A", event.target);

        if (
          anchor &&
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/utils/Nav.svelte generated by Svelte v3.31.0 */
    const file$k = "src/components/utils/Nav.svelte";

    // (27:2) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let p;
    	let t;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text("X");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { "aria-label": true, class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, "X");
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "close-button-text svelte-vp441w");
    			add_location(p, file$k, 34, 6, 785);
    			attr_dev(div, "aria-label", "Close Navigation");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("close-button") + " svelte-vp441w"));
    			add_location(div, file$k, 27, 4, 611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleNav*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { delay: 700, y: -50 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { y: -50 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(27:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if !open}
    function create_if_block_1$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*y*/ ctx[1] < 150 && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*y*/ ctx[1] < 150) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*y*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(15:2) {#if !open}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if y < 150}
    function create_if_block_2$2(ctx) {
    	let div;
    	let p;
    	let t;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text("|||");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { "aria-label": true, class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, "|||");
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "open-button-text svelte-vp441w");
    			add_location(p, file$k, 23, 8, 538);
    			attr_dev(div, "aria-label", "Open Navigation");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("open-button") + " svelte-vp441w"));
    			add_location(div, file$k, 16, 6, 313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "mouseenter", /*toggleNav*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { delay: 500, y: -100, duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { duration: 1000, y: -100 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(16:4) {#if y < 150}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#if open}
    function create_if_block$d(ctx) {
    	let div5;
    	let div0;
    	let a0;
    	let t0;
    	let div0_class_value;
    	let div0_intro;
    	let div0_outro;
    	let t1;
    	let div1;
    	let a1;
    	let t2;
    	let div1_class_value;
    	let div1_intro;
    	let div1_outro;
    	let t3;
    	let div2;
    	let a2;
    	let t4;
    	let div2_class_value;
    	let div2_intro;
    	let div2_outro;
    	let t5;
    	let div3;
    	let a3;
    	let t6;
    	let div3_class_value;
    	let div3_intro;
    	let div3_outro;
    	let t7;
    	let div4;
    	let a4;
    	let t8;
    	let div4_class_value;
    	let div4_intro;
    	let div4_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text("home");
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			t2 = text("experience");
    			t3 = space();
    			div2 = element("div");
    			a2 = element("a");
    			t4 = text("my work");
    			t5 = space();
    			div3 = element("div");
    			a3 = element("a");
    			t6 = text("resume");
    			t7 = space();
    			div4 = element("div");
    			a4 = element("a");
    			t8 = text("contact");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div5 = claim_element(nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div0 = claim_element(div5_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			a0 = claim_element(div0_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			t0 = claim_text(a0_nodes, "home");
    			a0_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div5_nodes);
    			div1 = claim_element(div5_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			a1 = claim_element(div1_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			t2 = claim_text(a1_nodes, "experience");
    			a1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t3 = claim_space(div5_nodes);
    			div2 = claim_element(div5_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			a2 = claim_element(div2_nodes, "A", { className: true, href: true, class: true });
    			var a2_nodes = children(a2);
    			t4 = claim_text(a2_nodes, "my work");
    			a2_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t5 = claim_space(div5_nodes);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			a3 = claim_element(div3_nodes, "A", { href: true, class: true });
    			var a3_nodes = children(a3);
    			t6 = claim_text(a3_nodes, "resume");
    			a3_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t7 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			a4 = claim_element(div4_nodes, "A", { className: true, href: true, class: true });
    			var a4_nodes = children(a4);
    			t8 = claim_text(a4_nodes, "contact");
    			a4_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-vp441w");
    			add_location(a0, file$k, 45, 8, 1088);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"));
    			add_location(div0, file$k, 39, 6, 880);
    			attr_dev(a1, "href", "/experience");
    			attr_dev(a1, "class", "svelte-vp441w");
    			add_location(a1, file$k, 53, 8, 1348);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"));
    			add_location(div1, file$k, 47, 6, 1128);
    			attr_dev(a2, "classname", "contact");
    			attr_dev(a2, "href", "/projects");
    			attr_dev(a2, "class", "svelte-vp441w");
    			add_location(a2, file$k, 61, 8, 1624);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"));
    			add_location(div2, file$k, 55, 6, 1404);
    			attr_dev(a3, "href", "/resume");
    			attr_dev(a3, "class", "svelte-vp441w");
    			add_location(a3, file$k, 69, 8, 1917);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"));
    			add_location(div3, file$k, 63, 6, 1697);
    			attr_dev(a4, "classname", "contact");
    			attr_dev(a4, "href", "/contact");
    			attr_dev(a4, "class", "svelte-vp441w");
    			add_location(a4, file$k, 77, 8, 2187);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"));
    			add_location(div4, file$k, 71, 6, 1967);
    			attr_dev(div5, "class", "nav svelte-vp441w");
    			add_location(div5, file$k, 38, 4, 856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div1, a1);
    			append_dev(a1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, a2);
    			append_dev(a2, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, a3);
    			append_dev(a3, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, a4);
    			append_dev(a4, t8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*toggleNav*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*toggleNav*/ ctx[3], false, false, false),
    					listen_dev(div2, "click", /*toggleNav*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*toggleNav*/ ctx[3], false, false, false),
    					listen_dev(div4, "click", /*toggleNav*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$darkmode*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*$darkmode*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*$darkmode*/ 4 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*$darkmode*/ 4 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*$darkmode*/ 4 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2] ? "link-div dark" : "link-div") + " svelte-vp441w"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, fly, { duration: 1000, y: 100 });
    				div0_intro.start();
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { duration: 1000, delay: 200, y: 100 });
    				div1_intro.start();
    			});

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, fly, { duration: 1000, delay: 300, y: 100 });
    				div2_intro.start();
    			});

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				if (!div3_intro) div3_intro = create_in_transition(div3, fly, { duration: 1000, delay: 400, y: 100 });
    				div3_intro.start();
    			});

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fly, { duration: 1000, delay: 500, y: 100 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fly, { duration: 1000, delay: 600, y: 700 });
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fly, { duration: 1000, delay: 500, y: 600 });
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fly, { duration: 1000, delay: 400, y: 500 });
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, fly, { duration: 1000, delay: 300, y: 400 });
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fly, { duration: 1000, delay: 200, y: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching && div0_outro) div0_outro.end();
    			if (detaching && div1_outro) div1_outro.end();
    			if (detaching && div2_outro) div2_outro.end();
    			if (detaching && div3_outro) div3_outro.end();
    			if (detaching && div4_outro) div4_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(38:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let nav;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let links_action;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[4]);
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*open*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*open*/ ctx[0] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", {});
    			var nav_nodes = children(nav);
    			if_block0.l(nav_nodes);
    			t = claim_space(nav_nodes);
    			if (if_block1) if_block1.l(nav_nodes);
    			nav_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(nav, file$k, 13, 0, 259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if_blocks[current_block_type_index].m(nav, null);
    			append_dev(nav, t);
    			if (if_block1) if_block1.m(nav, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[4]();
    					}),
    					action_destroyer(links_action = links.call(null, nav))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(nav, t);
    			}

    			if (/*open*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$d(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(nav, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $darkmode;
    	validate_store(darkmode, "darkmode");
    	component_subscribe($$self, darkmode, $$value => $$invalidate(2, $darkmode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let open = false;

    	function toggleNav() {
    		$$invalidate(0, open = !open);
    	}

    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(1, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		fly,
    		open,
    		toggleNav,
    		links,
    		darkmode,
    		y,
    		$darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, y, $darkmode, toggleNav, onwindowscroll];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$l = "src/App.svelte";

    // (15:4) <Route path="/">
    function create_default_slot_5(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(home.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(15:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:4) <Route path="/experience">
    function create_default_slot_4(ctx) {
    	let experience;
    	let current;
    	experience = new Experience_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(experience.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(experience.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(experience, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(experience.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(experience.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(experience, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(18:4) <Route path=\\\"/experience\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:4) <Route path="/projects">
    function create_default_slot_3(ctx) {
    	let projects;
    	let current;
    	projects = new Projects({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(projects.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(21:4) <Route path=\\\"/projects\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:4) <Route path="/resume">
    function create_default_slot_2(ctx) {
    	let resume;
    	let current;
    	resume = new Resume({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(resume.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(resume.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resume, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resume.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resume.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resume, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(24:4) <Route path=\\\"/resume\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:4) <Route path="/contact">
    function create_default_slot_1(ctx) {
    	let contact;
    	let current;
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contact.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(contact.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contact, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(27:4) <Route path=\\\"/contact\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Router {url}>
    function create_default_slot$4(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let current;
    	nav = new Nav({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/experience",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/projects",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/resume",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/contact",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			claim_component(nav.$$.fragment, div_nodes);
    			t0 = claim_space(div_nodes);
    			claim_component(route0.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(route1.$$.fragment, div_nodes);
    			t2 = claim_space(div_nodes);
    			claim_component(route2.$$.fragment, div_nodes);
    			t3 = claim_space(div_nodes);
    			claim_component(route3.$$.fragment, div_nodes);
    			t4 = claim_space(div_nodes);
    			claim_component(route4.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file$l, 12, 2, 426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(nav, div, null);
    			append_dev(div, t0);
    			mount_component(route0, div, null);
    			append_dev(div, t1);
    			mount_component(route1, div, null);
    			append_dev(div, t2);
    			mount_component(route2, div, null);
    			append_dev(div, t3);
    			mount_component(route3, div, null);
    			append_dev(div, t4);
    			mount_component(route4, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nav);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(12:0) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(router.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
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
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Home,
    		Experience: Experience_1,
    		Contact,
    		Projects,
    		Resume,
    		Nav,
    		Router,
    		Route,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      intro: true,
      hydrate: true,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
