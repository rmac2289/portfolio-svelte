
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
          name: "Testim.io",
          src: "images/icons/testim.jpg",
          href: "https://testim.io",
        },
        {
          name: "Azure DevOps",
          src: "images/icons/iconAzure.png",
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
        "S",
        "o",
        "f",
        "t",
        "w",
        "a",
        "r",
        "e",
        " ",
        "E",
        "n",
        "g",
        "i",
        "n",
        "e",
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
    			t3 = text("Full Stack Engineer");
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
    			t3 = claim_text(h2_nodes, "Full Stack Engineer");
    			h2_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "corner-name svelte-1l9meeq");
    			add_location(h1, file$2, 65, 8, 1359);
    			attr_dev(hr, "class", "svelte-1l9meeq");
    			add_location(hr, file$2, 66, 8, 1411);
    			attr_dev(h2, "class", "corner-sub svelte-1l9meeq");
    			add_location(h2, file$2, 68, 12, 1463);
    			attr_dev(div0, "class", "sub-header svelte-1l9meeq");
    			add_location(div0, file$2, 67, 8, 1426);
    			attr_dev(div1, "class", "container svelte-1l9meeq");
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

    // (18:2) {#if y > 50 || window.innerWidth > 1500}
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
    			attr_dev(h10, "class", "header svelte-10vcal7");
    			add_location(h10, file$5, 18, 4, 440);
    			attr_dev(div0, "class", "tech-grid svelte-10vcal7");
    			add_location(div0, file$5, 19, 4, 509);
    			attr_dev(h11, "class", "header svelte-10vcal7");
    			add_location(h11, file$5, 33, 4, 1025);
    			attr_dev(div1, "class", "tech-grid svelte-10vcal7");
    			add_location(div1, file$5, 37, 4, 1109);
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
    		source: "(18:2) {#if y > 50 || window.innerWidth > 1500}",
    		ctx
    	});

    	return block;
    }

    // (25:10) {:else}
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
    			add_location(img, file$5, 25, 12, 827);
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
    		source: "(25:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:10) {#if tech.class}
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
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*tech*/ ctx[7].class) + " svelte-10vcal7"));
    			set_style(i, "color", /*tech*/ ctx[7].color);
    			add_location(i, file$5, 23, 12, 745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*tech*/ ctx[7].class) + " svelte-10vcal7"))) {
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
    		source: "(23:10) {#if tech.class}",
    		ctx
    	});

    	return block;
    }

    // (21:6) {#each $store.tech as tech}
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
    			add_location(p, file$5, 28, 12, 935);
    			attr_dev(div, "class", "name svelte-10vcal7");
    			add_location(div, file$5, 27, 10, 904);
    			attr_dev(a, "href", a_href_value = /*tech*/ ctx[7].href);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-10vcal7"));

    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 21, 8, 611);
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
    			: "icon-box") + " svelte-10vcal7"))) {
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
    		source: "(21:6) {#each $store.tech as tech}",
    		ctx
    	});

    	return block;
    }

    // (43:10) {:else}
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
    			add_location(img, file$5, 43, 12, 1417);
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
    		source: "(43:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:10) {#if learning.class}
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
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*learning*/ ctx[4].class) + " svelte-10vcal7"));
    			set_style(i, "color", /*learning*/ ctx[4].color);
    			add_location(i, file$5, 41, 12, 1326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*learning*/ ctx[4].class) + " svelte-10vcal7"))) {
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
    		source: "(41:10) {#if learning.class}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#each $store.learning as learning}
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
    			add_location(p, file$5, 46, 12, 1533);
    			attr_dev(div0, "class", "name svelte-10vcal7");
    			add_location(div0, file$5, 45, 10, 1502);

    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[2]
    			? "icon-box icon-box-dark"
    			: "icon-box") + " svelte-10vcal7"));

    			add_location(div1, file$5, 39, 8, 1219);
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
    			: "icon-box") + " svelte-10vcal7"))) {
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
    		source: "(39:6) {#each $store.learning as learning}",
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
    			attr_dev(h1, "class", "header svelte-10vcal7");
    			add_location(h1, file$5, 13, 2, 311);
    			attr_dev(div, "class", "main-p svelte-10vcal7");
    			add_location(div, file$5, 14, 2, 348);
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
    	let button;
    	let t13;
    	let t14;
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
    			button = element("button");
    			t13 = text("send");
    			t14 = space();
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
    			div0_nodes.forEach(detach_dev);
    			t12 = claim_space(form_nodes);
    			button = claim_element(form_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t13 = claim_text(button_nodes, "send");
    			button_nodes.forEach(detach_dev);
    			form_nodes.forEach(detach_dev);
    			t14 = claim_space(div1_nodes);
    			claim_component(toast.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "header svelte-1y0hhbu");
    			add_location(h1, file$7, 58, 2, 1425);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "svelte-1y0hhbu");
    			add_location(label0, file$7, 62, 6, 1504);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "id", "email");
    			input0.required = input0_required_value = true;
    			attr_dev(input0, "class", "svelte-1y0hhbu");
    			add_location(input0, file$7, 63, 6, 1543);
    			attr_dev(label1, "for", "name");
    			attr_dev(label1, "class", "svelte-1y0hhbu");
    			add_location(label1, file$7, 64, 6, 1618);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "name");
    			input1.required = input1_required_value = true;
    			attr_dev(input1, "class", "svelte-1y0hhbu");
    			add_location(input1, file$7, 65, 6, 1655);
    			attr_dev(label2, "for", "message");
    			attr_dev(label2, "class", "svelte-1y0hhbu");
    			add_location(label2, file$7, 66, 6, 1727);
    			attr_dev(textarea, "type", "textarea");
    			attr_dev(textarea, "id", "message");
    			textarea.required = textarea_required_value = true;
    			attr_dev(textarea, "class", "svelte-1y0hhbu");
    			add_location(textarea, file$7, 67, 6, 1770);
    			attr_dev(i0, "class", "fab fa-linkedin-in svelte-1y0hhbu");
    			add_location(i0, file$7, 77, 36, 2044);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/rsmacdonald/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			add_location(a0, file$7, 74, 8, 1921);
    			attr_dev(i1, "class", "fab fa-github svelte-1y0hhbu");
    			add_location(i1, file$7, 82, 36, 2208);
    			attr_dev(a1, "href", "https://github.com/rmac2289");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			add_location(a1, file$7, 79, 8, 2098);
    			attr_dev(div0, "class", "icons svelte-1y0hhbu");
    			add_location(div0, file$7, 73, 6, 1893);
    			attr_dev(button, "class", "svelte-1y0hhbu");
    			add_location(button, file$7, 85, 6, 2268);
    			attr_dev(form, "class", "svelte-1y0hhbu");
    			add_location(form, file$7, 61, 4, 1491);
    			attr_dev(div1, "class", "content svelte-1y0hhbu");
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
    			append_dev(form, t12);
    			append_dev(form, button);
    			append_dev(button, t13);
    			append_dev(div1, t14);
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

    // (138:2) {#if carouselOpen}
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
    			add_location(div, file$a, 138, 4, 3240);
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
    		source: "(138:2) {#if carouselOpen}",
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
    			add_location(h2, file$a, 113, 6, 2420);
    			attr_dev(i, "class", "fas fa-photo-video svelte-7qmubs");
    			add_location(i, file$a, 115, 8, 2507);
    			attr_dev(div0, "class", "image-icon svelte-7qmubs");
    			add_location(div0, file$a, 114, 6, 2450);
    			attr_dev(div1, "class", "title svelte-7qmubs");
    			add_location(div1, file$a, 112, 4, 2394);
    			attr_dev(div2, "class", "header-left svelte-7qmubs");
    			add_location(div2, file$a, 118, 4, 2568);
    			attr_dev(img, "class", "thumbnail svelte-7qmubs");
    			attr_dev(img, "width", "150");
    			if (img.src !== (img_src_value = "images/safetyblanket/safetyHome.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "fyp");
    			add_location(img, file$a, 121, 4, 2646);
    			attr_dev(header, "class", "svelte-7qmubs");
    			add_location(header, file$a, 111, 2, 2381);
    			attr_dev(p, "class", "svelte-7qmubs");
    			add_location(p, file$a, 129, 4, 2814);
    			add_location(div3, file$a, 128, 2, 2804);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"));
    			add_location(div4, file$a, 110, 0, 2322);
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

    // (47:2) {#if carouselOpen}
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
    			add_location(div, file$e, 47, 4, 1475);
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
    		source: "(47:2) {#if carouselOpen}",
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
    			if (img.src !== (img_src_value = "https://res.cloudinary.com/de36vblcl/image/upload/v1640633040/portfolio/images/portfoliohome_i4082f.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "portfolio");
    			add_location(img, file$e, 30, 4, 901);
    			attr_dev(header, "class", "svelte-mr1q9h");
    			add_location(header, file$e, 20, 2, 640);
    			attr_dev(p, "class", "svelte-mr1q9h");
    			add_location(p, file$e, 39, 4, 1134);
    			add_location(div3, file$e, 38, 2, 1124);
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

    function noop$1() { }
    function assign$1(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object$1() {
        return Object.create(null);
    }
    function run_all$1(fns) {
        fns.forEach(run$1);
    }
    function is_function$1(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal$1(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function exclude_internal_props$1(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer$1(action_result) {
        return action_result && is_function$1(action_result.destroy) ? action_result.destroy : noop$1;
    }
    function insert$1(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach$1(node) {
        node.parentNode.removeChild(node);
    }
    function element$1(name) {
        return document.createElement(name);
    }
    function attr$1(node, attribute, value) {
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
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr$1(node, key, attributes[key]);
            }
        }
    }
    function children$1(element) {
        return Array.from(element.childNodes);
    }

    let current_component$1;
    function set_current_component$1(component) {
        current_component$1 = component;
    }
    function get_current_component$1() {
        if (!current_component$1)
            throw new Error(`Function called outside component initialization`);
        return current_component$1;
    }
    function afterUpdate(fn) {
        get_current_component$1().$$.after_update.push(fn);
    }

    const dirty_components$1 = [];
    const binding_callbacks$1 = [];
    const render_callbacks$1 = [];
    const flush_callbacks$1 = [];
    const resolved_promise$1 = Promise.resolve();
    let update_scheduled$1 = false;
    function schedule_update$1() {
        if (!update_scheduled$1) {
            update_scheduled$1 = true;
            resolved_promise$1.then(flush$1);
        }
    }
    function add_render_callback$1(fn) {
        render_callbacks$1.push(fn);
    }
    let flushing$1 = false;
    const seen_callbacks$1 = new Set();
    function flush$1() {
        if (flushing$1)
            return;
        flushing$1 = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components$1.length; i += 1) {
                const component = dirty_components$1[i];
                set_current_component$1(component);
                update$1(component.$$);
            }
            dirty_components$1.length = 0;
            while (binding_callbacks$1.length)
                binding_callbacks$1.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks$1.length; i += 1) {
                const callback = render_callbacks$1[i];
                if (!seen_callbacks$1.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks$1.add(callback);
                    callback();
                }
            }
            render_callbacks$1.length = 0;
        } while (dirty_components$1.length);
        while (flush_callbacks$1.length) {
            flush_callbacks$1.pop()();
        }
        update_scheduled$1 = false;
        flushing$1 = false;
        seen_callbacks$1.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all$1($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback$1);
        }
    }
    const outroing$1 = new Set();
    function transition_in$1(block, local) {
        if (block && block.i) {
            outroing$1.delete(block);
            block.i(local);
        }
    }

    function get_spread_update$1(levels, updates) {
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
    function mount_component$1(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback$1(() => {
            const new_on_destroy = on_mount.map(run$1).filter(is_function$1);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all$1(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback$1);
    }
    function destroy_component$1(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all$1($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty$1(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components$1.push(component);
            schedule_update$1();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component$1;
        set_current_component$1(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object$1(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object$1(),
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
                        make_dirty$1(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all$1($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children$1(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach$1);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in$1(component.$$.fragment);
            mount_component$1(component, options.target, options.anchor);
            flush$1();
        }
        set_current_component$1(parent_component);
    }
    class SvelteComponent$1 {
        $destroy() {
            destroy_component$1(this, 1);
            this.$destroy = noop$1;
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule$1(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire$1(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire$1 () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    var defineProperty = (function() {
      try {
        var func = _getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    var _defineProperty = defineProperty;

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && _defineProperty) {
        _defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    var _baseAssignValue = baseAssignValue;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$2.call(object, key) && eq_1(objValue, value)) ||
          (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
      }
    }

    var _assignValue = assignValue;

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          _baseAssignValue(object, key, newValue);
        } else {
          _assignValue(object, key, newValue);
        }
      }
      return object;
    }

    var _copyObject = copyObject;

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity$1(value) {
      return value;
    }

    var identity_1 = identity$1;

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    var _apply = apply;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return _apply(func, this, otherArgs);
      };
    }

    var _overRest = overRest;

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    var constant_1 = constant;

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !_defineProperty ? identity_1 : function(func, string) {
      return _defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant_1(string),
        'writable': true
      });
    };

    var _baseSetToString = baseSetToString;

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeNow = Date.now;

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    var _shortOut = shortOut;

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = _shortOut(_baseSetToString);

    var _setToString = setToString;

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return _setToString(_overRest(func, start, identity_1), func + '');
    }

    var _baseRest = baseRest;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    var isLength_1 = isLength;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject_1(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike_1(object) && _isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq_1(object[index], value);
      }
      return false;
    }

    var _isIterateeCall = isIterateeCall;

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return _baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    var _createAssigner = createAssigner;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$3.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    var isArguments_1 = isArguments;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule$1(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag$1 = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule$1(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$4.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$5.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

    /**
     * Assigns own enumerable string keyed properties of source objects to the
     * destination object. Source objects are applied from left to right.
     * Subsequent sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object` and is loosely based on
     * [`Object.assign`](https://mdn.io/Object/assign).
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assignIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assign({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'c': 3 }
     */
    var assign$1$1 = _createAssigner(function(object, source) {
      if (_isPrototype(source) || isArrayLike_1(source)) {
        _copyObject(source, keys_1(source), object);
        return;
      }
      for (var key in source) {
        if (hasOwnProperty$6.call(source, key)) {
          _assignValue(object, key, source[key]);
        }
      }
    });

    var assign_1 = assign$1$1;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new _ListCache;
      this.size = 0;
    }

    var _stackClear = stackClear;

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    var _stackDelete = stackDelete;

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    var _stackGet = stackGet;

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    var _stackHas = stackHas;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$8.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new _MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    var _stackSet = stackSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new _ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = _stackClear;
    Stack.prototype['delete'] = _stackDelete;
    Stack.prototype.get = _stackGet;
    Stack.prototype.has = _stackHas;
    Stack.prototype.set = _stackSet;

    var _Stack = Stack;

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    var _arrayEach = arrayEach;

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && _copyObject(source, keys_1(source), object);
    }

    var _baseAssign = baseAssign;

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    var _nativeKeysIn = nativeKeysIn;

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject_1(object)) {
        return _nativeKeysIn(object);
      }
      var isProto = _isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeysIn = baseKeysIn;

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn$1(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
    }

    var keysIn_1 = keysIn$1;

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && _copyObject(source, keysIn_1(source), object);
    }

    var _baseAssignIn = baseAssignIn;

    var _cloneBuffer = createCommonjsModule$1(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    module.exports = cloneBuffer;
    });

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var _arrayFilter = arrayFilter;

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    var stubArray_1 = stubArray;

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$c.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    var _getSymbols = getSymbols;

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return _copyObject(source, _getSymbols(source), object);
    }

    var _copySymbols = copySymbols;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    var _arrayPush = arrayPush;

    /** Built-in value references. */
    var getPrototype = _overArg(Object.getPrototypeOf, Object);

    var _getPrototype = getPrototype;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
      var result = [];
      while (object) {
        _arrayPush(result, _getSymbols(object));
        object = _getPrototype(object);
      }
      return result;
    };

    var _getSymbolsIn = getSymbolsIn;

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return _copyObject(source, _getSymbolsIn(source), object);
    }

    var _copySymbolsIn = copySymbolsIn;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
    }

    var _baseGetAllKeys = baseGetAllKeys;

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return _baseGetAllKeys(object, keys_1, _getSymbols);
    }

    var _getAllKeys = getAllKeys;

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
    }

    var _getAllKeysIn = getAllKeysIn;

    /* Built-in method references that are verified to be native. */
    var DataView = _getNative(_root, 'DataView');

    var _DataView = DataView;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap;

    /** `Object#toString` result references. */
    var mapTag$1 = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$1 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$1 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
        (_Map && getTag(new _Map) != mapTag$1) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag$1) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$1;
            case mapCtorString: return mapTag$1;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$1;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var _getTag = getTag;

    /** Used for built-in method references. */
    var objectProto$d = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$a = objectProto$d.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$a.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    var _initCloneArray = initCloneArray;

    /** Built-in value references. */
    var Uint8Array = _root.Uint8Array;

    var _Uint8Array = Uint8Array;

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
      return result;
    }

    var _cloneArrayBuffer = cloneArrayBuffer;

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    var _cloneDataView = cloneDataView;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    var _cloneRegExp = cloneRegExp;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    var _cloneSymbol = cloneSymbol;

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    var _cloneTypedArray = cloneTypedArray;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$1:
          return _cloneArrayBuffer(object);

        case boolTag$1:
        case dateTag$1:
          return new Ctor(+object);

        case dataViewTag$2:
          return _cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return _cloneTypedArray(object, isDeep);

        case mapTag$2:
          return new Ctor;

        case numberTag$1:
        case stringTag$1:
          return new Ctor(object);

        case regexpTag$1:
          return _cloneRegExp(object);

        case setTag$2:
          return new Ctor;

        case symbolTag:
          return _cloneSymbol(object);
      }
    }

    var _initCloneByTag = initCloneByTag;

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject_1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    var _baseCreate = baseCreate;

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !_isPrototype(object))
        ? _baseCreate(_getPrototype(object))
        : {};
    }

    var _initCloneObject = initCloneObject;

    /** `Object#toString` result references. */
    var mapTag$3 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike_1(value) && _getTag(value) == mapTag$3;
    }

    var _baseIsMap = baseIsMap;

    /* Node.js helper references. */
    var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

    var isMap_1 = isMap;

    /** `Object#toString` result references. */
    var setTag$3 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike_1(value) && _getTag(value) == setTag$3;
    }

    var _baseIsSet = baseIsSet;

    /* Node.js helper references. */
    var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

    var isSet_1 = isSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag$2 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        mapTag$4 = '[object Map]',
        numberTag$2 = '[object Number]',
        objectTag$2 = '[object Object]',
        regexpTag$2 = '[object RegExp]',
        setTag$4 = '[object Set]',
        stringTag$2 = '[object String]',
        symbolTag$1 = '[object Symbol]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$3 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
    cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
    cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
    cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
    cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
    cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] =
    cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
    cloneableTags[regexpTag$2] = cloneableTags[setTag$4] =
    cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
    cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
    cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
    cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
    cloneableTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject_1(value)) {
        return value;
      }
      var isArr = isArray_1(value);
      if (isArr) {
        result = _initCloneArray(value);
        if (!isDeep) {
          return _copyArray(value, result);
        }
      } else {
        var tag = _getTag(value),
            isFunc = tag == funcTag$2 || tag == genTag$1;

        if (isBuffer_1(value)) {
          return _cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : _initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? _copySymbolsIn(value, _baseAssignIn(result, value))
              : _copySymbols(value, _baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = _initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new _Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet_1(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap_1(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }

      var keysFunc = isFull
        ? (isFlat ? _getAllKeysIn : _getAllKeys)
        : (isFlat ? keysIn : keys_1);

      var props = isArr ? undefined : keysFunc(value);
      _arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    var _baseClone = baseClone;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG$1 = 1,
        CLONE_SYMBOLS_FLAG$1 = 4;

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return _baseClone(value, CLONE_DEEP_FLAG$1 | CLONE_SYMBOLS_FLAG$1);
    }

    var cloneDeep_1 = cloneDeep;

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var compact_1 = compact;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    var _setCacheAdd = setCacheAdd;

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    var _setCacheHas = setCacheHas;

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new _MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
    SetCache.prototype.has = _setCacheHas;

    var _SetCache = SetCache;

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    var _baseFindIndex = baseFindIndex;

    /**
     * The base implementation of `_.isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }

    var _baseIsNaN = baseIsNaN;

    /**
     * A specialized version of `_.indexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    var _strictIndexOf = strictIndexOf;

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      return value === value
        ? _strictIndexOf(array, value, fromIndex)
        : _baseFindIndex(array, _baseIsNaN, fromIndex);
    }

    var _baseIndexOf = baseIndexOf;

    /**
     * A specialized version of `_.includes` for arrays without support for
     * specifying an index to search from.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && _baseIndexOf(array, value, 0) > -1;
    }

    var _arrayIncludes = arrayIncludes;

    /**
     * This function is like `arrayIncludes` except that it accepts a comparator.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @param {Function} comparator The comparator invoked per element.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludesWith(array, value, comparator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }

    var _arrayIncludesWith = arrayIncludesWith;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    var _cacheHas = cacheHas;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE$1 = 200;

    /**
     * The base implementation of methods like `_.difference` without support
     * for excluding multiple arrays or iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Array} values The values to exclude.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     */
    function baseDifference(array, values, iteratee, comparator) {
      var index = -1,
          includes = _arrayIncludes,
          isCommon = true,
          length = array.length,
          result = [],
          valuesLength = values.length;

      if (!length) {
        return result;
      }
      if (iteratee) {
        values = _arrayMap(values, _baseUnary(iteratee));
      }
      if (comparator) {
        includes = _arrayIncludesWith;
        isCommon = false;
      }
      else if (values.length >= LARGE_ARRAY_SIZE$1) {
        includes = _cacheHas;
        isCommon = false;
        values = new _SetCache(values);
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee == null ? value : iteratee(value);

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
      return result;
    }

    var _baseDifference = baseDifference;

    /** Built-in value references. */
    var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray_1(value) || isArguments_1(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }

    var _isFlattenable = isFlattenable;

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = _isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            _arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    var _baseFlatten = baseFlatten;

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike_1(value) && isArrayLike_1(value);
    }

    var isArrayLikeObject_1 = isArrayLikeObject;

    /**
     * Creates an array of `array` values not included in the other given arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. The order and references of result values are
     * determined by the first array.
     *
     * **Note:** Unlike `_.pullAll`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.without, _.xor
     * @example
     *
     * _.difference([2, 1], [2, 3]);
     * // => [1]
     */
    var difference = _baseRest(function(array, values) {
      return isArrayLikeObject_1(array)
        ? _baseDifference(array, _baseFlatten(values, 1, isArrayLikeObject_1, true))
        : [];
    });

    var difference_1 = difference;

    /**
     * The base implementation of `_.functions` which creates an array of
     * `object` function property names filtered from `props`.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The property names to filter.
     * @returns {Array} Returns the function names.
     */
    function baseFunctions(object, props) {
      return _arrayFilter(props, function(key) {
        return isFunction_1(object[key]);
      });
    }

    var _baseFunctions = baseFunctions;

    /**
     * Creates an array of function property names from own enumerable properties
     * of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the function names.
     * @see _.functionsIn
     * @example
     *
     * function Foo() {
     *   this.a = _.constant('a');
     *   this.b = _.constant('b');
     * }
     *
     * Foo.prototype.c = _.constant('c');
     *
     * _.functions(new Foo);
     * // => ['a', 'b']
     */
    function functions(object) {
      return object == null ? [] : _baseFunctions(object, keys_1(object));
    }

    var functions_1 = functions;

    /** `Object#toString` result references. */
    var stringTag$3 = '[object String]';

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag$3);
    }

    var isString_1 = isString;

    /** `Object#toString` result references. */
    var symbolTag$2 = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag$2);
    }

    var isSymbol_1 = isSymbol;

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol_1(value)) {
        return NAN;
      }
      if (isObject_1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject_1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var toNumber_1 = toNumber;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber_1(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    var toFinite_1 = toFinite;

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite_1(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    var toInteger_1 = toInteger;

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return _arrayMap(props, function(key) {
        return object[key];
      });
    }

    var _baseValues = baseValues;

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : _baseValues(object, keys_1(object));
    }

    var values_1 = values;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax$1 = Math.max;

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike_1(collection) ? collection : values_1(collection);
      fromIndex = (fromIndex && !guard) ? toInteger_1(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax$1(length + fromIndex, 0);
      }
      return isString_1(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && _baseIndexOf(collection, value, fromIndex) > -1);
    }

    var includes_1 = includes;

    /** `Object#toString` result references. */
    var objectTag$3 = '[object Object]';

    /** Used for built-in method references. */
    var funcProto$2 = Function.prototype,
        objectProto$e = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$2 = funcProto$2.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$b = objectProto$e.hasOwnProperty;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString$2.call(Object);

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$3) {
        return false;
      }
      var proto = _getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty$b.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString$2.call(Ctor) == objectCtorString;
    }

    var isPlainObject_1 = isPlainObject;

    /**
     * Checks if `value` is likely a DOM element.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     *
     * _.isElement('<body>');
     * // => false
     */
    function isElement(value) {
      return isObjectLike_1(value) && value.nodeType === 1 && !isPlainObject_1(value);
    }

    var isElement_1 = isElement;

    /**
     * This function is like `assignValue` except that it doesn't assign
     * `undefined` values.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignMergeValue(object, key, value) {
      if ((value !== undefined && !eq_1(object[key], value)) ||
          (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
      }
    }

    var _assignMergeValue = assignMergeValue;

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    var _createBaseFor = createBaseFor;

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = _createBaseFor();

    var _baseFor = baseFor;

    /**
     * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function safeGet(object, key) {
      if (key === 'constructor' && typeof object[key] === 'function') {
        return;
      }

      if (key == '__proto__') {
        return;
      }

      return object[key];
    }

    var _safeGet = safeGet;

    /**
     * Converts `value` to a plain object flattening inherited enumerable string
     * keyed properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return _copyObject(value, keysIn_1(value));
    }

    var toPlainObject_1 = toPlainObject;

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = _safeGet(object, key),
          srcValue = _safeGet(source, key),
          stacked = stack.get(srcValue);

      if (stacked) {
        _assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

      var isCommon = newValue === undefined;

      if (isCommon) {
        var isArr = isArray_1(srcValue),
            isBuff = !isArr && isBuffer_1(srcValue),
            isTyped = !isArr && !isBuff && isTypedArray_1(srcValue);

        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray_1(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject_1(objValue)) {
            newValue = _copyArray(objValue);
          }
          else if (isBuff) {
            isCommon = false;
            newValue = _cloneBuffer(srcValue, true);
          }
          else if (isTyped) {
            isCommon = false;
            newValue = _cloneTypedArray(srcValue, true);
          }
          else {
            newValue = [];
          }
        }
        else if (isPlainObject_1(srcValue) || isArguments_1(srcValue)) {
          newValue = objValue;
          if (isArguments_1(objValue)) {
            newValue = toPlainObject_1(objValue);
          }
          else if (!isObject_1(objValue) || isFunction_1(objValue)) {
            newValue = _initCloneObject(srcValue);
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      _assignMergeValue(object, key, newValue);
    }

    var _baseMergeDeep = baseMergeDeep;

    /**
     * The base implementation of `_.merge` without support for multiple sources.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      _baseFor(source, function(srcValue, key) {
        stack || (stack = new _Stack);
        if (isObject_1(srcValue)) {
          _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(_safeGet(object, key), srcValue, (key + ''), object, source, stack)
            : undefined;

          if (newValue === undefined) {
            newValue = srcValue;
          }
          _assignMergeValue(object, key, newValue);
        }
      }, keysIn_1);
    }

    var _baseMerge = baseMerge;

    /**
     * This method is like `_.assign` except that it recursively merges own and
     * inherited enumerable string keyed properties of source objects into the
     * destination object. Source properties that resolve to `undefined` are
     * skipped if a destination value exists. Array and plain object properties
     * are merged recursively. Other objects and value types are overridden by
     * assignment. Source objects are applied from left to right. Subsequent
     * sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {
     *   'a': [{ 'b': 2 }, { 'd': 4 }]
     * };
     *
     * var other = {
     *   'a': [{ 'c': 3 }, { 'e': 5 }]
     * };
     *
     * _.merge(object, other);
     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
     */
    var merge = _createAssigner(function(object, source, srcIndex) {
      _baseMerge(object, source, srcIndex);
    });

    var merge_1 = merge;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
        symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray_1(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return _arrayMap(value, baseToString) + '';
      }
      if (isSymbol_1(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    var _baseToString = baseToString;

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    var _baseSlice = baseSlice;

    /**
     * Casts `array` to a slice if it's needed.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {number} start The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the cast slice.
     */
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined ? length : end;
      return (!start && end >= length) ? array : _baseSlice(array, start, end);
    }

    var _castSlice = castSlice;

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the last unmatched string symbol.
     */
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;

      while (index-- && _baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    var _charsEndIndex = charsEndIndex;

    /**
     * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the first unmatched string symbol.
     */
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1,
          length = strSymbols.length;

      while (++index < length && _baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    var _charsStartIndex = charsStartIndex;

    /**
     * Converts an ASCII `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function asciiToArray(string) {
      return string.split('');
    }

    var _asciiToArray = asciiToArray;

    /** Used to compose unicode character classes. */
    var rsAstralRange = '\\ud800-\\udfff',
        rsComboMarksRange = '\\u0300-\\u036f',
        reComboHalfMarksRange = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange = '\\u20d0-\\u20ff',
        rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
        rsVarRange = '\\ufe0e\\ufe0f';

    /** Used to compose unicode capture groups. */
    var rsZWJ = '\\u200d';

    /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
    var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

    /**
     * Checks if `string` contains Unicode symbols.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {boolean} Returns `true` if a symbol is found, else `false`.
     */
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }

    var _hasUnicode = hasUnicode;

    /** Used to compose unicode character classes. */
    var rsAstralRange$1 = '\\ud800-\\udfff',
        rsComboMarksRange$1 = '\\u0300-\\u036f',
        reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
        rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
        rsVarRange$1 = '\\ufe0e\\ufe0f';

    /** Used to compose unicode capture groups. */
    var rsAstral = '[' + rsAstralRange$1 + ']',
        rsCombo = '[' + rsComboRange$1 + ']',
        rsFitz = '\\ud83c[\\udffb-\\udfff]',
        rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
        rsNonAstral = '[^' + rsAstralRange$1 + ']',
        rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
        rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
        rsZWJ$1 = '\\u200d';

    /** Used to compose unicode regexes. */
    var reOptMod = rsModifier + '?',
        rsOptVar = '[' + rsVarRange$1 + ']?',
        rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
        rsSeq = rsOptVar + reOptMod + rsOptJoin,
        rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

    /**
     * Converts a Unicode `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }

    var _unicodeToArray = unicodeToArray;

    /**
     * Converts `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function stringToArray(string) {
      return _hasUnicode(string)
        ? _unicodeToArray(string)
        : _asciiToArray(string);
    }

    var _stringToArray = stringToArray;

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : _baseToString(value);
    }

    var toString_1 = toString;

    /** Used to match leading and trailing whitespace. */
    var reTrim$1 = /^\s+|\s+$/g;

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      string = toString_1(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrim$1, '');
      }
      if (!string || !(chars = _baseToString(chars))) {
        return string;
      }
      var strSymbols = _stringToArray(string),
          chrSymbols = _stringToArray(chars),
          start = _charsStartIndex(strSymbols, chrSymbols),
          end = _charsEndIndex(strSymbols, chrSymbols) + 1;

      return _castSlice(strSymbols, start, end).join('');
    }

    var trim_1 = trim;

    var cloudinaryCore = createCommonjsModule$1(function (module, exports) {
    /**
       * cloudinary-core.js
       * Cloudinary's JavaScript library - Version 2.10.3
       * Copyright Cloudinary
       * see https://github.com/cloudinary/cloudinary_js
       *
       */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory(assign_1, cloneDeep_1, compact_1, difference_1, functions_1, identity_1, includes_1, isArray_1, isElement_1, isFunction_1, isPlainObject_1, isString_1, merge_1, trim_1);
    })(commonjsGlobal, function(__WEBPACK_EXTERNAL_MODULE_lodash_assign__, __WEBPACK_EXTERNAL_MODULE_lodash_cloneDeep__, __WEBPACK_EXTERNAL_MODULE_lodash_compact__, __WEBPACK_EXTERNAL_MODULE_lodash_difference__, __WEBPACK_EXTERNAL_MODULE_lodash_functions__, __WEBPACK_EXTERNAL_MODULE_lodash_identity__, __WEBPACK_EXTERNAL_MODULE_lodash_includes__, __WEBPACK_EXTERNAL_MODULE_lodash_isArray__, __WEBPACK_EXTERNAL_MODULE_lodash_isElement__, __WEBPACK_EXTERNAL_MODULE_lodash_isFunction__, __WEBPACK_EXTERNAL_MODULE_lodash_isPlainObject__, __WEBPACK_EXTERNAL_MODULE_lodash_isString__, __WEBPACK_EXTERNAL_MODULE_lodash_merge__, __WEBPACK_EXTERNAL_MODULE_lodash_trim__) {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// define __esModule on exports
    /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/ 		}
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
    /******/
    /******/ 	// create a fake namespace object
    /******/ 	// mode & 1: value is a module id, require it
    /******/ 	// mode & 2: merge all properties of value into the ns
    /******/ 	// mode & 4: return value when already ns object
    /******/ 	// mode & 8|1: behave like require
    /******/ 	__webpack_require__.t = function(value, mode) {
    /******/ 		if(mode & 1) value = __webpack_require__(value);
    /******/ 		if(mode & 8) return value;
    /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    /******/ 		var ns = Object.create(null);
    /******/ 		__webpack_require__.r(ns);
    /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    /******/ 		return ns;
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = "./src/namespace/cloudinary-core.js");
    /******/ })
    /************************************************************************/
    /******/ ({

    /***/ "./src/namespace/cloudinary-core.js":
    /***/ (function(module, __webpack_exports__, __webpack_require__) {
    // ESM COMPAT FLAG
    __webpack_require__.r(__webpack_exports__);

    // EXPORTS
    __webpack_require__.d(__webpack_exports__, "ClientHintsMetaTag", function() { return /* reexport */ clienthintsmetatag; });
    __webpack_require__.d(__webpack_exports__, "Cloudinary", function() { return /* reexport */ cloudinary; });
    __webpack_require__.d(__webpack_exports__, "Condition", function() { return /* reexport */ condition; });
    __webpack_require__.d(__webpack_exports__, "Configuration", function() { return /* reexport */ src_configuration; });
    __webpack_require__.d(__webpack_exports__, "crc32", function() { return /* reexport */ src_crc32; });
    __webpack_require__.d(__webpack_exports__, "FetchLayer", function() { return /* reexport */ fetchlayer; });
    __webpack_require__.d(__webpack_exports__, "HtmlTag", function() { return /* reexport */ htmltag; });
    __webpack_require__.d(__webpack_exports__, "ImageTag", function() { return /* reexport */ imagetag; });
    __webpack_require__.d(__webpack_exports__, "Layer", function() { return /* reexport */ layer_layer; });
    __webpack_require__.d(__webpack_exports__, "PictureTag", function() { return /* reexport */ picturetag; });
    __webpack_require__.d(__webpack_exports__, "SubtitlesLayer", function() { return /* reexport */ subtitleslayer; });
    __webpack_require__.d(__webpack_exports__, "TextLayer", function() { return /* reexport */ textlayer; });
    __webpack_require__.d(__webpack_exports__, "Transformation", function() { return /* reexport */ src_transformation; });
    __webpack_require__.d(__webpack_exports__, "utf8_encode", function() { return /* reexport */ src_utf8_encode; });
    __webpack_require__.d(__webpack_exports__, "Util", function() { return /* reexport */ lodash_namespaceObject; });
    __webpack_require__.d(__webpack_exports__, "VideoTag", function() { return /* reexport */ videotag; });

    // NAMESPACE OBJECT: ./src/constants.js
    var constants_namespaceObject = {};
    __webpack_require__.r(constants_namespaceObject);
    __webpack_require__.d(constants_namespaceObject, "VERSION", function() { return VERSION; });
    __webpack_require__.d(constants_namespaceObject, "CF_SHARED_CDN", function() { return CF_SHARED_CDN; });
    __webpack_require__.d(constants_namespaceObject, "OLD_AKAMAI_SHARED_CDN", function() { return OLD_AKAMAI_SHARED_CDN; });
    __webpack_require__.d(constants_namespaceObject, "AKAMAI_SHARED_CDN", function() { return AKAMAI_SHARED_CDN; });
    __webpack_require__.d(constants_namespaceObject, "SHARED_CDN", function() { return SHARED_CDN; });
    __webpack_require__.d(constants_namespaceObject, "DEFAULT_POSTER_OPTIONS", function() { return DEFAULT_POSTER_OPTIONS; });
    __webpack_require__.d(constants_namespaceObject, "DEFAULT_VIDEO_SOURCE_TYPES", function() { return DEFAULT_VIDEO_SOURCE_TYPES; });
    __webpack_require__.d(constants_namespaceObject, "SEO_TYPES", function() { return SEO_TYPES; });
    __webpack_require__.d(constants_namespaceObject, "DEFAULT_IMAGE_PARAMS", function() { return DEFAULT_IMAGE_PARAMS; });
    __webpack_require__.d(constants_namespaceObject, "DEFAULT_VIDEO_PARAMS", function() { return DEFAULT_VIDEO_PARAMS; });
    __webpack_require__.d(constants_namespaceObject, "DEFAULT_VIDEO_SOURCES", function() { return DEFAULT_VIDEO_SOURCES; });
    __webpack_require__.d(constants_namespaceObject, "PLACEHOLDER_IMAGE_MODES", function() { return PLACEHOLDER_IMAGE_MODES; });
    __webpack_require__.d(constants_namespaceObject, "ACCESSIBILITY_MODES", function() { return ACCESSIBILITY_MODES; });
    __webpack_require__.d(constants_namespaceObject, "URL_KEYS", function() { return URL_KEYS; });

    // NAMESPACE OBJECT: ./src/util/lodash.js
    var lodash_namespaceObject = {};
    __webpack_require__.r(lodash_namespaceObject);
    __webpack_require__.d(lodash_namespaceObject, "getSDKAnalyticsSignature", function() { return getSDKAnalyticsSignature; });
    __webpack_require__.d(lodash_namespaceObject, "getAnalyticsOptions", function() { return getAnalyticsOptions; });
    __webpack_require__.d(lodash_namespaceObject, "assign", function() { return assign_root_assign_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "cloneDeep", function() { return cloneDeep_root_cloneDeep_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "compact", function() { return compact_root_compact_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "difference", function() { return difference_root_difference_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "functions", function() { return functions_root_functions_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "identity", function() { return identity_root_identity_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "includes", function() { return includes_root_includes_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "isArray", function() { return isArray_root_isArray_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "isPlainObject", function() { return isPlainObject_root_isPlainObject_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "isString", function() { return isString_root_isString_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "merge", function() { return merge_root_merge_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "contains", function() { return includes_root_includes_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "isIntersectionObserverSupported", function() { return isIntersectionObserverSupported; });
    __webpack_require__.d(lodash_namespaceObject, "isNativeLazyLoadSupported", function() { return isNativeLazyLoadSupported; });
    __webpack_require__.d(lodash_namespaceObject, "detectIntersection", function() { return detectIntersection; });
    __webpack_require__.d(lodash_namespaceObject, "omit", function() { return omit; });
    __webpack_require__.d(lodash_namespaceObject, "allStrings", function() { return baseutil_allStrings; });
    __webpack_require__.d(lodash_namespaceObject, "without", function() { return without; });
    __webpack_require__.d(lodash_namespaceObject, "isNumberLike", function() { return isNumberLike; });
    __webpack_require__.d(lodash_namespaceObject, "smartEscape", function() { return smartEscape; });
    __webpack_require__.d(lodash_namespaceObject, "defaults", function() { return defaults; });
    __webpack_require__.d(lodash_namespaceObject, "objectProto", function() { return objectProto; });
    __webpack_require__.d(lodash_namespaceObject, "objToString", function() { return objToString; });
    __webpack_require__.d(lodash_namespaceObject, "isObject", function() { return isObject; });
    __webpack_require__.d(lodash_namespaceObject, "funcTag", function() { return funcTag; });
    __webpack_require__.d(lodash_namespaceObject, "reWords", function() { return reWords; });
    __webpack_require__.d(lodash_namespaceObject, "camelCase", function() { return camelCase; });
    __webpack_require__.d(lodash_namespaceObject, "snakeCase", function() { return snakeCase; });
    __webpack_require__.d(lodash_namespaceObject, "convertKeys", function() { return convertKeys; });
    __webpack_require__.d(lodash_namespaceObject, "withCamelCaseKeys", function() { return withCamelCaseKeys; });
    __webpack_require__.d(lodash_namespaceObject, "withSnakeCaseKeys", function() { return withSnakeCaseKeys; });
    __webpack_require__.d(lodash_namespaceObject, "base64Encode", function() { return base64Encode; });
    __webpack_require__.d(lodash_namespaceObject, "base64EncodeURL", function() { return base64EncodeURL; });
    __webpack_require__.d(lodash_namespaceObject, "extractUrlParams", function() { return extractUrlParams; });
    __webpack_require__.d(lodash_namespaceObject, "patchFetchFormat", function() { return patchFetchFormat; });
    __webpack_require__.d(lodash_namespaceObject, "optionConsume", function() { return optionConsume; });
    __webpack_require__.d(lodash_namespaceObject, "isEmpty", function() { return isEmpty; });
    __webpack_require__.d(lodash_namespaceObject, "isElement", function() { return isElement_root_isElement_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "isFunction", function() { return isFunction_root_isFunction_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "trim", function() { return trim_root_trim_default.a; });
    __webpack_require__.d(lodash_namespaceObject, "getData", function() { return lodash_getData; });
    __webpack_require__.d(lodash_namespaceObject, "setData", function() { return lodash_setData; });
    __webpack_require__.d(lodash_namespaceObject, "getAttribute", function() { return lodash_getAttribute; });
    __webpack_require__.d(lodash_namespaceObject, "setAttribute", function() { return lodash_setAttribute; });
    __webpack_require__.d(lodash_namespaceObject, "removeAttribute", function() { return lodash_removeAttribute; });
    __webpack_require__.d(lodash_namespaceObject, "setAttributes", function() { return setAttributes; });
    __webpack_require__.d(lodash_namespaceObject, "hasClass", function() { return lodash_hasClass; });
    __webpack_require__.d(lodash_namespaceObject, "addClass", function() { return lodash_addClass; });
    __webpack_require__.d(lodash_namespaceObject, "getStyles", function() { return getStyles; });
    __webpack_require__.d(lodash_namespaceObject, "cssExpand", function() { return cssExpand; });
    __webpack_require__.d(lodash_namespaceObject, "domStyle", function() { return domStyle; });
    __webpack_require__.d(lodash_namespaceObject, "curCSS", function() { return curCSS; });
    __webpack_require__.d(lodash_namespaceObject, "cssValue", function() { return cssValue; });
    __webpack_require__.d(lodash_namespaceObject, "augmentWidthOrHeight", function() { return augmentWidthOrHeight; });
    __webpack_require__.d(lodash_namespaceObject, "getWidthOrHeight", function() { return getWidthOrHeight; });
    __webpack_require__.d(lodash_namespaceObject, "width", function() { return lodash_width; });

    // CONCATENATED MODULE: ./src/utf8_encode.js
    /**
     * UTF8 encoder
     * @private
     */
    var utf8_encode;
    /* harmony default export */ var src_utf8_encode = (utf8_encode = function utf8_encode(argString) {
      var c1, enc, end, n, start, string, stringl, utftext; // http://kevin.vanzonneveld.net
      // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: sowberry
      // +    tweaked by: Jack
      // +   bugfixed by: Onno Marsman
      // +   improved by: Yves Sucaet
      // +   bugfixed by: Onno Marsman
      // +   bugfixed by: Ulrich
      // +   bugfixed by: Rafal Kukawski
      // +   improved by: kirilloid
      // *     example 1: utf8_encode('Kevin van Zonneveld');
      // *     returns 1: 'Kevin van Zonneveld'

      if (argString === null || typeof argString === 'undefined') {
        return '';
      }

      string = argString + ''; // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      utftext = '';
      start = void 0;
      end = void 0;
      stringl = 0;
      start = end = 0;
      stringl = string.length;
      n = 0;

      while (n < stringl) {
        c1 = string.charCodeAt(n);
        enc = null;

        if (c1 < 128) {
          end++;
        } else if (c1 > 127 && c1 < 2048) {
          enc = String.fromCharCode(c1 >> 6 | 192, c1 & 63 | 128);
        } else {
          enc = String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, c1 & 63 | 128);
        }

        if (enc !== null) {
          if (end > start) {
            utftext += string.slice(start, end);
          }

          utftext += enc;
          start = end = n + 1;
        }

        n++;
      }

      if (end > start) {
        utftext += string.slice(start, stringl);
      }

      return utftext;
    });
    // CONCATENATED MODULE: ./src/crc32.js

    /**
     * CRC32 calculator
     * Depends on 'utf8_encode'
     * @private
     * @param {string} str - The string to calculate the CRC32 for.
     * @return {number}
     */

    function crc32(str) {
      var crc, i, iTop, table, x, y; // http://kevin.vanzonneveld.net
      // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // +   improved by: T0bsn
      // +   improved by: http://stackoverflow.com/questions/2647935/javascript-crc32-function-and-php-crc32-not-matching
      // -    depends on: utf8_encode
      // *     example 1: crc32('Kevin van Zonneveld');
      // *     returns 1: 1249991249

      str = src_utf8_encode(str);
      table = '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D';
      crc = 0;
      x = 0;
      y = 0;
      crc = crc ^ -1;
      i = 0;
      iTop = str.length;

      while (i < iTop) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = '0x' + table.substr(y * 9, 8);
        crc = crc >>> 8 ^ x;
        i++;
      }

      crc = crc ^ -1; //convert to unsigned 32-bit int if needed

      if (crc < 0) {
        crc += 4294967296;
      }

      return crc;
    }

    /* harmony default export */ var src_crc32 = (crc32);
    // CONCATENATED MODULE: ./src/sdkAnalytics/stringPad.js
    function stringPad(value, targetLength, padString) {
      targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;

      padString = String(typeof padString !== 'undefined' ? padString : ' ');

      if (value.length > targetLength) {
        return String(value);
      } else {
        targetLength = targetLength - value.length;

        if (targetLength > padString.length) {
          padString += repeatStringNumTimes(padString, targetLength / padString.length);
        }

        return padString.slice(0, targetLength) + String(value);
      }
    }

    function repeatStringNumTimes(string, times) {
      var repeatedString = "";

      while (times > 0) {
        repeatedString += string;
        times--;
      }

      return repeatedString;
    }
    // CONCATENATED MODULE: ./src/sdkAnalytics/base64Map.js
    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

    function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64Map_num = 0;
    var map = {};

    _toConsumableArray(chars).forEach(function (_char) {
      var key = base64Map_num.toString(2);
      key = stringPad(key, 6, '0');
      map[key] = _char;
      base64Map_num++;
    });
    /**
     * Map of six-bit binary codes to Base64 characters
     */


    /* harmony default export */ var base64Map = (map);
    // CONCATENATED MODULE: ./src/sdkAnalytics/reverseVersion.js

    /**
     * @description A semVer like string, x.y.z or x.y is allowed
     *              Reverses the version positions, x.y.z turns to z.y.x
     *              Pads each segment with '0' so they have length of 2
     *              Example: 1.2.3 -> 03.02.01
     * @param {string} semVer Input can be either x.y.z or x.y
     * @return {string} in the form of zz.yy.xx (
     */

    function reverseVersion(semVer) {
      if (semVer.split('.').length < 2) {
        throw new Error('invalid semVer, must have at least two segments');
      } // Split by '.', reverse, create new array with padded values and concat it together


      return semVer.split('.').reverse().map(function (segment) {
        return stringPad(segment, 2, '0');
      }).join('.');
    }
    // CONCATENATED MODULE: ./src/sdkAnalytics/encodeVersion.js



    /**
     * @description Encodes a semVer-like version string
     * @param {string} semVer Input can be either x.y.z or x.y
     * @return {string} A string built from 3 characters of the base64 table that encode the semVer
     */

    function encodeVersion(semVer) {
      var strResult = ''; // support x.y or x.y.z by using 'parts' as a variable

      var parts = semVer.split('.').length;
      var paddedStringLength = parts * 6; // we pad to either 12 or 18 characters
      // reverse (but don't mirror) the version. 1.5.15 -> 15.5.1
      // Pad to two spaces, 15.5.1 -> 15.05.01

      var paddedReversedSemver = reverseVersion(semVer); // turn 15.05.01 to a string '150501' then to a number 150501

      var num = parseInt(paddedReversedSemver.split('.').join('')); // Represent as binary, add left padding to 12 or 18 characters.
      // 150,501 -> 100100101111100101

      var paddedBinary = num.toString(2);
      paddedBinary = stringPad(paddedBinary, paddedStringLength, '0'); // Stop in case an invalid version number was provided
      // paddedBinary must be built from sections of 6 bits

      if (paddedBinary.length % 6 !== 0) {
        throw 'Version must be smaller than 43.21.26)';
      } // turn every 6 bits into a character using the base64Map


      paddedBinary.match(/.{1,6}/g).forEach(function (bitString) {
        // console.log(bitString);
        strResult += base64Map[bitString];
      });
      return strResult;
    }
    // CONCATENATED MODULE: ./src/sdkAnalytics/getSDKAnalyticsSignature.js

    /**
     * @description Gets the SDK signature by encoding the SDK version and tech version
     * @param {{
     *    [techVersion]:string,
     *    [sdkSemver]: string,
     *    [sdkCode]: string,
     *    [feature]: string
     * }} analyticsOptions
     * @return {string} sdkAnalyticsSignature
     */

    function getSDKAnalyticsSignature() {
      var analyticsOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      try {
        var twoPartVersion = removePatchFromSemver(analyticsOptions.techVersion);
        var encodedSDKVersion = encodeVersion(analyticsOptions.sdkSemver);
        var encodedTechVersion = encodeVersion(twoPartVersion);
        var featureCode = analyticsOptions.feature;
        var SDKCode = analyticsOptions.sdkCode;
        var algoVersion = 'A'; // The algo version is determined here, it should not be an argument

        return "".concat(algoVersion).concat(SDKCode).concat(encodedSDKVersion).concat(encodedTechVersion).concat(featureCode);
      } catch (e) {
        // Either SDK or Node versions were unparsable
        return 'E';
      }
    }
    /**
     * @description Removes patch version from the semver if it exists
     *              Turns x.y.z OR x.y into x.y
     * @param {'x.y.z' || 'x.y' || string} semVerStr
     */

    function removePatchFromSemver(semVerStr) {
      var parts = semVerStr.split('.');
      return "".concat(parts[0], ".").concat(parts[1]);
    }
    // CONCATENATED MODULE: ./src/sdkAnalytics/getAnalyticsOptions.js
    /**
     * @description Gets the analyticsOptions from options- should include sdkSemver, techVersion, sdkCode, and feature
     * @param options
     * @returns {{sdkSemver: (string), sdkCode, feature: string, techVersion: (string)} || {}}
     */
    function getAnalyticsOptions(options) {
      var analyticsOptions = {
        sdkSemver: options.sdkSemver,
        techVersion: options.techVersion,
        sdkCode: options.sdkCode,
        feature: '0'
      };

      if (options.urlAnalytics) {
        if (options.accessibility) {
          analyticsOptions.feature = 'D';
        }

        if (options.loading === 'lazy') {
          analyticsOptions.feature = 'C';
        }

        if (options.responsive) {
          analyticsOptions.feature = 'A';
        }

        if (options.placeholder) {
          analyticsOptions.feature = 'B';
        }

        return analyticsOptions;
      } else {
        return {};
      }
    }
    // EXTERNAL MODULE: external {"commonjs":"lodash/assign","commonjs2":"lodash/assign","amd":"lodash/assign","root":["_","assign"]}
    var assign_root_assign_ = __webpack_require__("lodash/assign");
    var assign_root_assign_default = /*#__PURE__*/__webpack_require__.n(assign_root_assign_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/cloneDeep","commonjs2":"lodash/cloneDeep","amd":"lodash/cloneDeep","root":["_","cloneDeep"]}
    var cloneDeep_root_cloneDeep_ = __webpack_require__("lodash/cloneDeep");
    var cloneDeep_root_cloneDeep_default = /*#__PURE__*/__webpack_require__.n(cloneDeep_root_cloneDeep_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/compact","commonjs2":"lodash/compact","amd":"lodash/compact","root":["_","compact"]}
    var compact_root_compact_ = __webpack_require__("lodash/compact");
    var compact_root_compact_default = /*#__PURE__*/__webpack_require__.n(compact_root_compact_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/difference","commonjs2":"lodash/difference","amd":"lodash/difference","root":["_","difference"]}
    var difference_root_difference_ = __webpack_require__("lodash/difference");
    var difference_root_difference_default = /*#__PURE__*/__webpack_require__.n(difference_root_difference_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/functions","commonjs2":"lodash/functions","amd":"lodash/functions","root":["_","functions"]}
    var functions_root_functions_ = __webpack_require__("lodash/functions");
    var functions_root_functions_default = /*#__PURE__*/__webpack_require__.n(functions_root_functions_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/identity","commonjs2":"lodash/identity","amd":"lodash/identity","root":["_","identity"]}
    var identity_root_identity_ = __webpack_require__("lodash/identity");
    var identity_root_identity_default = /*#__PURE__*/__webpack_require__.n(identity_root_identity_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/includes","commonjs2":"lodash/includes","amd":"lodash/includes","root":["_","includes"]}
    var includes_root_includes_ = __webpack_require__("lodash/includes");
    var includes_root_includes_default = /*#__PURE__*/__webpack_require__.n(includes_root_includes_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/isArray","commonjs2":"lodash/isArray","amd":"lodash/isArray","root":["_","isArray"]}
    var isArray_root_isArray_ = __webpack_require__("lodash/isArray");
    var isArray_root_isArray_default = /*#__PURE__*/__webpack_require__.n(isArray_root_isArray_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/isPlainObject","commonjs2":"lodash/isPlainObject","amd":"lodash/isPlainObject","root":["_","isPlainObject"]}
    var isPlainObject_root_isPlainObject_ = __webpack_require__("lodash/isPlainObject");
    var isPlainObject_root_isPlainObject_default = /*#__PURE__*/__webpack_require__.n(isPlainObject_root_isPlainObject_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/isString","commonjs2":"lodash/isString","amd":"lodash/isString","root":["_","isString"]}
    var isString_root_isString_ = __webpack_require__("lodash/isString");
    var isString_root_isString_default = /*#__PURE__*/__webpack_require__.n(isString_root_isString_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/merge","commonjs2":"lodash/merge","amd":"lodash/merge","root":["_","merge"]}
    var merge_root_merge_ = __webpack_require__("lodash/merge");
    var merge_root_merge_default = /*#__PURE__*/__webpack_require__.n(merge_root_merge_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/isElement","commonjs2":"lodash/isElement","amd":"lodash/isElement","root":["_","isElement"]}
    var isElement_root_isElement_ = __webpack_require__("lodash/isElement");
    var isElement_root_isElement_default = /*#__PURE__*/__webpack_require__.n(isElement_root_isElement_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/isFunction","commonjs2":"lodash/isFunction","amd":"lodash/isFunction","root":["_","isFunction"]}
    var isFunction_root_isFunction_ = __webpack_require__("lodash/isFunction");
    var isFunction_root_isFunction_default = /*#__PURE__*/__webpack_require__.n(isFunction_root_isFunction_);

    // EXTERNAL MODULE: external {"commonjs":"lodash/trim","commonjs2":"lodash/trim","amd":"lodash/trim","root":["_","trim"]}
    var trim_root_trim_ = __webpack_require__("lodash/trim");
    var trim_root_trim_default = /*#__PURE__*/__webpack_require__.n(trim_root_trim_);

    // CONCATENATED MODULE: ./src/util/lazyLoad.js
    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /*
     * Includes utility methods for lazy loading media
     */

    /**
     * Check if IntersectionObserver is supported
     * @return {boolean} true if window.IntersectionObserver is defined
     */
    function isIntersectionObserverSupported() {
      // Check that 'IntersectionObserver' property is defined on window
      return (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && window.IntersectionObserver;
    }
    /**
     * Check if native lazy loading is supported
     * @return {boolean} true if 'loading' property is defined for HTMLImageElement
     */

    function isNativeLazyLoadSupported() {
      return (typeof HTMLImageElement === "undefined" ? "undefined" : _typeof(HTMLImageElement)) === "object" && HTMLImageElement.prototype.loading;
    }
    /**
     * Calls onIntersect() when intersection is detected, or when
     * no native lazy loading or when IntersectionObserver isn't supported.
     * @param {Element} el - the element to observe
     * @param {function} onIntersect - called when the given element is in view
     */

    function detectIntersection(el, onIntersect) {
      try {
        if (isNativeLazyLoadSupported() || !isIntersectionObserverSupported()) {
          // Return if there's no need or possibility to detect intersection
          onIntersect();
          return;
        } // Detect intersection with given element using IntersectionObserver


        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              onIntersect();
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: [0, 0.01]
        });
        observer.observe(el);
      } catch (e) {
        onIntersect();
      }
    }
    // CONCATENATED MODULE: ./src/constants.js
    var VERSION = "2.5.0";
    var CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";
    var OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";
    var AKAMAI_SHARED_CDN = "res.cloudinary.com";
    var SHARED_CDN = AKAMAI_SHARED_CDN;
    var DEFAULT_POSTER_OPTIONS = {
      format: 'jpg',
      resource_type: 'video'
    };
    var DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv'];
    var SEO_TYPES = {
      "image/upload": "images",
      "image/private": "private_images",
      "image/authenticated": "authenticated_images",
      "raw/upload": "files",
      "video/upload": "videos"
    };
    /**
    * @const {Object} Cloudinary.DEFAULT_IMAGE_PARAMS
    * Defaults values for image parameters.
    *
    * (Previously defined using option_consume() )
     */

    var DEFAULT_IMAGE_PARAMS = {
      resource_type: "image",
      transformation: [],
      type: 'upload'
    };
    /**
    * Defaults values for video parameters.
    * @const {Object} Cloudinary.DEFAULT_VIDEO_PARAMS
    * (Previously defined using option_consume() )
     */

    var DEFAULT_VIDEO_PARAMS = {
      fallback_content: '',
      resource_type: "video",
      source_transformation: {},
      source_types: DEFAULT_VIDEO_SOURCE_TYPES,
      transformation: [],
      type: 'upload'
    };
    /**
     * Recommended sources for video tag
     * @const {Object} Cloudinary.DEFAULT_VIDEO_SOURCES
     */

    var DEFAULT_VIDEO_SOURCES = [{
      type: "mp4",
      codecs: "hev1",
      transformations: {
        video_codec: "h265"
      }
    }, {
      type: "webm",
      codecs: "vp9",
      transformations: {
        video_codec: "vp9"
      }
    }, {
      type: "mp4",
      transformations: {
        video_codec: "auto"
      }
    }, {
      type: "webm",
      transformations: {
        video_codec: "auto"
      }
    }];
    /**
     * Predefined placeholder transformations
     * @const {Object} Cloudinary.PLACEHOLDER_IMAGE_MODES
     */

    var PLACEHOLDER_IMAGE_MODES = {
      'blur': [{
        effect: 'blur:2000',
        quality: 1,
        fetch_format: 'auto'
      }],
      // Default
      'pixelate': [{
        effect: 'pixelate',
        quality: 1,
        fetch_format: 'auto'
      }],
      // Generates a pixel size image which color is the predominant color of the original image.
      'predominant-color-pixel': [{
        width: 'iw_div_2',
        aspect_ratio: 1,
        crop: 'pad',
        background: 'auto'
      }, {
        crop: 'crop',
        width: 1,
        height: 1,
        gravity: 'north_east'
      }, {
        fetch_format: 'auto',
        quality: 'auto'
      }],
      // Generates an image which color is the predominant color of the original image.
      'predominant-color': [{
        variables: [['$currWidth', 'w'], ['$currHeight', 'h']]
      }, {
        width: 'iw_div_2',
        aspect_ratio: 1,
        crop: 'pad',
        background: 'auto'
      }, {
        crop: 'crop',
        width: 10,
        height: 10,
        gravity: 'north_east'
      }, {
        width: '$currWidth',
        height: '$currHeight',
        crop: 'fill'
      }, {
        fetch_format: 'auto',
        quality: 'auto'
      }],
      'vectorize': [{
        effect: 'vectorize:3:0.1',
        fetch_format: 'svg'
      }]
    };
    /**
     * Predefined accessibility transformations
     * @const {Object} Cloudinary.ACCESSIBILITY_MODES
     */

    var ACCESSIBILITY_MODES = {
      darkmode: 'tint:75:black',
      brightmode: 'tint:50:white',
      monochrome: 'grayscale',
      colorblind: 'assist_colorblind'
    };
    /**
     * A list of keys used by the url() function.
     * @private
     */

    var URL_KEYS = ['accessibility', 'api_secret', 'auth_token', 'cdn_subdomain', 'cloud_name', 'cname', 'format', 'placeholder', 'private_cdn', 'resource_type', 'secure', 'secure_cdn_subdomain', 'secure_distribution', 'shorten', 'sign_url', 'signature', 'ssl_detected', 'type', 'url_suffix', 'use_root_path', 'version'];
    /**
     * The resource storage type
     * @typedef type
     * @enum {string}
     * @property  {string} 'upload' A resource uploaded directly to Cloudinary
     * @property  {string} 'fetch' A resource fetched by Cloudinary from a 3rd party storage
     * @property  {string} 'private'
     * @property  {string} 'authenticated'
     * @property  {string} 'sprite'
     * @property  {string} 'facebook'
     * @property  {string} 'twitter'
     * @property  {string} 'youtube'
     * @property  {string} 'vimeo'
     *
     */

    /**
     * The resource type
     * @typedef resourceType
     * @enum {string}
     * @property {string} 'image' An image file
     * @property {string} 'video' A video file
     * @property {string} 'raw'   A raw file
     */
    // CONCATENATED MODULE: ./src/util/baseutil.js
    function baseutil_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { baseutil_typeof = function _typeof(obj) { return typeof obj; }; } else { baseutil_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return baseutil_typeof(obj); }

    /*
     * Includes common utility methods and shims
     */


    function omit(obj, keys) {
      obj = obj || {};
      var srcKeys = Object.keys(obj).filter(function (key) {
        return !includes_root_includes_default()(keys, key);
      });
      var filtered = {};
      srcKeys.forEach(function (key) {
        return filtered[key] = obj[key];
      });
      return filtered;
    }
    /**
     * Return true if all items in list are strings
     * @function Util.allString
     * @param {Array} list - an array of items
     */

    var baseutil_allStrings = function allStrings(list) {
      return list.length && list.every(isString_root_isString_default.a);
    };
    /**
    * Creates a new array without the given item.
    * @function Util.without
    * @param {Array} array - original array
    * @param {*} item - the item to exclude from the new array
    * @return {Array} a new array made of the original array's items except for `item`
     */

    var without = function without(array, item) {
      return array.filter(function (v) {
        return v !== item;
      });
    };
    /**
    * Return true is value is a number or a string representation of a number.
    * @function Util.isNumberLike
    * @param {*} value
    * @returns {boolean} true if value is a number
    * @example
    *    Util.isNumber(0) // true
    *    Util.isNumber("1.3") // true
    *    Util.isNumber("") // false
    *    Util.isNumber(undefined) // false
     */

    var isNumberLike = function isNumberLike(value) {
      return value != null && !isNaN(parseFloat(value));
    };
    /**
     * Escape all characters matching unsafe in the given string
     * @function Util.smartEscape
     * @param {string} string - source string to escape
     * @param {RegExp} unsafe - characters that must be escaped
     * @return {string} escaped string
     */

    var smartEscape = function smartEscape(string) {
      var unsafe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /([^a-zA-Z0-9_.\-\/:]+)/g;
      return string.replace(unsafe, function (match) {
        return match.split("").map(function (c) {
          return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        }).join("");
      });
    };
    /**
     * Assign values from sources if they are not defined in the destination.
     * Once a value is set it does not change
     * @function Util.defaults
     * @param {Object} destination - the object to assign defaults to
     * @param {...Object} source - the source object(s) to assign defaults from
     * @return {Object} destination after it was modified
     */

    var defaults = function defaults(destination) {
      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      return sources.reduce(function (dest, source) {
        var key, value;

        for (key in source) {
          value = source[key];

          if (dest[key] === void 0) {
            dest[key] = value;
          }
        }

        return dest;
      }, destination);
    };
    /*********** lodash functions */

    var objectProto = Object.prototype;
    /**
     * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */

    var objToString = objectProto.toString;
    /**
     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
    #isObject({});
     * // => true
     *
    #isObject([1, 2, 3]);
     * // => true
     *
    #isObject(1);
     * // => false
     */

    var isObject = function isObject(value) {
      var type; // Avoid a V8 JIT bug in Chrome 19-20.
      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.

      type = baseutil_typeof(value);
      return !!value && (type === 'object' || type === 'function');
    };
    var funcTag = '[object Function]';
    /**
    * Checks if `value` is classified as a `Function` object.
    * @function Util.isFunction
    * @param {*} value The value to check.
    * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
    * @example
    *
    * function Foo(){};
    * isFunction(Foo);
    * // => true
    *
    * isFunction(/abc/);
    * // => false
     */

    var isFunction = function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in older versions of Chrome and Safari which return 'function' for regexes
      // and Safari 8 which returns 'object' for typed array constructors.
      return isObject(value) && objToString.call(value) === funcTag;
    };
    /*********** lodash functions */

    /** Used to match words to create compound words. */

    var reWords = function () {
      var lower, upper;
      upper = '[A-Z]';
      lower = '[a-z]+';
      return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
    }();
    /**
    * Convert string to camelCase
    * @function Util.camelCase
    * @param {string} source - the string to convert
    * @return {string} in camelCase format
     */

    var camelCase = function camelCase(source) {
      var words = source.match(reWords);
      words = words.map(function (word) {
        return word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
      });
      words[0] = words[0].toLocaleLowerCase();
      return words.join('');
    };
    /**
     * Convert string to snake_case
     * @function Util.snakeCase
     * @param {string} source - the string to convert
     * @return {string} in snake_case format
     */

    var snakeCase = function snakeCase(source) {
      var words = source.match(reWords);
      words = words.map(function (word) {
        return word.toLocaleLowerCase();
      });
      return words.join('_');
    };
    /**
     * Creates a new object from source, with the keys transformed using the converter.
     * @param {object} source
     * @param {function|null} converter
     * @returns {object}
     */

    var convertKeys = function convertKeys(source, converter) {
      var result, value;
      result = {};

      for (var key in source) {
        value = source[key];

        if (converter) {
          key = converter(key);
        }

        if (!isEmpty(key)) {
          result[key] = value;
        }
      }

      return result;
    };
    /**
     * Create a copy of the source object with all keys in camelCase
     * @function Util.withCamelCaseKeys
     * @param {Object} value - the object to copy
     * @return {Object} a new object
     */

    var withCamelCaseKeys = function withCamelCaseKeys(source) {
      return convertKeys(source, camelCase);
    };
    /**
     * Create a copy of the source object with all keys in snake_case
     * @function Util.withSnakeCaseKeys
     * @param {Object} value - the object to copy
     * @return {Object} a new object
     */

    var withSnakeCaseKeys = function withSnakeCaseKeys(source) {
      return convertKeys(source, snakeCase);
    }; // Browser
    // Node.js

    var base64Encode = typeof btoa !== 'undefined' && isFunction(btoa) ? btoa : typeof Buffer !== 'undefined' && isFunction(Buffer) ? function (input) {
      if (!(input instanceof Buffer)) {
        input = new Buffer.from(String(input), 'binary');
      }

      return input.toString('base64');
    } : function (input) {
      throw new Error("No base64 encoding function found");
    };
    /**
    * Returns the Base64-decoded version of url.<br>
    * This method delegates to `btoa` if present. Otherwise it tries `Buffer`.
    * @function Util.base64EncodeURL
    * @param {string} url - the url to encode. the value is URIdecoded and then re-encoded before converting to base64 representation
    * @return {string} the base64 representation of the URL
     */

    var base64EncodeURL = function base64EncodeURL(url) {
      try {
        url = decodeURI(url);
      } finally {
        url = encodeURI(url);
      }

      return base64Encode(url);
    };
    /**
     * Create a new object with only URL parameters
     * @param {object} options The source object
     * @return {Object} An object containing only URL parameters
     */

    function extractUrlParams(options) {
      return URL_KEYS.reduce(function (obj, key) {
        if (options[key] != null) {
          obj[key] = options[key];
        }

        return obj;
      }, {});
    }
    /**
     * Handle the format parameter for fetch urls
     * @private
     * @param options url and transformation options. This argument may be changed by the function!
     */

    function patchFetchFormat(options) {
      if (options == null) {
        options = {};
      }

      if (options.type === "fetch") {
        if (options.fetch_format == null) {
          options.fetch_format = optionConsume(options, "format");
        }
      }
    }
    /**
     * Deletes `option_name` from `options` and return the value if present.
     * If `options` doesn't contain `option_name` the default value is returned.
     * @param {Object} options a collection
     * @param {String} option_name the name (key) of the desired value
     * @param {*} [default_value] the value to return is option_name is missing
     */

    function optionConsume(options, option_name, default_value) {
      var result = options[option_name];
      delete options[option_name];

      if (result != null) {
        return result;
      } else {
        return default_value;
      }
    }
    /**
     * Returns true if value is empty:
     * <ul>
     *   <li>value is null or undefined</li>
     *   <li>value is an array or string of length 0</li>
     *   <li>value is an object with no keys</li>
     * </ul>
     * @function Util.isEmpty
     * @param value
     * @returns {boolean} true if value is empty
     */

    function isEmpty(value) {
      if (value == null) {
        return true;
      }

      if (typeof value.length == "number") {
        return value.length === 0;
      }

      if (typeof value.size == "number") {
        return value.size === 0;
      }

      if (baseutil_typeof(value) == "object") {
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            return false;
          }
        }

        return true;
      }

      return true;
    }
    // CONCATENATED MODULE: ./src/util/lodash.js
    var nodeContains;





















    /*
     * Includes utility methods and lodash / jQuery shims
     */

    /**
     * Get data from the DOM element.
     *
     * This method will use jQuery's `data()` method if it is available, otherwise it will get the `data-` attribute
     * @param {Element} element - the element to get the data from
     * @param {string} name - the name of the data item
     * @returns the value associated with the `name`
     * @function Util.getData
     */

    var lodash_getData = function getData(element, name) {
      switch (false) {
        case !(element == null):
          return void 0;

        case !isFunction_root_isFunction_default()(element.getAttribute):
          return element.getAttribute("data-".concat(name));

        case !isFunction_root_isFunction_default()(element.getAttr):
          return element.getAttr("data-".concat(name));

        case !isFunction_root_isFunction_default()(element.data):
          return element.data(name);

        case !(isFunction_root_isFunction_default()(typeof jQuery !== "undefined" && jQuery.fn && jQuery.fn.data) && isElement_root_isElement_default()(element)):
          return jQuery(element).data(name);
      }
    };
    /**
     * Set data in the DOM element.
     *
     * This method will use jQuery's `data()` method if it is available, otherwise it will set the `data-` attribute
     * @function Util.setData
     * @param {Element} element - the element to set the data in
     * @param {string} name - the name of the data item
     * @param {*} value - the value to be set
     *
     */

    var lodash_setData = function setData(element, name, value) {
      switch (false) {
        case !(element == null):
          return void 0;

        case !isFunction_root_isFunction_default()(element.setAttribute):
          return element.setAttribute("data-".concat(name), value);

        case !isFunction_root_isFunction_default()(element.setAttr):
          return element.setAttr("data-".concat(name), value);

        case !isFunction_root_isFunction_default()(element.data):
          return element.data(name, value);

        case !(isFunction_root_isFunction_default()(typeof jQuery !== "undefined" && jQuery.fn && jQuery.fn.data) && isElement_root_isElement_default()(element)):
          return jQuery(element).data(name, value);
      }
    };
    /**
     * Get attribute from the DOM element.
     *
     * @function Util.getAttribute
     * @param {Element} element - the element to set the attribute for
     * @param {string} name - the name of the attribute
     * @returns {*} the value of the attribute
     *
     */

    var lodash_getAttribute = function getAttribute(element, name) {
      switch (false) {
        case !(element == null):
          return void 0;

        case !isFunction_root_isFunction_default()(element.getAttribute):
          return element.getAttribute(name);

        case !isFunction_root_isFunction_default()(element.attr):
          return element.attr(name);

        case !isFunction_root_isFunction_default()(element.getAttr):
          return element.getAttr(name);
      }
    };
    /**
     * Set attribute in the DOM element.
     *
     * @function Util.setAttribute
     * @param {Element} element - the element to set the attribute for
     * @param {string} name - the name of the attribute
     * @param {*} value - the value to be set
     */

    var lodash_setAttribute = function setAttribute(element, name, value) {
      switch (false) {
        case !(element == null):
          return void 0;

        case !isFunction_root_isFunction_default()(element.setAttribute):
          return element.setAttribute(name, value);

        case !isFunction_root_isFunction_default()(element.attr):
          return element.attr(name, value);

        case !isFunction_root_isFunction_default()(element.setAttr):
          return element.setAttr(name, value);
      }
    };
    /**
     * Remove an attribute in the DOM element.
     *
     * @function Util.removeAttribute
     * @param {Element} element - the element to set the attribute for
     * @param {string} name - the name of the attribute
     */

    var lodash_removeAttribute = function removeAttribute(element, name) {
      switch (false) {
        case !(element == null):
          return void 0;

        case !isFunction_root_isFunction_default()(element.removeAttribute):
          return element.removeAttribute(name);

        default:
          return lodash_setAttribute(element, void 0);
      }
    };
    /**
     * Set a group of attributes to the element
     * @function Util.setAttributes
     * @param {Element} element - the element to set the attributes for
     * @param {Object} attributes - a hash of attribute names and values
     */

    var setAttributes = function setAttributes(element, attributes) {
      var name, results, value;
      results = [];

      for (name in attributes) {
        value = attributes[name];

        if (value != null) {
          results.push(lodash_setAttribute(element, name, value));
        } else {
          results.push(lodash_removeAttribute(element, name));
        }
      }

      return results;
    };
    /**
     * Checks if element has a css class
     * @function Util.hasClass
     * @param {Element} element - the element to check
     * @param {string} name - the class name
     @returns {boolean} true if the element has the class
     */

    var lodash_hasClass = function hasClass(element, name) {
      if (isElement_root_isElement_default()(element)) {
        return element.className.match(new RegExp("\\b".concat(name, "\\b")));
      }
    };
    /**
     * Add class to the element
     * @function Util.addClass
     * @param {Element} element - the element
     * @param {string} name - the class name to add
     */

    var lodash_addClass = function addClass(element, name) {
      if (!element.className.match(new RegExp("\\b".concat(name, "\\b")))) {
        return element.className = trim_root_trim_default()("".concat(element.className, " ").concat(name));
      }
    }; // The following code is taken from jQuery

    var getStyles = function getStyles(elem) {
      // Support: IE<=11+, Firefox<=30+ (#15098, #14150)
      // IE throws on elements created in popups
      // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
      if (elem.ownerDocument.defaultView.opener) {
        return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
      }

      return window.getComputedStyle(elem, null);
    };
    var cssExpand = ["Top", "Right", "Bottom", "Left"];

    nodeContains = function nodeContains(a, b) {
      var adown, bup;
      adown = a.nodeType === 9 ? a.documentElement : a;
      bup = b && b.parentNode;
      return a === bup || !!(bup && bup.nodeType === 1 && adown.contains(bup));
    }; // Truncated version of jQuery.style(elem, name)


    var domStyle = function domStyle(elem, name) {
      if (!(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)) {
        return elem.style[name];
      }
    };
    var curCSS = function curCSS(elem, name, computed) {
      var maxWidth, minWidth, ret, rmargin, style, width;
      rmargin = /^margin/;
      width = void 0;
      minWidth = void 0;
      maxWidth = void 0;
      ret = void 0;
      style = elem.style;
      computed = computed || getStyles(elem);

      if (computed) {
        // Support: IE9
        // getPropertyValue is only needed for .css('filter') (#12537)
        ret = computed.getPropertyValue(name) || computed[name];
      }

      if (computed) {
        if (ret === "" && !nodeContains(elem.ownerDocument, elem)) {
          ret = domStyle(elem, name);
        } // Support: iOS < 6
        // A tribute to the "awesome hack by Dean Edwards"
        // iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
        // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values


        if (rnumnonpx.test(ret) && rmargin.test(name)) {
          // Remember the original values
          width = style.width;
          minWidth = style.minWidth;
          maxWidth = style.maxWidth; // Put in the new values to get a computed value out

          style.minWidth = style.maxWidth = style.width = ret;
          ret = computed.width; // Revert the changed values

          style.width = width;
          style.minWidth = minWidth;
          style.maxWidth = maxWidth;
        }
      } // Support: IE
      // IE returns zIndex value as an integer.


      if (ret !== undefined) {
        return ret + "";
      } else {
        return ret;
      }
    };
    var cssValue = function cssValue(elem, name, convert, styles) {
      var val;
      val = curCSS(elem, name, styles);

      if (convert) {
        return parseFloat(val);
      } else {
        return val;
      }
    };
    var augmentWidthOrHeight = function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
      var i, len, side, sides, val; // If we already have the right measurement, avoid augmentation
      // Otherwise initialize for horizontal or vertical properties

      if (extra === (isBorderBox ? "border" : "content")) {
        return 0;
      } else {
        sides = name === "width" ? ["Right", "Left"] : ["Top", "Bottom"];
        val = 0;

        for (i = 0, len = sides.length; i < len; i++) {
          side = sides[i];

          if (extra === "margin") {
            // Both box models exclude margin, so add it if we want it
            val += cssValue(elem, extra + side, true, styles);
          }

          if (isBorderBox) {
            if (extra === "content") {
              // border-box includes padding, so remove it if we want content
              val -= cssValue(elem, "padding".concat(side), true, styles);
            }

            if (extra !== "margin") {
              // At this point, extra isn't border nor margin, so remove border
              val -= cssValue(elem, "border".concat(side, "Width"), true, styles);
            }
          } else {
            // At this point, extra isn't content, so add padding
            val += cssValue(elem, "padding".concat(side), true, styles);

            if (extra !== "padding") {
              // At this point, extra isn't content nor padding, so add border
              val += cssValue(elem, "border".concat(side, "Width"), true, styles);
            }
          }
        }

        return val;
      }
    };
    var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
    var getWidthOrHeight = function getWidthOrHeight(elem, name, extra) {
      var isBorderBox, styles, val, valueIsBorderBox; // Start with offset property, which is equivalent to the border-box value

      valueIsBorderBox = true;
      val = name === "width" ? elem.offsetWidth : elem.offsetHeight;
      styles = getStyles(elem);
      isBorderBox = cssValue(elem, "boxSizing", false, styles) === "border-box"; // Some non-html elements return undefined for offsetWidth, so check for null/undefined
      // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
      // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668

      if (val <= 0 || val == null) {
        // Fall back to computed then uncomputed css if necessary
        val = curCSS(elem, name, styles);

        if (val < 0 || val == null) {
          val = elem.style[name];
        }

        if (rnumnonpx.test(val)) {
          // Computed unit is not pixels. Stop here and return.
          return val;
        } // Check for style in case a browser which returns unreliable values
        // for getComputedStyle silently falls back to the reliable elem.style
        //    valueIsBorderBox = isBorderBox and (support.boxSizingReliable() or val is elem.style[name])


        valueIsBorderBox = isBorderBox && val === elem.style[name]; // Normalize "", auto, and prepare for extra

        val = parseFloat(val) || 0;
      } // Use the active box-sizing model to add/subtract irrelevant styles


      return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles);
    };
    var lodash_width = function width(element) {
      return getWidthOrHeight(element, "width", "content");
    };
    /**
     * @class Util
     */

    /**
     * Returns true if item is a string
     * @function Util.isString
     * @param item
     * @returns {boolean} true if item is a string
     */

    /**
     * Returns true if item is empty:
     * <ul>
     *   <li>item is null or undefined</li>
     *   <li>item is an array or string of length 0</li>
     *   <li>item is an object with no keys</li>
     * </ul>
     * @function Util.isEmpty
     * @param item
     * @returns {boolean} true if item is empty
     */

    /**
     * Assign source properties to destination.
     * If the property is an object it is assigned as a whole, overriding the destination object.
     * @function Util.assign
     * @param {Object} destination - the object to assign to
     */

    /**
     * Recursively assign source properties to destination
     * @function Util.merge
     * @param {Object} destination - the object to assign to
     * @param {...Object} [sources] The source objects.
     */

    /**
     * Create a new copy of the given object, including all internal objects.
     * @function Util.cloneDeep
     * @param {Object} value - the object to clone
     * @return {Object} a new deep copy of the object
     */

    /**
     * Creates a new array from the parameter with "falsey" values removed
     * @function Util.compact
     * @param {Array} array - the array to remove values from
     * @return {Array} a new array without falsey values
     */

    /**
     * Check if a given item is included in the given array
     * @function Util.contains
     * @param {Array} array - the array to search in
     * @param {*} item - the item to search for
     * @return {boolean} true if the item is included in the array
     */

    /**
     * Returns values in the given array that are not included in the other array
     * @function Util.difference
     * @param {Array} arr - the array to select from
     * @param {Array} values - values to filter from arr
     * @return {Array} the filtered values
     */

    /**
     * Returns a list of all the function names in obj
     * @function Util.functions
     * @param {Object} object - the object to inspect
     * @return {Array} a list of functions of object
     */

    /**
     * Returns the provided value. This functions is used as a default predicate function.
     * @function Util.identity
     * @param {*} value
     * @return {*} the provided value
     */

    /**
     * Remove leading or trailing spaces from text
     * @function Util.trim
     * @param {string} text
     * @return {string} the `text` without leading or trailing spaces
     */
    // CONCATENATED MODULE: ./src/expression.js
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * Represents a transformation expression.
     * @param {string} expressionStr - An expression in string format.
     * @class Expression
     *
     */
    var Expression = /*#__PURE__*/function () {
      function Expression(expressionStr) {
        _classCallCheck(this, Expression);

        /**
         * @protected
         * @inner Expression-expressions
         */
        this.expressions = [];

        if (expressionStr != null) {
          this.expressions.push(Expression.normalize(expressionStr));
        }
      }
      /**
       * Convenience constructor method
       * @function Expression.new
       */


      _createClass(Expression, [{
        key: "serialize",

        /**
         * Serialize the expression
         * @return {string} the expression as a string
         */
        value: function serialize() {
          return Expression.normalize(this.expressions.join("_"));
        }
      }, {
        key: "toString",
        value: function toString() {
          return this.serialize();
        }
        /**
         * Get the parent transformation of this expression
         * @return Transformation
         */

      }, {
        key: "getParent",
        value: function getParent() {
          return this.parent;
        }
        /**
         * Set the parent transformation of this expression
         * @param {Transformation} the parent transformation
         * @return {Expression} this expression
         */

      }, {
        key: "setParent",
        value: function setParent(parent) {
          this.parent = parent;
          return this;
        }
        /**
         * Add a expression
         * @function Expression#predicate
         * @internal
         */

      }, {
        key: "predicate",
        value: function predicate(name, operator, value) {
          if (Expression.OPERATORS[operator] != null) {
            operator = Expression.OPERATORS[operator];
          }

          this.expressions.push("".concat(name, "_").concat(operator, "_").concat(value));
          return this;
        }
        /**
         * @function Expression#and
         */

      }, {
        key: "and",
        value: function and() {
          this.expressions.push("and");
          return this;
        }
        /**
         * @function Expression#or
         */

      }, {
        key: "or",
        value: function or() {
          this.expressions.push("or");
          return this;
        }
        /**
         * Conclude expression
         * @function Expression#then
         * @return {Transformation} the transformation this expression is defined for
         */

      }, {
        key: "then",
        value: function then() {
          return this.getParent()["if"](this.toString());
        }
        /**
         * @function Expression#height
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Expression} this expression
         */

      }, {
        key: "height",
        value: function height(operator, value) {
          return this.predicate("h", operator, value);
        }
        /**
         * @function Expression#width
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Expression} this expression
         */

      }, {
        key: "width",
        value: function width(operator, value) {
          return this.predicate("w", operator, value);
        }
        /**
         * @function Expression#aspectRatio
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Expression} this expression
         */

      }, {
        key: "aspectRatio",
        value: function aspectRatio(operator, value) {
          return this.predicate("ar", operator, value);
        }
        /**
         * @function Expression#pages
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Expression} this expression
         */

      }, {
        key: "pageCount",
        value: function pageCount(operator, value) {
          return this.predicate("pc", operator, value);
        }
        /**
         * @function Expression#faces
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Expression} this expression
         */

      }, {
        key: "faceCount",
        value: function faceCount(operator, value) {
          return this.predicate("fc", operator, value);
        }
      }, {
        key: "value",
        value: function value(_value) {
          this.expressions.push(_value);
          return this;
        }
        /**
         */

      }], [{
        key: "new",
        value: function _new(expressionStr) {
          return new this(expressionStr);
        }
        /**
         * Normalize a string expression
         * @function Cloudinary#normalize
         * @param {string} expression a expression, e.g. "w gt 100", "width_gt_100", "width > 100"
         * @return {string} the normalized form of the value expression, e.g. "w_gt_100"
         */

      }, {
        key: "normalize",
        value: function normalize(expression) {
          var operators, operatorsPattern, operatorsReplaceRE, predefinedVarsPattern, predefinedVarsReplaceRE;

          if (expression == null) {
            return expression;
          }

          expression = String(expression);
          operators = "\\|\\||>=|<=|&&|!=|>|=|<|/|-|\\+|\\*|\\^"; // operators

          operatorsPattern = "((" + operators + ")(?=[ _]))";
          operatorsReplaceRE = new RegExp(operatorsPattern, "g");
          expression = expression.replace(operatorsReplaceRE, function (match) {
            return Expression.OPERATORS[match];
          }); // predefined variables

          predefinedVarsPattern = "(" + Object.keys(Expression.PREDEFINED_VARS).join("|") + ")";
          predefinedVarsReplaceRE = new RegExp(predefinedVarsPattern, "g");
          expression = expression.replace(predefinedVarsReplaceRE, function (match, p1, offset) {
            return expression[offset - 1] === '$' ? match : Expression.PREDEFINED_VARS[match];
          });
          return expression.replace(/[ _]+/g, '_');
        }
      }, {
        key: "variable",
        value: function variable(name, value) {
          return new this(name).value(value);
        }
        /**
         * @returns Expression a new expression with the predefined variable "width"
         * @function Expression.width
         */

      }, {
        key: "width",
        value: function width() {
          return new this("width");
        }
        /**
         * @returns Expression a new expression with the predefined variable "height"
         * @function Expression.height
         */

      }, {
        key: "height",
        value: function height() {
          return new this("height");
        }
        /**
         * @returns Expression a new expression with the predefined variable "initialWidth"
         * @function Expression.initialWidth
         */

      }, {
        key: "initialWidth",
        value: function initialWidth() {
          return new this("initialWidth");
        }
        /**
         * @returns Expression a new expression with the predefined variable "initialHeight"
         * @function Expression.initialHeight
         */

      }, {
        key: "initialHeight",
        value: function initialHeight() {
          return new this("initialHeight");
        }
        /**
         * @returns Expression a new expression with the predefined variable "aspectRatio"
         * @function Expression.aspectRatio
         */

      }, {
        key: "aspectRatio",
        value: function aspectRatio() {
          return new this("aspectRatio");
        }
        /**
         * @returns Expression a new expression with the predefined variable "initialAspectRatio"
         * @function Expression.initialAspectRatio
         */

      }, {
        key: "initialAspectRatio",
        value: function initialAspectRatio() {
          return new this("initialAspectRatio");
        }
        /**
         * @returns Expression a new expression with the predefined variable "pageCount"
         * @function Expression.pageCount
         */

      }, {
        key: "pageCount",
        value: function pageCount() {
          return new this("pageCount");
        }
        /**
         * @returns Expression new expression with the predefined variable "faceCount"
         * @function Expression.faceCount
         */

      }, {
        key: "faceCount",
        value: function faceCount() {
          return new this("faceCount");
        }
        /**
         * @returns Expression a new expression with the predefined variable "currentPage"
         * @function Expression.currentPage
         */

      }, {
        key: "currentPage",
        value: function currentPage() {
          return new this("currentPage");
        }
        /**
         * @returns Expression a new expression with the predefined variable "tags"
         * @function Expression.tags
         */

      }, {
        key: "tags",
        value: function tags() {
          return new this("tags");
        }
        /**
         * @returns Expression a new expression with the predefined variable "pageX"
         * @function Expression.pageX
         */

      }, {
        key: "pageX",
        value: function pageX() {
          return new this("pageX");
        }
        /**
         * @returns Expression a new expression with the predefined variable "pageY"
         * @function Expression.pageY
         */

      }, {
        key: "pageY",
        value: function pageY() {
          return new this("pageY");
        }
      }]);

      return Expression;
    }();
    /**
     * @internal
     */


    Expression.OPERATORS = {
      "=": 'eq',
      "!=": 'ne',
      "<": 'lt',
      ">": 'gt',
      "<=": 'lte',
      ">=": 'gte',
      "&&": 'and',
      "||": 'or',
      "*": "mul",
      "/": "div",
      "+": "add",
      "-": "sub",
      "^": "pow"
    };
    /**
     * @internal
     */

    Expression.PREDEFINED_VARS = {
      "aspect_ratio": "ar",
      "aspectRatio": "ar",
      "current_page": "cp",
      "currentPage": "cp",
      "preview:duration": "preview:duration",
      "duration": "du",
      "face_count": "fc",
      "faceCount": "fc",
      "height": "h",
      "initial_aspect_ratio": "iar",
      "initial_duration": "idu",
      "initial_height": "ih",
      "initial_width": "iw",
      "initialAspectRatio": "iar",
      "initialDuration": "idu",
      "initialHeight": "ih",
      "initialWidth": "iw",
      "page_count": "pc",
      "page_x": "px",
      "page_y": "py",
      "pageCount": "pc",
      "pageX": "px",
      "pageY": "py",
      "tags": "tags",
      "width": "w"
    };
    /**
     * @internal
     */

    Expression.BOUNDRY = "[ _]+";
    /* harmony default export */ var expression = (Expression);
    // CONCATENATED MODULE: ./src/condition.js
    function condition_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { condition_typeof = function _typeof(obj) { return typeof obj; }; } else { condition_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return condition_typeof(obj); }

    function condition_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function condition_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function condition_createClass(Constructor, protoProps, staticProps) { if (protoProps) condition_defineProperties(Constructor.prototype, protoProps); if (staticProps) condition_defineProperties(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (condition_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


    /**
     * Represents a transformation condition.
     * @param {string} conditionStr - a condition in string format
     * @class Condition
     * @example
     * // normally this class is not instantiated directly
     * var tr = cloudinary.Transformation.new()
     *    .if().width( ">", 1000).and().aspectRatio("<", "3:4").then()
     *      .width(1000)
     *      .crop("scale")
     *    .else()
     *      .width(500)
     *      .crop("scale")
     *
     * var tr = cloudinary.Transformation.new()
     *    .if("w > 1000 and aspectRatio < 3:4")
     *      .width(1000)
     *      .crop("scale")
     *    .else()
     *      .width(500)
     *      .crop("scale")
     *
     */

    var Condition = /*#__PURE__*/function (_Expression) {
      _inherits(Condition, _Expression);

      var _super = _createSuper(Condition);

      function Condition(conditionStr) {
        condition_classCallCheck(this, Condition);

        return _super.call(this, conditionStr);
      }
      /**
       * @function Condition#height
       * @param {string} operator the comparison operator (e.g. "<", "lt")
       * @param {string|number} value the right hand side value
       * @return {Condition} this condition
       */


      condition_createClass(Condition, [{
        key: "height",
        value: function height(operator, value) {
          return this.predicate("h", operator, value);
        }
        /**
         * @function Condition#width
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "width",
        value: function width(operator, value) {
          return this.predicate("w", operator, value);
        }
        /**
         * @function Condition#aspectRatio
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "aspectRatio",
        value: function aspectRatio(operator, value) {
          return this.predicate("ar", operator, value);
        }
        /**
         * @function Condition#pages
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "pageCount",
        value: function pageCount(operator, value) {
          return this.predicate("pc", operator, value);
        }
        /**
         * @function Condition#faces
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "faceCount",
        value: function faceCount(operator, value) {
          return this.predicate("fc", operator, value);
        }
        /**
         * @function Condition#duration
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "duration",
        value: function duration(operator, value) {
          return this.predicate("du", operator, value);
        }
        /**
         * @function Condition#initialDuration
         * @param {string} operator the comparison operator (e.g. "<", "lt")
         * @param {string|number} value the right hand side value
         * @return {Condition} this condition
         */

      }, {
        key: "initialDuration",
        value: function initialDuration(operator, value) {
          return this.predicate("idu", operator, value);
        }
      }]);

      return Condition;
    }(expression);

    /* harmony default export */ var condition = (Condition);
    // CONCATENATED MODULE: ./src/configuration.js
    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || configuration_unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function configuration_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return configuration_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return configuration_arrayLikeToArray(o, minLen); }

    function configuration_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

    function configuration_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function configuration_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function configuration_createClass(Constructor, protoProps, staticProps) { if (protoProps) configuration_defineProperties(Constructor.prototype, protoProps); if (staticProps) configuration_defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * Class for defining account configuration options.
     * Depends on 'utils'
     */

    /**
     * Class for defining account configuration options.
     * @constructor Configuration
     * @param {Object} options - The account configuration parameters to set.
     * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
     *  target="_new">Available configuration options</a>
     */

    var configuration_Configuration = /*#__PURE__*/function () {
      function Configuration(options) {
        configuration_classCallCheck(this, Configuration);

        this.configuration = options == null ? {} : cloneDeep_root_cloneDeep_default()(options);
        defaults(this.configuration, DEFAULT_CONFIGURATION_PARAMS);
      }
      /**
       * Initializes the configuration. This method is a convenience method that invokes both
       *  {@link Configuration#fromEnvironment|fromEnvironment()} (Node.js environment only)
       *  and {@link Configuration#fromDocument|fromDocument()}.
       *  It first tries to retrieve the configuration from the environment variable.
       *  If not available, it tries from the document meta tags.
       * @function Configuration#init
       * @return {Configuration} returns `this` for chaining
       * @see fromDocument
       * @see fromEnvironment
       */


      configuration_createClass(Configuration, [{
        key: "init",
        value: function init() {
          this.fromEnvironment();
          this.fromDocument();
          return this;
        }
        /**
         * Set a new configuration item
         * @function Configuration#set
         * @param {string} name - the name of the item to set
         * @param {*} value - the value to be set
         * @return {Configuration}
         *
         */

      }, {
        key: "set",
        value: function set(name, value) {
          this.configuration[name] = value;
          return this;
        }
        /**
         * Get the value of a configuration item
         * @function Configuration#get
         * @param {string} name - the name of the item to set
         * @return {*} the configuration item
         */

      }, {
        key: "get",
        value: function get(name) {
          return this.configuration[name];
        }
      }, {
        key: "merge",
        value: function merge(config) {
          assign_root_assign_default()(this.configuration, cloneDeep_root_cloneDeep_default()(config));
          return this;
        }
        /**
         * Initialize Cloudinary from HTML meta tags.
         * @function Configuration#fromDocument
         * @return {Configuration}
         * @example <meta name="cloudinary_cloud_name" content="mycloud">
         *
         */

      }, {
        key: "fromDocument",
        value: function fromDocument() {
          var el, i, len, meta_elements;
          meta_elements = typeof document !== "undefined" && document !== null ? document.querySelectorAll('meta[name^="cloudinary_"]') : void 0;

          if (meta_elements) {
            for (i = 0, len = meta_elements.length; i < len; i++) {
              el = meta_elements[i];
              this.configuration[el.getAttribute('name').replace('cloudinary_', '')] = el.getAttribute('content');
            }
          }

          return this;
        }
        /**
         * Initialize Cloudinary from the `CLOUDINARY_URL` environment variable.
         *
         * This function will only run under Node.js environment.
         * @function Configuration#fromEnvironment
         * @requires Node.js
         */

      }, {
        key: "fromEnvironment",
        value: function fromEnvironment() {
          var _this = this;

          var cloudinary_url, query, uri, uriRegex;

          if (typeof process !== "undefined" && process !== null && process.env && process.env.CLOUDINARY_URL) {
            cloudinary_url = process.env.CLOUDINARY_URL;
            uriRegex = /cloudinary:\/\/(?:(\w+)(?:\:([\w-]+))?@)?([\w\.-]+)(?:\/([^?]*))?(?:\?(.+))?/;
            uri = uriRegex.exec(cloudinary_url);

            if (uri) {
              if (uri[3] != null) {
                this.configuration['cloud_name'] = uri[3];
              }

              if (uri[1] != null) {
                this.configuration['api_key'] = uri[1];
              }

              if (uri[2] != null) {
                this.configuration['api_secret'] = uri[2];
              }

              if (uri[4] != null) {
                this.configuration['private_cdn'] = uri[4] != null;
              }

              if (uri[4] != null) {
                this.configuration['secure_distribution'] = uri[4];
              }

              query = uri[5];

              if (query != null) {
                query.split('&').forEach(function (value) {
                  var _value$split = value.split('='),
                      _value$split2 = _slicedToArray(_value$split, 2),
                      k = _value$split2[0],
                      v = _value$split2[1];

                  if (v == null) {
                    v = true;
                  }

                  _this.configuration[k] = v;
                });
              }
            }
          }

          return this;
        }
        /**
         * Create or modify the Cloudinary client configuration
         *
         * Warning: `config()` returns the actual internal configuration object. modifying it will change the configuration.
         *
         * This is a backward compatibility method. For new code, use get(), merge() etc.
         * @function Configuration#config
         * @param {hash|string|boolean} new_config
         * @param {string} new_value
         * @returns {*} configuration, or value
         *
         * @see {@link fromEnvironment} for initialization using environment variables
         * @see {@link fromDocument} for initialization using HTML meta tags
         */

      }, {
        key: "config",
        value: function config(new_config, new_value) {
          switch (false) {
            case new_value === void 0:
              this.set(new_config, new_value);
              return this.configuration;

            case !isString_root_isString_default()(new_config):
              return this.get(new_config);

            case !isPlainObject_root_isPlainObject_default()(new_config):
              this.merge(new_config);
              return this.configuration;

            default:
              // Backward compatibility - return the internal object
              return this.configuration;
          }
        }
        /**
         * Returns a copy of the configuration parameters
         * @function Configuration#toOptions
         * @returns {Object} a key:value collection of the configuration parameters
         */

      }, {
        key: "toOptions",
        value: function toOptions() {
          return cloneDeep_root_cloneDeep_default()(this.configuration);
        }
      }]);

      return Configuration;
    }();

    var DEFAULT_CONFIGURATION_PARAMS = {
      responsive_class: 'cld-responsive',
      responsive_use_breakpoints: true,
      round_dpr: true,
      secure: (typeof window !== "undefined" && window !== null ? window.location ? window.location.protocol : void 0 : void 0) === 'https:'
    };
    configuration_Configuration.CONFIG_PARAMS = ["api_key", "api_secret", "callback", "cdn_subdomain", "cloud_name", "cname", "private_cdn", "protocol", "resource_type", "responsive", "responsive_class", "responsive_use_breakpoints", "responsive_width", "round_dpr", "secure", "secure_cdn_subdomain", "secure_distribution", "shorten", "type", "upload_preset", "url_suffix", "use_root_path", "version"];
    /* harmony default export */ var src_configuration = (configuration_Configuration);
    // CONCATENATED MODULE: ./src/layer/layer.js
    function layer_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function layer_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function layer_createClass(Constructor, protoProps, staticProps) { if (protoProps) layer_defineProperties(Constructor.prototype, protoProps); if (staticProps) layer_defineProperties(Constructor, staticProps); return Constructor; }



    var layer_Layer = /*#__PURE__*/function () {
      /**
       * Layer
       * @constructor Layer
       * @param {Object} options - layer parameters
       */
      function Layer(options) {
        var _this = this;

        layer_classCallCheck(this, Layer);

        this.options = {};

        if (options != null) {
          ["resourceType", "type", "publicId", "format"].forEach(function (key) {
            var ref;
            return _this.options[key] = (ref = options[key]) != null ? ref : options[snakeCase(key)];
          });
        }
      }

      layer_createClass(Layer, [{
        key: "resourceType",
        value: function resourceType(value) {
          this.options.resourceType = value;
          return this;
        }
      }, {
        key: "type",
        value: function type(value) {
          this.options.type = value;
          return this;
        }
      }, {
        key: "publicId",
        value: function publicId(value) {
          this.options.publicId = value;
          return this;
        }
        /**
         * Get the public ID, formatted for layer parameter
         * @function Layer#getPublicId
         * @return {String} public ID
         */

      }, {
        key: "getPublicId",
        value: function getPublicId() {
          var ref;
          return (ref = this.options.publicId) != null ? ref.replace(/\//g, ":") : void 0;
        }
        /**
         * Get the public ID, with format if present
         * @function Layer#getFullPublicId
         * @return {String} public ID
         */

      }, {
        key: "getFullPublicId",
        value: function getFullPublicId() {
          if (this.options.format != null) {
            return this.getPublicId() + "." + this.options.format;
          } else {
            return this.getPublicId();
          }
        }
      }, {
        key: "format",
        value: function format(value) {
          this.options.format = value;
          return this;
        }
        /**
         * generate the string representation of the layer
         * @function Layer#toString
         */

      }, {
        key: "toString",
        value: function toString() {
          var components;
          components = [];

          if (this.options.publicId == null) {
            throw "Must supply publicId";
          }

          if (!(this.options.resourceType === "image")) {
            components.push(this.options.resourceType);
          }

          if (!(this.options.type === "upload")) {
            components.push(this.options.type);
          }

          components.push(this.getFullPublicId());
          return compact_root_compact_default()(components).join(":");
        }
      }, {
        key: "clone",
        value: function clone() {
          return new this.constructor(this.options);
        }
      }]);

      return Layer;
    }();

    /* harmony default export */ var layer_layer = (layer_Layer);
    // CONCATENATED MODULE: ./src/layer/textlayer.js
    function textlayer_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { textlayer_typeof = function _typeof(obj) { return typeof obj; }; } else { textlayer_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return textlayer_typeof(obj); }

    function textlayer_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function textlayer_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function textlayer_createClass(Constructor, protoProps, staticProps) { if (protoProps) textlayer_defineProperties(Constructor.prototype, protoProps); if (staticProps) textlayer_defineProperties(Constructor, staticProps); return Constructor; }

    function textlayer_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) textlayer_setPrototypeOf(subClass, superClass); }

    function textlayer_setPrototypeOf(o, p) { textlayer_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return textlayer_setPrototypeOf(o, p); }

    function textlayer_createSuper(Derived) { var hasNativeReflectConstruct = textlayer_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = textlayer_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = textlayer_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return textlayer_possibleConstructorReturn(this, result); }; }

    function textlayer_possibleConstructorReturn(self, call) { if (call && (textlayer_typeof(call) === "object" || typeof call === "function")) { return call; } return textlayer_assertThisInitialized(self); }

    function textlayer_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function textlayer_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function textlayer_getPrototypeOf(o) { textlayer_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return textlayer_getPrototypeOf(o); }




    var textlayer_TextLayer = /*#__PURE__*/function (_Layer) {
      textlayer_inherits(TextLayer, _Layer);

      var _super = textlayer_createSuper(TextLayer);

      /**
       * @constructor TextLayer
       * @param {Object} options - layer parameters
       */
      function TextLayer(options) {
        var _this;

        textlayer_classCallCheck(this, TextLayer);

        var keys;
        _this = _super.call(this, options);
        keys = ["resourceType", "resourceType", "fontFamily", "fontSize", "fontWeight", "fontStyle", "textDecoration", "textAlign", "stroke", "letterSpacing", "lineSpacing", "fontHinting", "fontAntialiasing", "text"];

        if (options != null) {
          keys.forEach(function (key) {
            var ref;
            return _this.options[key] = (ref = options[key]) != null ? ref : options[snakeCase(key)];
          });
        }

        _this.options.resourceType = "text";
        return _this;
      }

      textlayer_createClass(TextLayer, [{
        key: "resourceType",
        value: function resourceType(_resourceType) {
          throw "Cannot modify resourceType for text layers";
        }
      }, {
        key: "type",
        value: function type(_type) {
          throw "Cannot modify type for text layers";
        }
      }, {
        key: "format",
        value: function format(_format) {
          throw "Cannot modify format for text layers";
        }
      }, {
        key: "fontFamily",
        value: function fontFamily(_fontFamily) {
          this.options.fontFamily = _fontFamily;
          return this;
        }
      }, {
        key: "fontSize",
        value: function fontSize(_fontSize) {
          this.options.fontSize = _fontSize;
          return this;
        }
      }, {
        key: "fontWeight",
        value: function fontWeight(_fontWeight) {
          this.options.fontWeight = _fontWeight;
          return this;
        }
      }, {
        key: "fontStyle",
        value: function fontStyle(_fontStyle) {
          this.options.fontStyle = _fontStyle;
          return this;
        }
      }, {
        key: "textDecoration",
        value: function textDecoration(_textDecoration) {
          this.options.textDecoration = _textDecoration;
          return this;
        }
      }, {
        key: "textAlign",
        value: function textAlign(_textAlign) {
          this.options.textAlign = _textAlign;
          return this;
        }
      }, {
        key: "stroke",
        value: function stroke(_stroke) {
          this.options.stroke = _stroke;
          return this;
        }
      }, {
        key: "letterSpacing",
        value: function letterSpacing(_letterSpacing) {
          this.options.letterSpacing = _letterSpacing;
          return this;
        }
      }, {
        key: "lineSpacing",
        value: function lineSpacing(_lineSpacing) {
          this.options.lineSpacing = _lineSpacing;
          return this;
        }
      }, {
        key: "fontHinting",
        value: function fontHinting(_fontHinting) {
          this.options.fontHinting = _fontHinting;
          return this;
        }
      }, {
        key: "fontAntialiasing",
        value: function fontAntialiasing(_fontAntialiasing) {
          this.options.fontAntialiasing = _fontAntialiasing;
          return this;
        }
      }, {
        key: "text",
        value: function text(_text) {
          this.options.text = _text;
          return this;
        }
        /**
         * generate the string representation of the layer
         * @function TextLayer#toString
         * @return {String}
         */

      }, {
        key: "toString",
        value: function toString() {
          var components, hasPublicId, hasStyle, publicId, re, res, start, style, text, textSource;
          style = this.textStyleIdentifier();

          if (this.options.publicId != null) {
            publicId = this.getFullPublicId();
          }

          if (this.options.text != null) {
            hasPublicId = !isEmpty(publicId);
            hasStyle = !isEmpty(style);

            if (hasPublicId && hasStyle || !hasPublicId && !hasStyle) {
              throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay, but not both!";
            }

            re = /\$\([a-zA-Z]\w*\)/g;
            start = 0; //        textSource = text.replace(new RegExp("[,/]", 'g'), (c)-> "%#{c.charCodeAt(0).toString(16).toUpperCase()}")

            textSource = smartEscape(this.options.text, /[,\/]/g);
            text = "";

            while (res = re.exec(textSource)) {
              text += smartEscape(textSource.slice(start, res.index));
              text += res[0];
              start = res.index + res[0].length;
            }

            text += smartEscape(textSource.slice(start));
          }

          components = [this.options.resourceType, style, publicId, text];
          return compact_root_compact_default()(components).join(":");
        }
      }, {
        key: "textStyleIdentifier",
        value: function textStyleIdentifier() {
          var components;
          components = [];

          if (this.options.fontWeight !== "normal") {
            components.push(this.options.fontWeight);
          }

          if (this.options.fontStyle !== "normal") {
            components.push(this.options.fontStyle);
          }

          if (this.options.textDecoration !== "none") {
            components.push(this.options.textDecoration);
          }

          components.push(this.options.textAlign);

          if (this.options.stroke !== "none") {
            components.push(this.options.stroke);
          }

          if (!(isEmpty(this.options.letterSpacing) && !isNumberLike(this.options.letterSpacing))) {
            components.push("letter_spacing_" + this.options.letterSpacing);
          }

          if (!(isEmpty(this.options.lineSpacing) && !isNumberLike(this.options.lineSpacing))) {
            components.push("line_spacing_" + this.options.lineSpacing);
          }

          if (!isEmpty(this.options.fontAntialiasing)) {
            components.push("antialias_" + this.options.fontAntialiasing);
          }

          if (!isEmpty(this.options.fontHinting)) {
            components.push("hinting_" + this.options.fontHinting);
          }

          if (!isEmpty(compact_root_compact_default()(components))) {
            if (isEmpty(this.options.fontFamily)) {
              throw "Must supply fontFamily. ".concat(components);
            }

            if (isEmpty(this.options.fontSize) && !isNumberLike(this.options.fontSize)) {
              throw "Must supply fontSize.";
            }
          }

          components.unshift(this.options.fontFamily, this.options.fontSize);
          components = compact_root_compact_default()(components).join("_");
          return components;
        }
      }]);

      return TextLayer;
    }(layer_layer);
    /* harmony default export */ var textlayer = (textlayer_TextLayer);
    // CONCATENATED MODULE: ./src/layer/subtitleslayer.js
    function subtitleslayer_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { subtitleslayer_typeof = function _typeof(obj) { return typeof obj; }; } else { subtitleslayer_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return subtitleslayer_typeof(obj); }

    function subtitleslayer_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function subtitleslayer_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) subtitleslayer_setPrototypeOf(subClass, superClass); }

    function subtitleslayer_setPrototypeOf(o, p) { subtitleslayer_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return subtitleslayer_setPrototypeOf(o, p); }

    function subtitleslayer_createSuper(Derived) { var hasNativeReflectConstruct = subtitleslayer_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = subtitleslayer_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = subtitleslayer_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return subtitleslayer_possibleConstructorReturn(this, result); }; }

    function subtitleslayer_possibleConstructorReturn(self, call) { if (call && (subtitleslayer_typeof(call) === "object" || typeof call === "function")) { return call; } return subtitleslayer_assertThisInitialized(self); }

    function subtitleslayer_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function subtitleslayer_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function subtitleslayer_getPrototypeOf(o) { subtitleslayer_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return subtitleslayer_getPrototypeOf(o); }



    var SubtitlesLayer = /*#__PURE__*/function (_TextLayer) {
      subtitleslayer_inherits(SubtitlesLayer, _TextLayer);

      var _super = subtitleslayer_createSuper(SubtitlesLayer);

      /**
       * Represent a subtitles layer
       * @constructor SubtitlesLayer
       * @param {Object} options - layer parameters
       */
      function SubtitlesLayer(options) {
        var _this;

        subtitleslayer_classCallCheck(this, SubtitlesLayer);

        _this = _super.call(this, options);
        _this.options.resourceType = "subtitles";
        return _this;
      }

      return SubtitlesLayer;
    }(textlayer);

    /* harmony default export */ var subtitleslayer = (SubtitlesLayer);
    // CONCATENATED MODULE: ./src/layer/fetchlayer.js
    function fetchlayer_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { fetchlayer_typeof = function _typeof(obj) { return typeof obj; }; } else { fetchlayer_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return fetchlayer_typeof(obj); }

    function fetchlayer_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function fetchlayer_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function fetchlayer_createClass(Constructor, protoProps, staticProps) { if (protoProps) fetchlayer_defineProperties(Constructor.prototype, protoProps); if (staticProps) fetchlayer_defineProperties(Constructor, staticProps); return Constructor; }

    function fetchlayer_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) fetchlayer_setPrototypeOf(subClass, superClass); }

    function fetchlayer_setPrototypeOf(o, p) { fetchlayer_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return fetchlayer_setPrototypeOf(o, p); }

    function fetchlayer_createSuper(Derived) { var hasNativeReflectConstruct = fetchlayer_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = fetchlayer_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = fetchlayer_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return fetchlayer_possibleConstructorReturn(this, result); }; }

    function fetchlayer_possibleConstructorReturn(self, call) { if (call && (fetchlayer_typeof(call) === "object" || typeof call === "function")) { return call; } return fetchlayer_assertThisInitialized(self); }

    function fetchlayer_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function fetchlayer_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function fetchlayer_getPrototypeOf(o) { fetchlayer_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return fetchlayer_getPrototypeOf(o); }




    var fetchlayer_FetchLayer = /*#__PURE__*/function (_Layer) {
      fetchlayer_inherits(FetchLayer, _Layer);

      var _super = fetchlayer_createSuper(FetchLayer);

      /**
       * @class FetchLayer
       * @classdesc Creates an image layer using a remote URL.
       * @param {Object|string} options - layer parameters or a url
       * @param {string} options.url the url of the image to fetch
       */
      function FetchLayer(options) {
        var _this;

        fetchlayer_classCallCheck(this, FetchLayer);

        _this = _super.call(this, options);

        if (isString_root_isString_default()(options)) {
          _this.options.url = options;
        } else if (options != null ? options.url : void 0) {
          _this.options.url = options.url;
        }

        return _this;
      }

      fetchlayer_createClass(FetchLayer, [{
        key: "url",
        value: function url(_url) {
          this.options.url = _url;
          return this;
        }
        /**
         * generate the string representation of the layer
         * @function FetchLayer#toString
         * @return {String}
         */

      }, {
        key: "toString",
        value: function toString() {
          return "fetch:".concat(base64EncodeURL(this.options.url));
        }
      }]);

      return FetchLayer;
    }(layer_layer);

    /* harmony default export */ var fetchlayer = (fetchlayer_FetchLayer);
    // CONCATENATED MODULE: ./src/parameters.js
    function parameters_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { parameters_typeof = function _typeof(obj) { return typeof obj; }; } else { parameters_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return parameters_typeof(obj); }

    function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

    function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = parameters_getPrototypeOf(object); if (object === null) break; } return object; }

    function parameters_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) parameters_setPrototypeOf(subClass, superClass); }

    function parameters_setPrototypeOf(o, p) { parameters_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return parameters_setPrototypeOf(o, p); }

    function parameters_createSuper(Derived) { var hasNativeReflectConstruct = parameters_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = parameters_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = parameters_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return parameters_possibleConstructorReturn(this, result); }; }

    function parameters_possibleConstructorReturn(self, call) { if (call && (parameters_typeof(call) === "object" || typeof call === "function")) { return call; } return parameters_assertThisInitialized(self); }

    function parameters_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function parameters_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function parameters_getPrototypeOf(o) { parameters_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return parameters_getPrototypeOf(o); }

    function parameters_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function parameters_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function parameters_createClass(Constructor, protoProps, staticProps) { if (protoProps) parameters_defineProperties(Constructor.prototype, protoProps); if (staticProps) parameters_defineProperties(Constructor, staticProps); return Constructor; }








    /**
     * Transformation parameters
     * Depends on 'util', 'transformation'
     */

    var parameters_Param = /*#__PURE__*/function () {
      /**
       * Represents a single parameter.
       * @class Param
       * @param {string} name - The name of the parameter in snake_case
       * @param {string} shortName - The name of the serialized form of the parameter.
       *                         If a value is not provided, the parameter will not be serialized.
       * @param {function} [process=Util.identity ] - Manipulate origValue when value is called
       * @ignore
       */
      function Param(name, shortName) {
        var process = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity_root_identity_default.a;

        parameters_classCallCheck(this, Param);

        /**
         * The name of the parameter in snake_case
         * @member {string} Param#name
         */
        this.name = name;
        /**
         * The name of the serialized form of the parameter
         * @member {string} Param#shortName
         */

        this.shortName = shortName;
        /**
         * Manipulate origValue when value is called
         * @member {function} Param#process
         */

        this.process = process;
      }
      /**
       * Set a (unprocessed) value for this parameter
       * @function Param#set
       * @param {*} origValue - the value of the parameter
       * @return {Param} self for chaining
       */


      parameters_createClass(Param, [{
        key: "set",
        value: function set(origValue) {
          this.origValue = origValue;
          return this;
        }
        /**
         * Generate the serialized form of the parameter
         * @function Param#serialize
         * @return {string} the serialized form of the parameter
         */

      }, {
        key: "serialize",
        value: function serialize() {
          var val, valid;
          val = this.value();
          valid = isArray_root_isArray_default()(val) || isPlainObject_root_isPlainObject_default()(val) || isString_root_isString_default()(val) ? !isEmpty(val) : val != null;

          if (this.shortName != null && valid) {
            return "".concat(this.shortName, "_").concat(val);
          } else {
            return '';
          }
        }
        /**
         * Return the processed value of the parameter
         * @function Param#value
         */

      }, {
        key: "value",
        value: function value() {
          return this.process(this.origValue);
        }
      }], [{
        key: "norm_color",
        value: function norm_color(value) {
          return value != null ? value.replace(/^#/, 'rgb:') : void 0;
        }
      }, {
        key: "build_array",
        value: function build_array(arg) {
          if (arg == null) {
            return [];
          } else if (isArray_root_isArray_default()(arg)) {
            return arg;
          } else {
            return [arg];
          }
        }
        /**
        * Covert value to video codec string.
        *
        * If the parameter is an object,
        * @param {(string|Object)} param - the video codec as either a String or a Hash
        * @return {string} the video codec string in the format codec:profile:level
        * @example
        * vc_[ :profile : [level]]
        * or
          { codec: 'h264', profile: 'basic', level: '3.1' }
        * @ignore
         */

      }, {
        key: "process_video_params",
        value: function process_video_params(param) {
          var video;

          switch (param.constructor) {
            case Object:
              video = "";

              if ('codec' in param) {
                video = param.codec;

                if ('profile' in param) {
                  video += ":" + param.profile;

                  if ('level' in param) {
                    video += ":" + param.level;
                  }
                }
              }

              return video;

            case String:
              return param;

            default:
              return null;
          }
        }
      }]);

      return Param;
    }();

    var parameters_ArrayParam = /*#__PURE__*/function (_Param) {
      parameters_inherits(ArrayParam, _Param);

      var _super = parameters_createSuper(ArrayParam);

      /**
       * A parameter that represents an array.
       * @param {string} name - The name of the parameter in snake_case.
       * @param {string} shortName - The name of the serialized form of the parameter
       *                         If a value is not provided, the parameter will not be serialized.
       * @param {string} [sep='.'] - The separator to use when joining the array elements together
       * @param {function} [process=Util.identity ] - Manipulate origValue when value is called
       * @class ArrayParam
       * @extends Param
       * @ignore
       */
      function ArrayParam(name, shortName) {
        var _this;

        var sep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.';
        var process = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        parameters_classCallCheck(this, ArrayParam);

        _this = _super.call(this, name, shortName, process);
        _this.sep = sep;
        return _this;
      }

      parameters_createClass(ArrayParam, [{
        key: "serialize",
        value: function serialize() {
          if (this.shortName != null) {
            var arrayValue = this.value();

            if (isEmpty(arrayValue)) {
              return '';
            } else if (isString_root_isString_default()(arrayValue)) {
              return "".concat(this.shortName, "_").concat(arrayValue);
            } else {
              var flat = arrayValue.map(function (t) {
                return isFunction_root_isFunction_default()(t.serialize) ? t.serialize() : t;
              }).join(this.sep);
              return "".concat(this.shortName, "_").concat(flat);
            }
          } else {
            return '';
          }
        }
      }, {
        key: "value",
        value: function value() {
          var _this2 = this;

          if (isArray_root_isArray_default()(this.origValue)) {
            return this.origValue.map(function (v) {
              return _this2.process(v);
            });
          } else {
            return this.process(this.origValue);
          }
        }
      }, {
        key: "set",
        value: function set(origValue) {
          if (origValue == null || isArray_root_isArray_default()(origValue)) {
            return _get(parameters_getPrototypeOf(ArrayParam.prototype), "set", this).call(this, origValue);
          } else {
            return _get(parameters_getPrototypeOf(ArrayParam.prototype), "set", this).call(this, [origValue]);
          }
        }
      }]);

      return ArrayParam;
    }(parameters_Param);

    var parameters_TransformationParam = /*#__PURE__*/function (_Param2) {
      parameters_inherits(TransformationParam, _Param2);

      var _super2 = parameters_createSuper(TransformationParam);

      /**
       * A parameter that represents a transformation
       * @param {string} name - The name of the parameter in snake_case
       * @param {string} [shortName='t'] - The name of the serialized form of the parameter
       * @param {string} [sep='.'] - The separator to use when joining the array elements together
       * @param {function} [process=Util.identity ] - Manipulate origValue when value is called
       * @class TransformationParam
       * @extends Param
       * @ignore
       */
      function TransformationParam(name) {
        var _this3;

        var shortName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "t";
        var sep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.';
        var process = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        parameters_classCallCheck(this, TransformationParam);

        _this3 = _super2.call(this, name, shortName, process);
        _this3.sep = sep;
        return _this3;
      }
      /**
       * Generate string representations of the transformation.
       * @returns {*} Returns either the transformation as a string, or an array of string representations.
       */


      parameters_createClass(TransformationParam, [{
        key: "serialize",
        value: function serialize() {
          var _this4 = this;

          var result = '';
          var val = this.value();

          if (isEmpty(val)) {
            return result;
          } // val is an array of strings so join them


          if (baseutil_allStrings(val)) {
            var joined = val.join(this.sep); // creates t1.t2.t3 in case multiple named transformations were configured

            if (!isEmpty(joined)) {
              // in case options.transformation was not set with an empty string (val != ['']);
              result = "".concat(this.shortName, "_").concat(joined);
            }
          } else {
            // Convert val to an array of strings
            result = val.map(function (t) {
              if (isString_root_isString_default()(t) && !isEmpty(t)) {
                return "".concat(_this4.shortName, "_").concat(t);
              }

              if (isFunction_root_isFunction_default()(t.serialize)) {
                return t.serialize();
              }

              if (isPlainObject_root_isPlainObject_default()(t) && !isEmpty(t)) {
                return new src_transformation(t).serialize();
              }

              return undefined;
            }).filter(function (t) {
              return t;
            });
          }

          return result;
        }
      }, {
        key: "set",
        value: function set(origValue1) {
          this.origValue = origValue1;

          if (isArray_root_isArray_default()(this.origValue)) {
            return _get(parameters_getPrototypeOf(TransformationParam.prototype), "set", this).call(this, this.origValue);
          } else {
            return _get(parameters_getPrototypeOf(TransformationParam.prototype), "set", this).call(this, [this.origValue]);
          }
        }
      }]);

      return TransformationParam;
    }(parameters_Param);

    var number_pattern = "([0-9]*)\\.([0-9]+)|([0-9]+)";
    var offset_any_pattern = "(" + number_pattern + ")([%pP])?";

    var RangeParam = /*#__PURE__*/function (_Param3) {
      parameters_inherits(RangeParam, _Param3);

      var _super3 = parameters_createSuper(RangeParam);

      /**
       * A parameter that represents a range
       * @param {string} name - The name of the parameter in snake_case
       * @param {string} shortName - The name of the serialized form of the parameter
       *                         If a value is not provided, the parameter will not be serialized.
       * @param {function} [process=norm_range_value ] - Manipulate origValue when value is called
       * @class RangeParam
       * @extends Param
       * @ignore
       */
      function RangeParam(name, shortName) {
        var process = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : RangeParam.norm_range_value;

        parameters_classCallCheck(this, RangeParam);

        return _super3.call(this, name, shortName, process);
      }

      parameters_createClass(RangeParam, null, [{
        key: "norm_range_value",
        value: function norm_range_value(value) {
          var offset = String(value).match(new RegExp('^' + offset_any_pattern + '$'));

          if (offset) {
            var modifier = offset[5] != null ? 'p' : '';
            value = (offset[1] || offset[4]) + modifier;
          }

          return value;
        }
      }]);

      return RangeParam;
    }(parameters_Param);

    var parameters_RawParam = /*#__PURE__*/function (_Param4) {
      parameters_inherits(RawParam, _Param4);

      var _super4 = parameters_createSuper(RawParam);

      function RawParam(name, shortName) {
        var process = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity_root_identity_default.a;

        parameters_classCallCheck(this, RawParam);

        return _super4.call(this, name, shortName, process);
      }

      parameters_createClass(RawParam, [{
        key: "serialize",
        value: function serialize() {
          return this.value();
        }
      }]);

      return RawParam;
    }(parameters_Param);

    var parameters_LayerParam = /*#__PURE__*/function (_Param5) {
      parameters_inherits(LayerParam, _Param5);

      var _super5 = parameters_createSuper(LayerParam);

      function LayerParam() {
        parameters_classCallCheck(this, LayerParam);

        return _super5.apply(this, arguments);
      }

      parameters_createClass(LayerParam, [{
        key: "value",
        // Parse layer options
        // @return [string] layer transformation string
        // @private
        value: function value() {
          if (this.origValue == null) {
            return '';
          }

          var result;

          if (this.origValue instanceof layer_layer) {
            result = this.origValue;
          } else if (isPlainObject_root_isPlainObject_default()(this.origValue)) {
            var layerOptions = withCamelCaseKeys(this.origValue);

            if (layerOptions.resourceType === "text" || layerOptions.text != null) {
              result = new textlayer(layerOptions);
            } else if (layerOptions.resourceType === "subtitles") {
              result = new subtitleslayer(layerOptions);
            } else if (layerOptions.resourceType === "fetch" || layerOptions.url != null) {
              result = new fetchlayer(layerOptions);
            } else {
              result = new layer_layer(layerOptions);
            }
          } else if (isString_root_isString_default()(this.origValue)) {
            if (/^fetch:.+/.test(this.origValue)) {
              result = new fetchlayer(this.origValue.substr(6));
            } else {
              result = this.origValue;
            }
          } else {
            result = '';
          }

          return result.toString();
        }
      }], [{
        key: "textStyle",
        value: function textStyle(layer) {
          return new textlayer(layer).textStyleIdentifier();
        }
      }]);

      return LayerParam;
    }(parameters_Param);


    // CONCATENATED MODULE: ./src/transformation.js
    function transformation_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { transformation_typeof = function _typeof(obj) { return typeof obj; }; } else { transformation_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return transformation_typeof(obj); }

    function transformation_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) transformation_setPrototypeOf(subClass, superClass); }

    function transformation_setPrototypeOf(o, p) { transformation_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return transformation_setPrototypeOf(o, p); }

    function transformation_createSuper(Derived) { var hasNativeReflectConstruct = transformation_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = transformation_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = transformation_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return transformation_possibleConstructorReturn(this, result); }; }

    function transformation_possibleConstructorReturn(self, call) { if (call && (transformation_typeof(call) === "object" || typeof call === "function")) { return call; } return transformation_assertThisInitialized(self); }

    function transformation_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function transformation_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function transformation_getPrototypeOf(o) { transformation_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return transformation_getPrototypeOf(o); }

    function transformation_slicedToArray(arr, i) { return transformation_arrayWithHoles(arr) || transformation_iterableToArrayLimit(arr, i) || transformation_unsupportedIterableToArray(arr, i) || transformation_nonIterableRest(); }

    function transformation_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function transformation_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return transformation_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return transformation_arrayLikeToArray(o, minLen); }

    function transformation_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function transformation_iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function transformation_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

    function transformation_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function transformation_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function transformation_createClass(Constructor, protoProps, staticProps) { if (protoProps) transformation_defineProperties(Constructor.prototype, protoProps); if (staticProps) transformation_defineProperties(Constructor, staticProps); return Constructor; }







    /**
     * Assign key, value to target, when value is not null.<br>
     *   This function mutates the target!
     * @param {object} target the object to assign the values to
     * @param {object} sources one or more objects to get values from
     * @returns {object} the target after the assignment
     */

    function assignNotNull(target) {
      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      sources.forEach(function (source) {
        Object.keys(source).forEach(function (key) {
          if (source[key] != null) {
            target[key] = source[key];
          }
        });
      });
      return target;
    }
    /**
     * TransformationBase
     * Depends on 'configuration', 'parameters','util'
     * @internal
     */


    var transformation_TransformationBase = /*#__PURE__*/function () {
      /**
       * The base class for transformations.
       * Members of this class are documented as belonging to the {@link Transformation} class for convenience.
       * @class TransformationBase
       */
      function TransformationBase(options) {
        transformation_classCallCheck(this, TransformationBase);

        /** @private */

        /** @private */
        var parent, trans;
        parent = void 0;
        trans = {};
        /**
         * Return an options object that can be used to create an identical Transformation
         * @function Transformation#toOptions
         * @return {Object} Returns a plain object representing this transformation
         */

        this.toOptions = function (withChain) {
          var opt = {};

          if (withChain == null) {
            withChain = true;
          }

          Object.keys(trans).forEach(function (key) {
            return opt[key] = trans[key].origValue;
          });
          assignNotNull(opt, this.otherOptions);

          if (withChain && !isEmpty(this.chained)) {
            var list = this.chained.map(function (tr) {
              return tr.toOptions();
            });
            list.push(opt);
            opt = {};
            assignNotNull(opt, this.otherOptions);
            opt.transformation = list;
          }

          return opt;
        };
        /**
         * Set a parent for this object for chaining purposes.
         *
         * @function Transformation#setParent
         * @param {Object} object - the parent to be assigned to
         * @returns {Transformation} Returns this instance for chaining purposes.
         */


        this.setParent = function (object) {
          parent = object;

          if (object != null) {
            this.fromOptions(typeof object.toOptions === "function" ? object.toOptions() : void 0);
          }

          return this;
        };
        /**
         * Returns the parent of this object in the chain
         * @function Transformation#getParent
         * @protected
         * @return {Object} Returns the parent of this object if there is any
         */


        this.getParent = function () {
          return parent;
        }; // Helper methods to create parameter methods
        // These methods are defined here because they access `trans` which is
        // a private member of `TransformationBase`

        /** @protected */


        this.param = function (value, name, abbr, defaultValue, process) {
          if (process == null) {
            if (isFunction_root_isFunction_default()(defaultValue)) {
              process = defaultValue;
            } else {
              process = identity_root_identity_default.a;
            }
          }

          trans[name] = new parameters_Param(name, abbr, process).set(value);
          return this;
        };
        /** @protected */


        this.rawParam = function (value, name, abbr, defaultValue, process) {
          process = lastArgCallback(arguments);
          trans[name] = new parameters_RawParam(name, abbr, process).set(value);
          return this;
        };
        /** @protected */


        this.rangeParam = function (value, name, abbr, defaultValue, process) {
          process = lastArgCallback(arguments);
          trans[name] = new RangeParam(name, abbr, process).set(value);
          return this;
        };
        /** @protected */


        this.arrayParam = function (value, name, abbr) {
          var sep = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ":";
          var process = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
          process = lastArgCallback(arguments);
          trans[name] = new parameters_ArrayParam(name, abbr, sep, process).set(value);
          return this;
        };
        /** @protected */


        this.transformationParam = function (value, name, abbr) {
          var sep = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ".";
          var process = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
          process = lastArgCallback(arguments);
          trans[name] = new parameters_TransformationParam(name, abbr, sep, process).set(value);
          return this;
        };

        this.layerParam = function (value, name, abbr) {
          trans[name] = new parameters_LayerParam(name, abbr).set(value);
          return this;
        }; // End Helper methods

        /**
         * Get the value associated with the given name.
         * @function Transformation#getValue
         * @param {string} name - the name of the parameter
         * @return {*} the processed value associated with the given name
         * @description Use {@link get}.origValue for the value originally provided for the parameter
         */


        this.getValue = function (name) {
          var value = trans[name] && trans[name].value();
          return value != null ? value : this.otherOptions[name];
        };
        /**
         * Get the parameter object for the given parameter name
         * @function Transformation#get
         * @param {string} name the name of the transformation parameter
         * @returns {Param} the param object for the given name, or undefined
         */


        this.get = function (name) {
          return trans[name];
        };
        /**
         * Remove a transformation option from the transformation.
         * @function Transformation#remove
         * @param {string} name - the name of the option to remove
         * @return {*} Returns the option that was removed or null if no option by that name was found. The type of the
         *              returned value depends on the value.
         */


        this.remove = function (name) {
          var temp;

          switch (false) {
            case trans[name] == null:
              temp = trans[name];
              delete trans[name];
              return temp.origValue;

            case this.otherOptions[name] == null:
              temp = this.otherOptions[name];
              delete this.otherOptions[name];
              return temp;

            default:
              return null;
          }
        };
        /**
         * Return an array of all the keys (option names) in the transformation.
         * @return {Array<string>} the keys in snakeCase format
         */


        this.keys = function () {
          var key;
          return function () {
            var results;
            results = [];

            for (key in trans) {
              if (key != null) {
                results.push(key.match(VAR_NAME_RE) ? key : snakeCase(key));
              }
            }

            return results;
          }().sort();
        };
        /**
         * Returns a plain object representation of the transformation. Values are processed.
         * @function Transformation#toPlainObject
         * @return {Object} the transformation options as plain object
         */


        this.toPlainObject = function () {
          var hash, key, list;
          hash = {};

          for (key in trans) {
            hash[key] = trans[key].value();

            if (isPlainObject_root_isPlainObject_default()(hash[key])) {
              hash[key] = cloneDeep_root_cloneDeep_default()(hash[key]);
            }
          }

          if (!isEmpty(this.chained)) {
            list = this.chained.map(function (tr) {
              return tr.toPlainObject();
            });
            list.push(hash);
            hash = {
              transformation: list
            };
          }

          return hash;
        };
        /**
         * Complete the current transformation and chain to a new one.
         * In the URL, transformations are chained together by slashes.
         * @function Transformation#chain
         * @return {Transformation} Returns this transformation for chaining
         * @example
         * var tr = cloudinary.Transformation.new();
         * tr.width(10).crop('fit').chain().angle(15).serialize()
         * // produces "c_fit,w_10/a_15"
         */


        this.chain = function () {
          var names, tr;
          names = Object.getOwnPropertyNames(trans);

          if (names.length !== 0) {
            tr = new this.constructor(this.toOptions(false));
            this.resetTransformations();
            this.chained.push(tr);
          }

          return this;
        };

        this.resetTransformations = function () {
          trans = {};
          return this;
        };

        this.otherOptions = {};
        this.chained = [];
        this.fromOptions(options);
      }
      /**
       * Merge the provided options with own's options
       * @param {Object} [options={}] key-value list of options
       * @returns {Transformation} Returns this instance for chaining
       */


      transformation_createClass(TransformationBase, [{
        key: "fromOptions",
        value: function fromOptions() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          if (options instanceof TransformationBase) {
            this.fromTransformation(options);
          } else {
            if (isString_root_isString_default()(options) || isArray_root_isArray_default()(options)) {
              options = {
                transformation: options
              };
            }

            options = cloneDeep_root_cloneDeep_default()(options, function (value) {
              if (value instanceof TransformationBase || value instanceof Layer) {
                return new value.clone();
              }
            }); // Handling of "if" statements precedes other options as it creates a chained transformation

            if (options["if"]) {
              this.set("if", options["if"]);
              delete options["if"];
            }

            for (var key in options) {
              var opt = options[key];

              if (opt != null) {
                if (key.match(VAR_NAME_RE)) {
                  if (key !== '$attr') {
                    this.set('variable', key, opt);
                  }
                } else {
                  this.set(key, opt);
                }
              }
            }
          }

          return this;
        }
      }, {
        key: "fromTransformation",
        value: function fromTransformation(other) {
          var _this = this;

          if (other instanceof TransformationBase) {
            other.keys().forEach(function (key) {
              return _this.set(key, other.get(key).origValue);
            });
          }

          return this;
        }
        /**
         * Set a parameter.
         * The parameter name `key` is converted to
         * @param {string} key - the name of the parameter
         * @param {*} values - the value of the parameter
         * @returns {Transformation} Returns this instance for chaining
         */

      }, {
        key: "set",
        value: function set(key) {
          var camelKey;
          camelKey = camelCase(key);

          for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            values[_key2 - 1] = arguments[_key2];
          }

          if (includes_root_includes_default()(transformation_Transformation.methods, camelKey)) {
            this[camelKey].apply(this, values);
          } else {
            this.otherOptions[key] = values[0];
          }

          return this;
        }
      }, {
        key: "hasLayer",
        value: function hasLayer() {
          return this.getValue("overlay") || this.getValue("underlay");
        }
        /**
         * Generate a string representation of the transformation.
         * @function Transformation#serialize
         * @return {string} Returns the transformation as a string
         */

      }, {
        key: "serialize",
        value: function serialize() {
          var ifParam, j, len, paramList, ref, ref1, ref2, ref3, ref4, resultArray, t, transformationList, transformationString, transformations, value, variables, vars;
          resultArray = this.chained.map(function (tr) {
            return tr.serialize();
          });
          paramList = this.keys();
          transformations = (ref = this.get("transformation")) != null ? ref.serialize() : void 0;
          ifParam = (ref1 = this.get("if")) != null ? ref1.serialize() : void 0;
          variables = processVar((ref2 = this.get("variables")) != null ? ref2.value() : void 0);
          paramList = difference_root_difference_default()(paramList, ["transformation", "if", "variables"]);
          vars = [];
          transformationList = [];

          for (j = 0, len = paramList.length; j < len; j++) {
            t = paramList[j];

            if (t.match(VAR_NAME_RE)) {
              vars.push(t + "_" + expression.normalize((ref3 = this.get(t)) != null ? ref3.value() : void 0));
            } else {
              transformationList.push((ref4 = this.get(t)) != null ? ref4.serialize() : void 0);
            }
          }

          switch (false) {
            case !isString_root_isString_default()(transformations):
              transformationList.push(transformations);
              break;

            case !isArray_root_isArray_default()(transformations):
              resultArray = resultArray.concat(transformations);
          }

          transformationList = function () {
            var k, len1, results;
            results = [];

            for (k = 0, len1 = transformationList.length; k < len1; k++) {
              value = transformationList[k];

              if (isArray_root_isArray_default()(value) && !isEmpty(value) || !isArray_root_isArray_default()(value) && value) {
                results.push(value);
              }
            }

            return results;
          }();

          transformationList = vars.sort().concat(variables).concat(transformationList.sort());

          if (ifParam === "if_end") {
            transformationList.push(ifParam);
          } else if (!isEmpty(ifParam)) {
            transformationList.unshift(ifParam);
          }

          transformationString = compact_root_compact_default()(transformationList).join(this.param_separator);

          if (!isEmpty(transformationString)) {
            resultArray.push(transformationString);
          }

          return compact_root_compact_default()(resultArray).join(this.trans_separator);
        }
        /**
         * Provide a list of all the valid transformation option names
         * @function Transformation#listNames
         * @private
         * @return {Array<string>} a array of all the valid option names
         */

      }, {
        key: "toHtmlAttributes",

        /**
         * Returns the attributes for an HTML tag.
         * @function Cloudinary.toHtmlAttributes
         * @return PlainObject
         */
        value: function toHtmlAttributes() {
          var _this2 = this;

          var attrName, height, options, ref2, ref3, value, width;
          options = {};
          var snakeCaseKey;
          Object.keys(this.otherOptions).forEach(function (key) {
            value = _this2.otherOptions[key];
            snakeCaseKey = snakeCase(key);

            if (!includes_root_includes_default()(transformation_Transformation.PARAM_NAMES, snakeCaseKey) && !includes_root_includes_default()(URL_KEYS, snakeCaseKey)) {
              attrName = /^html_/.test(key) ? key.slice(5) : key;
              options[attrName] = value;
            }
          }); // convert all "html_key" to "key" with the same value

          this.keys().forEach(function (key) {
            if (/^html_/.test(key)) {
              options[camelCase(key.slice(5))] = _this2.getValue(key);
            }
          });

          if (!(this.hasLayer() || this.getValue("angle") || includes_root_includes_default()(["fit", "limit", "lfill"], this.getValue("crop")))) {
            width = (ref2 = this.get("width")) != null ? ref2.origValue : void 0;
            height = (ref3 = this.get("height")) != null ? ref3.origValue : void 0;

            if (parseFloat(width) >= 1.0) {
              if (options.width == null) {
                options.width = width;
              }
            }

            if (parseFloat(height) >= 1.0) {
              if (options.height == null) {
                options.height = height;
              }
            }
          }

          return options;
        }
      }, {
        key: "toHtml",

        /**
         * Delegate to the parent (up the call chain) to produce HTML
         * @function Transformation#toHtml
         * @return {string} HTML representation of the parent if possible.
         * @example
         * tag = cloudinary.ImageTag.new("sample", {cloud_name: "demo"})
         * // ImageTag {name: "img", publicId: "sample"}
         * tag.toHtml()
         * // <img src="http://res.cloudinary.com/demo/image/upload/sample">
         * tag.transformation().crop("fit").width(300).toHtml()
         * // <img src="http://res.cloudinary.com/demo/image/upload/c_fit,w_300/sample">
         */
        value: function toHtml() {
          var ref;
          return (ref = this.getParent()) != null ? typeof ref.toHtml === "function" ? ref.toHtml() : void 0 : void 0;
        }
      }, {
        key: "toString",
        value: function toString() {
          return this.serialize();
        }
      }, {
        key: "clone",
        value: function clone() {
          return new this.constructor(this.toOptions(true));
        }
      }], [{
        key: "listNames",
        value: function listNames() {
          return transformation_Transformation.methods;
        }
      }, {
        key: "isValidParamName",
        value: function isValidParamName(name) {
          return transformation_Transformation.methods.indexOf(camelCase(name)) >= 0;
        }
      }]);

      return TransformationBase;
    }();

    var VAR_NAME_RE = /^\$[a-zA-Z0-9]+$/;
    transformation_TransformationBase.prototype.trans_separator = '/';
    transformation_TransformationBase.prototype.param_separator = ',';

    function lastArgCallback(args) {
      var callback;
      callback = args != null ? args[args.length - 1] : void 0;

      if (isFunction_root_isFunction_default()(callback)) {
        return callback;
      } else {
        return void 0;
      }
    }

    function processVar(varArray) {
      var j, len, name, results, v;

      if (isArray_root_isArray_default()(varArray)) {
        results = [];

        for (j = 0, len = varArray.length; j < len; j++) {
          var _varArray$j = transformation_slicedToArray(varArray[j], 2);

          name = _varArray$j[0];
          v = _varArray$j[1];
          results.push("".concat(name, "_").concat(expression.normalize(v)));
        }

        return results;
      } else {
        return varArray;
      }
    }

    function processCustomFunction(_ref) {
      var function_type = _ref.function_type,
          source = _ref.source;

      if (function_type === 'remote') {
        return [function_type, btoa(source)].join(":");
      } else if (function_type === 'wasm') {
        return [function_type, source].join(":");
      }
    }
    /**
     * Transformation Class methods.
     * This is a list of the parameters defined in Transformation.
     * Values are camelCased.
     * @const Transformation.methods
     * @private
     * @ignore
     * @type {Array<string>}
     */

    /**
     * Parameters that are filtered out before passing the options to an HTML tag.
     *
     * The list of parameters is a combination of `Transformation::methods` and `Configuration::CONFIG_PARAMS`
     * @const {Array<string>} Transformation.PARAM_NAMES
     * @private
     * @ignore
     * @see toHtmlAttributes
     */


    var transformation_Transformation = /*#__PURE__*/function (_TransformationBase) {
      transformation_inherits(Transformation, _TransformationBase);

      var _super = transformation_createSuper(Transformation);

      /**
       * Represents a single transformation.
       * @class Transformation
       * @example
       * t = new cloudinary.Transformation();
       * t.angle(20).crop("scale").width("auto");
       *
       * // or
       *
       * t = new cloudinary.Transformation( {angle: 20, crop: "scale", width: "auto"});
       * @see <a href="https://cloudinary.com/documentation/image_transformation_reference"
       *  target="_blank">Available image transformations</a>
       * @see <a href="https://cloudinary.com/documentation/video_transformation_reference"
       *  target="_blank">Available video transformations</a>
       */
      function Transformation(options) {
        transformation_classCallCheck(this, Transformation);

        return _super.call(this, options);
      }
      /**
       * Convenience constructor
       * @param {Object} options
       * @return {Transformation}
       * @example cl = cloudinary.Transformation.new( {angle: 20, crop: "scale", width: "auto"})
       */


      transformation_createClass(Transformation, [{
        key: "angle",

        /*
          Transformation Parameters
        */
        value: function angle(value) {
          return this.arrayParam(value, "angle", "a", ".", expression.normalize);
        }
      }, {
        key: "audioCodec",
        value: function audioCodec(value) {
          return this.param(value, "audio_codec", "ac");
        }
      }, {
        key: "audioFrequency",
        value: function audioFrequency(value) {
          return this.param(value, "audio_frequency", "af");
        }
      }, {
        key: "aspectRatio",
        value: function aspectRatio(value) {
          return this.param(value, "aspect_ratio", "ar", expression.normalize);
        }
      }, {
        key: "background",
        value: function background(value) {
          return this.param(value, "background", "b", parameters_Param.norm_color);
        }
      }, {
        key: "bitRate",
        value: function bitRate(value) {
          return this.param(value, "bit_rate", "br");
        }
      }, {
        key: "border",
        value: function border(value) {
          return this.param(value, "border", "bo", function (border) {
            if (isPlainObject_root_isPlainObject_default()(border)) {
              border = assign_root_assign_default()({}, {
                color: "black",
                width: 2
              }, border);
              return "".concat(border.width, "px_solid_").concat(parameters_Param.norm_color(border.color));
            } else {
              return border;
            }
          });
        }
      }, {
        key: "color",
        value: function color(value) {
          return this.param(value, "color", "co", parameters_Param.norm_color);
        }
      }, {
        key: "colorSpace",
        value: function colorSpace(value) {
          return this.param(value, "color_space", "cs");
        }
      }, {
        key: "crop",
        value: function crop(value) {
          return this.param(value, "crop", "c");
        }
      }, {
        key: "customFunction",
        value: function customFunction(value) {
          return this.param(value, "custom_function", "fn", function () {
            return processCustomFunction(value);
          });
        }
      }, {
        key: "customPreFunction",
        value: function customPreFunction(value) {
          if (this.get('custom_function')) {
            return;
          }

          return this.rawParam(value, "custom_function", "", function () {
            value = processCustomFunction(value);
            return value ? "fn_pre:".concat(value) : value;
          });
        }
      }, {
        key: "defaultImage",
        value: function defaultImage(value) {
          return this.param(value, "default_image", "d");
        }
      }, {
        key: "delay",
        value: function delay(value) {
          return this.param(value, "delay", "dl");
        }
      }, {
        key: "density",
        value: function density(value) {
          return this.param(value, "density", "dn");
        }
      }, {
        key: "duration",
        value: function duration(value) {
          return this.rangeParam(value, "duration", "du");
        }
      }, {
        key: "dpr",
        value: function dpr(value) {
          return this.param(value, "dpr", "dpr", function (dpr) {
            dpr = dpr.toString();

            if (dpr != null ? dpr.match(/^\d+$/) : void 0) {
              return dpr + ".0";
            } else {
              return expression.normalize(dpr);
            }
          });
        }
      }, {
        key: "effect",
        value: function effect(value) {
          return this.arrayParam(value, "effect", "e", ":", expression.normalize);
        }
      }, {
        key: "else",
        value: function _else() {
          return this["if"]('else');
        }
      }, {
        key: "endIf",
        value: function endIf() {
          return this["if"]('end');
        }
      }, {
        key: "endOffset",
        value: function endOffset(value) {
          return this.rangeParam(value, "end_offset", "eo");
        }
      }, {
        key: "fallbackContent",
        value: function fallbackContent(value) {
          return this.param(value, "fallback_content");
        }
      }, {
        key: "fetchFormat",
        value: function fetchFormat(value) {
          return this.param(value, "fetch_format", "f");
        }
      }, {
        key: "format",
        value: function format(value) {
          return this.param(value, "format");
        }
      }, {
        key: "flags",
        value: function flags(value) {
          return this.arrayParam(value, "flags", "fl", ".");
        }
      }, {
        key: "gravity",
        value: function gravity(value) {
          return this.param(value, "gravity", "g");
        }
      }, {
        key: "fps",
        value: function fps(value) {
          return this.param(value, "fps", "fps", function (fps) {
            if (isString_root_isString_default()(fps)) {
              return fps;
            } else if (isArray_root_isArray_default()(fps)) {
              return fps.join("-");
            } else {
              return fps;
            }
          });
        }
      }, {
        key: "height",
        value: function height(value) {
          var _this3 = this;

          return this.param(value, "height", "h", function () {
            if (_this3.getValue("crop") || _this3.getValue("overlay") || _this3.getValue("underlay")) {
              return expression.normalize(value);
            } else {
              return null;
            }
          });
        }
      }, {
        key: "htmlHeight",
        value: function htmlHeight(value) {
          return this.param(value, "html_height");
        }
      }, {
        key: "htmlWidth",
        value: function htmlWidth(value) {
          return this.param(value, "html_width");
        }
      }, {
        key: "if",
        value: function _if() {
          var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
          var i, ifVal, j, ref, trIf, trRest;

          switch (value) {
            case "else":
              this.chain();
              return this.param(value, "if", "if");

            case "end":
              this.chain();

              for (i = j = ref = this.chained.length - 1; j >= 0; i = j += -1) {
                ifVal = this.chained[i].getValue("if");

                if (ifVal === "end") {
                  break;
                } else if (ifVal != null) {
                  trIf = Transformation["new"]()["if"](ifVal);
                  this.chained[i].remove("if");
                  trRest = this.chained[i];
                  this.chained[i] = Transformation["new"]().transformation([trIf, trRest]);

                  if (ifVal !== "else") {
                    break;
                  }
                }
              }

              return this.param(value, "if", "if");

            case "":
              return condition["new"]().setParent(this);

            default:
              return this.param(value, "if", "if", function (value) {
                return condition["new"](value).toString();
              });
          }
        }
      }, {
        key: "keyframeInterval",
        value: function keyframeInterval(value) {
          return this.param(value, "keyframe_interval", "ki");
        }
      }, {
        key: "ocr",
        value: function ocr(value) {
          return this.param(value, "ocr", "ocr");
        }
      }, {
        key: "offset",
        value: function offset(value) {
          var end_o, start_o;

          var _ref2 = isFunction_root_isFunction_default()(value != null ? value.split : void 0) ? value.split('..') : isArray_root_isArray_default()(value) ? value : [null, null];

          var _ref3 = transformation_slicedToArray(_ref2, 2);

          start_o = _ref3[0];
          end_o = _ref3[1];

          if (start_o != null) {
            this.startOffset(start_o);
          }

          if (end_o != null) {
            return this.endOffset(end_o);
          }
        }
      }, {
        key: "opacity",
        value: function opacity(value) {
          return this.param(value, "opacity", "o", expression.normalize);
        }
      }, {
        key: "overlay",
        value: function overlay(value) {
          return this.layerParam(value, "overlay", "l");
        }
      }, {
        key: "page",
        value: function page(value) {
          return this.param(value, "page", "pg");
        }
      }, {
        key: "poster",
        value: function poster(value) {
          return this.param(value, "poster");
        }
      }, {
        key: "prefix",
        value: function prefix(value) {
          return this.param(value, "prefix", "p");
        }
      }, {
        key: "quality",
        value: function quality(value) {
          return this.param(value, "quality", "q", expression.normalize);
        }
      }, {
        key: "radius",
        value: function radius(value) {
          return this.arrayParam(value, "radius", "r", ":", expression.normalize);
        }
      }, {
        key: "rawTransformation",
        value: function rawTransformation(value) {
          return this.rawParam(value, "raw_transformation");
        }
      }, {
        key: "size",
        value: function size(value) {
          var height, width;

          if (isFunction_root_isFunction_default()(value != null ? value.split : void 0)) {
            var _value$split = value.split('x');

            var _value$split2 = transformation_slicedToArray(_value$split, 2);

            width = _value$split2[0];
            height = _value$split2[1];
            this.width(width);
            return this.height(height);
          }
        }
      }, {
        key: "sourceTypes",
        value: function sourceTypes(value) {
          return this.param(value, "source_types");
        }
      }, {
        key: "sourceTransformation",
        value: function sourceTransformation(value) {
          return this.param(value, "source_transformation");
        }
      }, {
        key: "startOffset",
        value: function startOffset(value) {
          return this.rangeParam(value, "start_offset", "so");
        }
      }, {
        key: "streamingProfile",
        value: function streamingProfile(value) {
          return this.param(value, "streaming_profile", "sp");
        }
      }, {
        key: "transformation",
        value: function transformation(value) {
          return this.transformationParam(value, "transformation", "t");
        }
      }, {
        key: "underlay",
        value: function underlay(value) {
          return this.layerParam(value, "underlay", "u");
        }
      }, {
        key: "variable",
        value: function variable(name, value) {
          return this.param(value, name, name);
        }
      }, {
        key: "variables",
        value: function variables(values) {
          return this.arrayParam(values, "variables");
        }
      }, {
        key: "videoCodec",
        value: function videoCodec(value) {
          return this.param(value, "video_codec", "vc", parameters_Param.process_video_params);
        }
      }, {
        key: "videoSampling",
        value: function videoSampling(value) {
          return this.param(value, "video_sampling", "vs");
        }
      }, {
        key: "width",
        value: function width(value) {
          var _this4 = this;

          return this.param(value, "width", "w", function () {
            if (_this4.getValue("crop") || _this4.getValue("overlay") || _this4.getValue("underlay")) {
              return expression.normalize(value);
            } else {
              return null;
            }
          });
        }
      }, {
        key: "x",
        value: function x(value) {
          return this.param(value, "x", "x", expression.normalize);
        }
      }, {
        key: "y",
        value: function y(value) {
          return this.param(value, "y", "y", expression.normalize);
        }
      }, {
        key: "zoom",
        value: function zoom(value) {
          return this.param(value, "zoom", "z", expression.normalize);
        }
      }], [{
        key: "new",
        value: function _new(options) {
          return new Transformation(options);
        }
      }]);

      return Transformation;
    }(transformation_TransformationBase);
    /**
     * Transformation Class methods.
     * This is a list of the parameters defined in Transformation.
     * Values are camelCased.
     */


    transformation_Transformation.methods = ["angle", "audioCodec", "audioFrequency", "aspectRatio", "background", "bitRate", "border", "color", "colorSpace", "crop", "customFunction", "customPreFunction", "defaultImage", "delay", "density", "duration", "dpr", "effect", "else", "endIf", "endOffset", "fallbackContent", "fetchFormat", "format", "flags", "gravity", "fps", "height", "htmlHeight", "htmlWidth", "if", "keyframeInterval", "ocr", "offset", "opacity", "overlay", "page", "poster", "prefix", "quality", "radius", "rawTransformation", "size", "sourceTypes", "sourceTransformation", "startOffset", "streamingProfile", "transformation", "underlay", "variable", "variables", "videoCodec", "videoSampling", "width", "x", "y", "zoom"];
    /**
     * Parameters that are filtered out before passing the options to an HTML tag.
     *
     * The list of parameters is a combination of `Transformation::methods` and `Configuration::CONFIG_PARAMS`
     */

    transformation_Transformation.PARAM_NAMES = transformation_Transformation.methods.map(snakeCase).concat(src_configuration.CONFIG_PARAMS);
    /* harmony default export */ var src_transformation = (transformation_Transformation);
    // CONCATENATED MODULE: ./src/tags/htmltag.js
    function htmltag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function htmltag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function htmltag_createClass(Constructor, protoProps, staticProps) { if (protoProps) htmltag_defineProperties(Constructor.prototype, protoProps); if (staticProps) htmltag_defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * Generic HTML tag
     * Depends on 'transformation', 'util'
     */


    /**
     * Represents an HTML (DOM) tag
     * @constructor HtmlTag
     * @param {string} name - the name of the tag
     * @param {string} [publicId]
     * @param {Object} options
     * @example tag = new HtmlTag( 'div', { 'width': 10})
     */

    var htmltag_HtmlTag = /*#__PURE__*/function () {
      function HtmlTag(name, publicId, options) {
        htmltag_classCallCheck(this, HtmlTag);

        var transformation;
        this.name = name;
        this.publicId = publicId;

        if (options == null) {
          if (isPlainObject_root_isPlainObject_default()(publicId)) {
            options = publicId;
            this.publicId = void 0;
          } else {
            options = {};
          }
        }

        transformation = new src_transformation(options);
        transformation.setParent(this);

        this.transformation = function () {
          return transformation;
        };
      }
      /**
       * Convenience constructor
       * Creates a new instance of an HTML (DOM) tag
       * @function HtmlTag.new
       * @param {string} name - the name of the tag
       * @param {string} [publicId]
       * @param {Object} options
       * @return {HtmlTag}
       * @example tag = HtmlTag.new( 'div', { 'width': 10})
       */


      htmltag_createClass(HtmlTag, [{
        key: "htmlAttrs",

        /**
         * combine key and value from the `attr` to generate an HTML tag attributes string.
         * `Transformation::toHtmlTagOptions` is used to filter out transformation and configuration keys.
         * @protected
         * @param {Object} attrs
         * @return {string} the attributes in the format `'key1="value1" key2="value2"'`
         * @ignore
         */
        value: function htmlAttrs(attrs) {
          var key, pairs, value;
          return pairs = function () {
            var results;
            results = [];

            for (key in attrs) {
              value = escapeQuotes(attrs[key]);

              if (value) {
                results.push(htmltag_toAttribute(key, value));
              }
            }

            return results;
          }().sort().join(' ');
        }
        /**
         * Get all options related to this tag.
         * @function HtmlTag#getOptions
         * @returns {Object} the options
         *
         */

      }, {
        key: "getOptions",
        value: function getOptions() {
          return this.transformation().toOptions();
        }
        /**
         * Get the value of option `name`
         * @function HtmlTag#getOption
         * @param {string} name - the name of the option
         * @returns {*} Returns the value of the option
         *
         */

      }, {
        key: "getOption",
        value: function getOption(name) {
          return this.transformation().getValue(name);
        }
        /**
         * Get the attributes of the tag.
         * @function HtmlTag#attributes
         * @returns {Object} attributes
         */

      }, {
        key: "attributes",
        value: function attributes() {
          // The attributes are be computed from the options every time this method is invoked.
          var htmlAttributes = this.transformation().toHtmlAttributes();
          Object.keys(htmlAttributes).forEach(function (key) {
            if (isPlainObject_root_isPlainObject_default()(htmlAttributes[key])) {
              delete htmlAttributes[key];
            }
          });

          if (htmlAttributes.attributes) {
            // Currently HTML attributes are defined both at the top level and under 'attributes'
            merge_root_merge_default()(htmlAttributes, htmlAttributes.attributes);
            delete htmlAttributes.attributes;
          }

          return htmlAttributes;
        }
        /**
         * Set a tag attribute named `name` to `value`
         * @function HtmlTag#setAttr
         * @param {string} name - the name of the attribute
         * @param {string} value - the value of the attribute
         */

      }, {
        key: "setAttr",
        value: function setAttr(name, value) {
          this.transformation().set("html_".concat(name), value);
          return this;
        }
        /**
         * Get the value of the tag attribute `name`
         * @function HtmlTag#getAttr
         * @param {string} name - the name of the attribute
         * @returns {*}
         */

      }, {
        key: "getAttr",
        value: function getAttr(name) {
          return this.attributes()["html_".concat(name)] || this.attributes()[name];
        }
        /**
         * Remove the tag attributed named `name`
         * @function HtmlTag#removeAttr
         * @param {string} name - the name of the attribute
         * @returns {*}
         */

      }, {
        key: "removeAttr",
        value: function removeAttr(name) {
          var ref;
          return (ref = this.transformation().remove("html_".concat(name))) != null ? ref : this.transformation().remove(name);
        }
        /**
         * @function HtmlTag#content
         * @protected
         * @ignore
         */

      }, {
        key: "content",
        value: function content() {
          return "";
        }
        /**
         * @function HtmlTag#openTag
         * @protected
         * @ignore
         */

      }, {
        key: "openTag",
        value: function openTag() {
          var tag = "<" + this.name;
          var htmlAttrs = this.htmlAttrs(this.attributes());

          if (htmlAttrs && htmlAttrs.length > 0) {
            tag += " " + htmlAttrs;
          }

          return tag + ">";
        }
        /**
         * @function HtmlTag#closeTag
         * @protected
         * @ignore
         */

      }, {
        key: "closeTag",
        value: function closeTag() {
          return "</".concat(this.name, ">");
        }
        /**
         * Generates an HTML representation of the tag.
         * @function HtmlTag#toHtml
         * @returns {string} Returns HTML in string format
         */

      }, {
        key: "toHtml",
        value: function toHtml() {
          return this.openTag() + this.content() + this.closeTag();
        }
        /**
         * Creates a DOM object representing the tag.
         * @function HtmlTag#toDOM
         * @returns {Element}
         */

      }, {
        key: "toDOM",
        value: function toDOM() {
          var element, name, ref, value;

          if (!isFunction_root_isFunction_default()(typeof document !== "undefined" && document !== null ? document.createElement : void 0)) {
            throw "Can't create DOM if document is not present!";
          }

          element = document.createElement(this.name);
          ref = this.attributes();

          for (name in ref) {
            value = ref[name];
            element.setAttribute(name, value);
          }

          return element;
        }
      }], [{
        key: "new",
        value: function _new(name, publicId, options) {
          return new this(name, publicId, options);
        }
      }, {
        key: "isResponsive",
        value: function isResponsive(tag, responsiveClass) {
          var dataSrc;
          dataSrc = lodash_getData(tag, 'src-cache') || lodash_getData(tag, 'src');
          return lodash_hasClass(tag, responsiveClass) && /\bw_auto\b/.exec(dataSrc);
        }
      }]);

      return HtmlTag;
    }();
    /**
     * Represent the given key and value as an HTML attribute.
     * @function toAttribute
     * @protected
     * @param {string} key - attribute name
     * @param {*|boolean} value - the value of the attribute. If the value is boolean `true`, return the key only.
     * @returns {string} the attribute
     *
     */

    function htmltag_toAttribute(key, value) {
      if (!value) {
        return void 0;
      } else if (value === true) {
        return key;
      } else {
        return "".concat(key, "=\"").concat(value, "\"");
      }
    }
    /**
     * If given value is a string, replaces quotes with character entities (&#34;, &#39;)
     * @param value - value to change
     * @returns {*} changed value
     */


    function escapeQuotes(value) {
      return isString_root_isString_default()(value) ? value.replace('"', '&#34;').replace("'", '&#39;') : value;
    }

    /* harmony default export */ var htmltag = (htmltag_HtmlTag);
    // CONCATENATED MODULE: ./src/url.js
    function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }







    /**
     * Adds protocol, host, pathname prefixes to given string
     * @param str
     * @returns {string}
     */

    function makeUrl(str) {
      var prefix = document.location.protocol + '//' + document.location.host;

      if (str[0] === '?') {
        prefix += document.location.pathname;
      } else if (str[0] !== '/') {
        prefix += document.location.pathname.replace(/\/[^\/]*$/, '/');
      }

      return prefix + str;
    }
    /**
     * Check is given string is a url
     * @param str
     * @returns {boolean}
     */


    function isUrl(str) {
      return str ? !!str.match(/^https?:\//) : false;
    } // Produce a number between 1 and 5 to be used for cdn sub domains designation


    function cdnSubdomainNumber(publicId) {
      return src_crc32(publicId) % 5 + 1;
    }
    /**
     * Removes signature from options and returns the signature
     * Makes sure signature is empty or of this format: s--signature--
     * @param {object} options
     * @returns {string} the formatted signature
     */


    function handleSignature(options) {
      var signature = options.signature;
      var isFormatted = !signature || signature.startsWith('s--') && signature.endsWith('--');
      delete options.signature;
      return isFormatted ? signature : "s--".concat(signature, "--");
    }
    /**
     * Create the URL prefix for Cloudinary resources.
     * @param {string} publicId the resource public ID
     * @param {object} options additional options
     * @param {string} options.cloud_name - the cloud name.
     * @param {boolean} [options.cdn_subdomain=false] - Whether to automatically build URLs with
     *  multiple CDN sub-domains.
     * @param {string} [options.private_cdn] - Boolean (default: false). Should be set to true for Advanced plan's users
     *  that have a private CDN distribution.
     * @param {string} [options.protocol="http://"] - the URI protocol to use. If options.secure is true,
     *  the value is overridden to "https://"
     * @param {string} [options.secure_distribution] - The domain name of the CDN distribution to use for building HTTPS URLs.
     *  Relevant only for Advanced plan's users that have a private CDN distribution.
     * @param {string} [options.cname] - Custom domain name to use for building HTTP URLs.
     *  Relevant only for Advanced plan's users that have a private CDN distribution and a custom CNAME.
     * @param {boolean} [options.secure_cdn_subdomain=true] - When options.secure is true and this parameter is false,
     *  the subdomain is set to "res".
     * @param {boolean} [options.secure=false] - Force HTTPS URLs of images even if embedded in non-secure HTTP pages.
     *  When this value is true, options.secure_distribution will be used as host if provided, and options.protocol is set
     *  to "https://".
     * @returns {string} the URL prefix for the resource.
     * @private
     */


    function handlePrefix(publicId, options) {
      if (options.cloud_name && options.cloud_name[0] === '/') {
        return '/res' + options.cloud_name;
      } // defaults


      var protocol = "http://";
      var cdnPart = "";
      var subdomain = "res";
      var host = ".cloudinary.com";
      var path = "/" + options.cloud_name; // modifications

      if (options.protocol) {
        protocol = options.protocol + '//';
      }

      if (options.private_cdn) {
        cdnPart = options.cloud_name + "-";
        path = "";
      }

      if (options.cdn_subdomain) {
        subdomain = "res-" + cdnSubdomainNumber(publicId);
      }

      if (options.secure) {
        protocol = "https://";

        if (options.secure_cdn_subdomain === false) {
          subdomain = "res";
        }

        if (options.secure_distribution != null && options.secure_distribution !== OLD_AKAMAI_SHARED_CDN && options.secure_distribution !== SHARED_CDN) {
          cdnPart = "";
          subdomain = "";
          host = options.secure_distribution;
        }
      } else if (options.cname) {
        protocol = "http://";
        cdnPart = "";
        subdomain = options.cdn_subdomain ? 'a' + (src_crc32(publicId) % 5 + 1) + '.' : '';
        host = options.cname;
      }

      return [protocol, cdnPart, subdomain, host, path].join("");
    }
    /**
     * Return the resource type and action type based on the given configuration
     * @function Cloudinary#handleResourceType
     * @param {Object|string} resource_type
     * @param {string} [type='upload']
     * @param {string} [url_suffix]
     * @param {boolean} [use_root_path]
     * @param {boolean} [shorten]
     * @returns {string} resource_type/type
     * @ignore
     */


    function handleResourceType(_ref) {
      var _ref$resource_type = _ref.resource_type,
          resource_type = _ref$resource_type === void 0 ? "image" : _ref$resource_type,
          _ref$type = _ref.type,
          type = _ref$type === void 0 ? "upload" : _ref$type,
          url_suffix = _ref.url_suffix,
          use_root_path = _ref.use_root_path,
          shorten = _ref.shorten;
      var options,
          resourceType = resource_type;

      if (isPlainObject_root_isPlainObject_default()(resourceType)) {
        options = resourceType;
        resourceType = options.resource_type;
        type = options.type;
        shorten = options.shorten;
      }

      if (type == null) {
        type = 'upload';
      }

      if (url_suffix != null) {
        resourceType = SEO_TYPES["".concat(resourceType, "/").concat(type)];
        type = null;

        if (resourceType == null) {
          throw new Error("URL Suffix only supported for ".concat(Object.keys(SEO_TYPES).join(', ')));
        }
      }

      if (use_root_path) {
        if (resourceType === 'image' && type === 'upload' || resourceType === "images") {
          resourceType = null;
          type = null;
        } else {
          throw new Error("Root path only supported for image/upload");
        }
      }

      if (shorten && resourceType === 'image' && type === 'upload') {
        resourceType = 'iu';
        type = null;
      }

      return [resourceType, type].join("/");
    }
    /**
     * Encode publicId
     * @param publicId
     * @returns {string} encoded publicId
     */


    function encodePublicId(publicId) {
      return encodeURIComponent(publicId).replace(/%3A/g, ':').replace(/%2F/g, '/');
    }
    /**
     * Encode and format publicId
     * @param publicId
     * @param options
     * @returns {string} publicId
     */


    function formatPublicId(publicId, options) {
      if (isUrl(publicId)) {
        publicId = encodePublicId(publicId);
      } else {
        try {
          // Make sure publicId is URI encoded.
          publicId = decodeURIComponent(publicId);
        } catch (error) {}

        publicId = encodePublicId(publicId);

        if (options.url_suffix) {
          publicId = publicId + '/' + options.url_suffix;
        }

        if (options.format) {
          if (!options.trust_public_id) {
            publicId = publicId.replace(/\.(jpg|png|gif|webp)$/, '');
          }

          publicId = publicId + '.' + options.format;
        }
      }

      return publicId;
    }
    /**
     * Get any error with url options
     * @param options
     * @returns {string} if error, otherwise return undefined
     */


    function validate(options) {
      var cloud_name = options.cloud_name,
          url_suffix = options.url_suffix;

      if (!cloud_name) {
        return 'Unknown cloud_name';
      }

      if (url_suffix && url_suffix.match(/[\.\/]/)) {
        return 'url_suffix should not include . or /';
      }
    }
    /**
     * Get version part of the url
     * @param publicId
     * @param options
     * @returns {string}
     */


    function handleVersion(publicId, options) {
      // force_version param means to make sure there is a version in the url (Default is true)
      var isForceVersion = options.force_version || typeof options.force_version === 'undefined'; // Is version included in publicId or in options, or publicId is a url (doesn't need version)

      var isVersionExist = publicId.indexOf('/') < 0 || publicId.match(/^v[0-9]+/) || isUrl(publicId) || options.version;

      if (isForceVersion && !isVersionExist) {
        options.version = 1;
      }

      return options.version ? "v".concat(options.version) : '';
    }
    /**
     * Get final transformation component for url string
     * @param options
     * @returns {string}
     */


    function handleTransformation(options) {
      var _ref2 = options || {},
          placeholder = _ref2.placeholder,
          accessibility = _ref2.accessibility,
          otherOptions = _objectWithoutProperties(_ref2, ["placeholder", "accessibility"]);

      var result = new src_transformation(otherOptions); // Append accessibility transformations

      if (accessibility && ACCESSIBILITY_MODES[accessibility]) {
        result.chain().effect(ACCESSIBILITY_MODES[accessibility]);
      } // Append placeholder transformations


      if (placeholder) {
        if (placeholder === "predominant-color" && result.getValue('width') && result.getValue('height')) {
          placeholder += '-pixel';
        }

        var placeholderTransformations = PLACEHOLDER_IMAGE_MODES[placeholder] || PLACEHOLDER_IMAGE_MODES.blur;
        placeholderTransformations.forEach(function (t) {
          return result.chain().transformation(t);
        });
      }

      return result.serialize();
    }
    /**
     * If type is 'fetch', update publicId to be a url
     * @param publicId
     * @param type
     * @returns {string}
     */


    function preparePublicId(publicId, _ref3) {
      var type = _ref3.type;
      return !isUrl(publicId) && type === 'fetch' ? makeUrl(publicId) : publicId;
    }
    /**
     * Generate url string
     * @param publicId
     * @param options
     * @returns {string} final url
     */


    function urlString(publicId, options) {
      if (isUrl(publicId) && (options.type === 'upload' || options.type === 'asset')) {
        return publicId;
      }

      var version = handleVersion(publicId, options);
      var transformationString = handleTransformation(options);
      var prefix = handlePrefix(publicId, options);
      var signature = handleSignature(options);
      var resourceType = handleResourceType(options);
      publicId = formatPublicId(publicId, options);
      return compact_root_compact_default()([prefix, resourceType, signature, transformationString, version, publicId]).join('/').replace(/([^:])\/+/g, '$1/') // replace '///' with '//'
      .replace(' ', '%20');
    }
    /**
     * Merge options and config with defaults
     * update options fetch_format according to 'type' param
     * @param options
     * @param config
     * @returns {*} updated options
     */


    function prepareOptions(options, config) {
      if (options instanceof src_transformation) {
        options = options.toOptions();
      }

      options = defaults({}, options, config, DEFAULT_IMAGE_PARAMS);

      if (options.type === 'fetch') {
        options.fetch_format = options.fetch_format || options.format;
      }

      return options;
    }
    /**
     * Generates a URL for any asset in your Media library.
     * @function url
     * @ignore
     * @param {string} publicId - The public ID of the media asset.
     * @param {Object} [options={}] - The {@link Transformation} parameters to include in the URL.
     * @param {object} [config={}] - URL configuration parameters
     * @param {type} [options.type='upload'] - The asset's storage type.
     *  For details on all fetch types, see
     * <a href="https://cloudinary.com/documentation/image_transformations#fetching_images_from_remote_locations"
     *  target="_blank">Fetch types</a>.
     * @param {Object} [options.resource_type='image'] - The type of asset. <p>Possible values:<br/>
     *  - `image`<br/>
     *  - `video`<br/>
     *  - `raw`
     * @param {signature} [options.signature='s--12345678--'] - The signature component of a
     *  signed delivery URL of the format: /s--SIGNATURE--/.
     *  For details on signatures, see
     * <a href="https://cloudinary.com/documentation/signatures" target="_blank">Signatures</a>.
     * @return {string} The media asset URL.
     * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
     *  Available image transformations</a>
     * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
     *  Available video transformations</a>
     */


    function url_url(publicId) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!publicId) {
        return publicId;
      }

      options = prepareOptions(options, config);
      publicId = preparePublicId(publicId, options);
      var error = validate(options);

      if (error) {
        throw error;
      }

      var resultUrl = urlString(publicId, options);

      if (options.urlAnalytics) {
        var analyticsOptions = getAnalyticsOptions(options);
        var sdkAnalyticsSignature = getSDKAnalyticsSignature(analyticsOptions); // url might already have a '?' query param

        var appender = '?';

        if (resultUrl.indexOf('?') >= 0) {
          appender = '&';
        }

        resultUrl = "".concat(resultUrl).concat(appender, "_a=").concat(sdkAnalyticsSignature);
      }

      return resultUrl;
    }
    // CONCATENATED MODULE: ./src/util/generateBreakpoints.js
    function generateBreakpoints_slicedToArray(arr, i) { return generateBreakpoints_arrayWithHoles(arr) || generateBreakpoints_iterableToArrayLimit(arr, i) || generateBreakpoints_unsupportedIterableToArray(arr, i) || generateBreakpoints_nonIterableRest(); }

    function generateBreakpoints_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function generateBreakpoints_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return generateBreakpoints_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return generateBreakpoints_arrayLikeToArray(o, minLen); }

    function generateBreakpoints_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function generateBreakpoints_iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function generateBreakpoints_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

    /**
     * Helper function. Gets or populates srcset breakpoints using provided parameters
     * Either the breakpoints or min_width, max_width, max_images must be provided.
     *
     * @private
     * @param {srcset} srcset Options with either `breakpoints` or `min_width`, `max_width`, and `max_images`
     *
     * @return {number[]} Array of breakpoints
     *
     */
    function generateBreakpoints(srcset) {
      var breakpoints = srcset.breakpoints || [];

      if (breakpoints.length) {
        return breakpoints;
      }

      var _map = [srcset.min_width, srcset.max_width, srcset.max_images].map(Number),
          _map2 = generateBreakpoints_slicedToArray(_map, 3),
          min_width = _map2[0],
          max_width = _map2[1],
          max_images = _map2[2];

      if ([min_width, max_width, max_images].some(isNaN)) {
        throw 'Either (min_width, max_width, max_images) ' + 'or breakpoints must be provided to the image srcset attribute';
      }

      if (min_width > max_width) {
        throw 'min_width must be less than max_width';
      }

      if (max_images <= 0) {
        throw 'max_images must be a positive integer';
      } else if (max_images === 1) {
        min_width = max_width;
      }

      var stepSize = Math.ceil((max_width - min_width) / Math.max(max_images - 1, 1));

      for (var current = min_width; current < max_width; current += stepSize) {
        breakpoints.push(current);
      }

      breakpoints.push(max_width);
      return breakpoints;
    }
    // CONCATENATED MODULE: ./src/util/srcsetUtils.js

    var srcsetUtils_isEmpty = isEmpty;



    /**
     * Options used to generate the srcset attribute.
     * @typedef {object} srcset
     * @property {(number[]|string[])}   [breakpoints] An array of breakpoints.
     * @property {number}                [min_width]   Minimal width of the srcset images.
     * @property {number}                [max_width]   Maximal width of the srcset images.
     * @property {number}                [max_images]  Number of srcset images to generate.
     * @property {object|string}         [transformation] The transformation to use in the srcset urls.
     * @property {boolean}               [sizes] Whether to calculate and add the sizes attribute.
     */

    /**
     * Helper function. Generates a single srcset item url
     *
     * @private
     * @param {string} public_id  Public ID of the resource.
     * @param {number} width      Width in pixels of the srcset item.
     * @param {object|string} transformation
     * @param {object} options    Additional options.
     *
     * @return {string} Resulting URL of the item
     */

    function scaledUrl(public_id, width, transformation) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var configParams = extractUrlParams(options);
      transformation = transformation || options;
      configParams.raw_transformation = new src_transformation([merge_root_merge_default.a({}, transformation), {
        crop: 'scale',
        width: width
      }]).toString();
      return url_url(public_id, configParams);
    }
    /**
     * If cache is enabled, get the breakpoints from the cache. If the values were not found in the cache,
     * or cache is not enabled, generate the values.
     * @param {srcset} srcset The srcset configuration parameters
     * @param {string} public_id
     * @param {object} options
     * @return {*|Array}
     */

    function getOrGenerateBreakpoints(public_id) {
      var srcset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return generateBreakpoints(srcset);
    }
    /**
     * Helper function. Generates srcset attribute value of the HTML img tag
     * @private
     *
     * @param {string} public_id  Public ID of the resource
     * @param {number[]} breakpoints An array of breakpoints (in pixels)
     * @param {object} transformation The transformation
     * @param {object} options Includes html tag options, transformation options
     * @return {string} Resulting srcset attribute value
     */

    function generateSrcsetAttribute(public_id, breakpoints, transformation, options) {
      options = cloneDeep_root_cloneDeep_default.a(options);
      patchFetchFormat(options);
      return breakpoints.map(function (width) {
        return "".concat(scaledUrl(public_id, width, transformation, options), " ").concat(width, "w");
      }).join(', ');
    }
    /**
     * Helper function. Generates sizes attribute value of the HTML img tag
     * @private
     * @param {number[]} breakpoints An array of breakpoints.
     * @return {string} Resulting sizes attribute value
     */

    function generateSizesAttribute(breakpoints) {
      if (breakpoints == null) {
        return '';
      }

      return breakpoints.map(function (width) {
        return "(max-width: ".concat(width, "px) ").concat(width, "px");
      }).join(', ');
    }
    /**
     * Helper function. Generates srcset and sizes attributes of the image tag
     *
     * Generated attributes are added to attributes argument
     *
     * @private
     * @param {string}    publicId  The public ID of the resource
     * @param {object}    attributes Existing HTML attributes.
     * @param {srcset}    srcsetData
     * @param {object}    options    Additional options.
     *
     * @return array The responsive attributes
     */

    function generateImageResponsiveAttributes(publicId) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var srcsetData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      // Create both srcset and sizes here to avoid fetching breakpoints twice
      var responsiveAttributes = {};

      if (srcsetUtils_isEmpty(srcsetData)) {
        return responsiveAttributes;
      }

      var generateSizes = !attributes.sizes && srcsetData.sizes === true;
      var generateSrcset = !attributes.srcset;

      if (generateSrcset || generateSizes) {
        var breakpoints = getOrGenerateBreakpoints(publicId, srcsetData, options);

        if (generateSrcset) {
          var transformation = srcsetData.transformation;
          var srcsetAttr = generateSrcsetAttribute(publicId, breakpoints, transformation, options);

          if (!srcsetUtils_isEmpty(srcsetAttr)) {
            responsiveAttributes.srcset = srcsetAttr;
          }
        }

        if (generateSizes) {
          var sizesAttr = generateSizesAttribute(breakpoints);

          if (!srcsetUtils_isEmpty(sizesAttr)) {
            responsiveAttributes.sizes = sizesAttr;
          }
        }
      }

      return responsiveAttributes;
    }
    /**
     * Generate a media query
     *
     * @private
     * @param {object} options configuration options
     * @param {number|string} options.min_width
     * @param {number|string} options.max_width
     * @return {string} a media query string
     */

    function generateMediaAttr(options) {
      var mediaQuery = [];

      if (options != null) {
        if (options.min_width != null) {
          mediaQuery.push("(min-width: ".concat(options.min_width, "px)"));
        }

        if (options.max_width != null) {
          mediaQuery.push("(max-width: ".concat(options.max_width, "px)"));
        }
      }

      return mediaQuery.join(' and ');
    }
    // CONCATENATED MODULE: ./src/tags/imagetag.js
    function imagetag_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { imagetag_typeof = function _typeof(obj) { return typeof obj; }; } else { imagetag_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return imagetag_typeof(obj); }

    function imagetag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function imagetag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function imagetag_createClass(Constructor, protoProps, staticProps) { if (protoProps) imagetag_defineProperties(Constructor.prototype, protoProps); if (staticProps) imagetag_defineProperties(Constructor, staticProps); return Constructor; }

    function imagetag_get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { imagetag_get = Reflect.get; } else { imagetag_get = function _get(target, property, receiver) { var base = imagetag_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return imagetag_get(target, property, receiver || target); }

    function imagetag_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = imagetag_getPrototypeOf(object); if (object === null) break; } return object; }

    function imagetag_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) imagetag_setPrototypeOf(subClass, superClass); }

    function imagetag_setPrototypeOf(o, p) { imagetag_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return imagetag_setPrototypeOf(o, p); }

    function imagetag_createSuper(Derived) { var hasNativeReflectConstruct = imagetag_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = imagetag_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = imagetag_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return imagetag_possibleConstructorReturn(this, result); }; }

    function imagetag_possibleConstructorReturn(self, call) { if (call && (imagetag_typeof(call) === "object" || typeof call === "function")) { return call; } return imagetag_assertThisInitialized(self); }

    function imagetag_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function imagetag_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function imagetag_getPrototypeOf(o) { imagetag_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return imagetag_getPrototypeOf(o); }

    /**
     * Image Tag
     * Depends on 'tags/htmltag', 'cloudinary'
     */




    /**
     * Creates an HTML (DOM) Image tag using Cloudinary as the source.
     * @constructor ImageTag
     * @extends HtmlTag
     * @param {string} [publicId]
     * @param {Object} [options]
     */

    var imagetag_ImageTag = /*#__PURE__*/function (_HtmlTag) {
      imagetag_inherits(ImageTag, _HtmlTag);

      var _super = imagetag_createSuper(ImageTag);

      function ImageTag(publicId) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        imagetag_classCallCheck(this, ImageTag);

        return _super.call(this, "img", publicId, options);
      }
      /** @override */


      imagetag_createClass(ImageTag, [{
        key: "closeTag",
        value: function closeTag() {
          return "";
        }
        /** @override */

      }, {
        key: "attributes",
        value: function attributes() {
          var attr, options, srcAttribute;
          attr = imagetag_get(imagetag_getPrototypeOf(ImageTag.prototype), "attributes", this).call(this) || {};
          options = this.getOptions();
          var srcsetParam = this.getOption('srcset');
          var attributes = this.getOption('attributes') || {};
          var responsiveAttributes = {};

          if (isString_root_isString_default()(srcsetParam)) {
            responsiveAttributes.srcset = srcsetParam;
          } else {
            responsiveAttributes = generateImageResponsiveAttributes(this.publicId, attributes, srcsetParam, options);
          }

          if (!isEmpty(responsiveAttributes)) {
            delete options.width;
            delete options.height;
          }

          merge_root_merge_default()(attr, responsiveAttributes);
          srcAttribute = options.responsive && !options.client_hints ? 'data-src' : 'src';

          if (attr[srcAttribute] == null) {
            attr[srcAttribute] = url_url(this.publicId, this.getOptions());
          }

          return attr;
        }
      }]);

      return ImageTag;
    }(htmltag);
    /* harmony default export */ var imagetag = (imagetag_ImageTag);
    // CONCATENATED MODULE: ./src/tags/sourcetag.js
    function sourcetag_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { sourcetag_typeof = function _typeof(obj) { return typeof obj; }; } else { sourcetag_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return sourcetag_typeof(obj); }

    function sourcetag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function sourcetag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function sourcetag_createClass(Constructor, protoProps, staticProps) { if (protoProps) sourcetag_defineProperties(Constructor.prototype, protoProps); if (staticProps) sourcetag_defineProperties(Constructor, staticProps); return Constructor; }

    function sourcetag_get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { sourcetag_get = Reflect.get; } else { sourcetag_get = function _get(target, property, receiver) { var base = sourcetag_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return sourcetag_get(target, property, receiver || target); }

    function sourcetag_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = sourcetag_getPrototypeOf(object); if (object === null) break; } return object; }

    function sourcetag_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) sourcetag_setPrototypeOf(subClass, superClass); }

    function sourcetag_setPrototypeOf(o, p) { sourcetag_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return sourcetag_setPrototypeOf(o, p); }

    function sourcetag_createSuper(Derived) { var hasNativeReflectConstruct = sourcetag_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = sourcetag_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = sourcetag_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return sourcetag_possibleConstructorReturn(this, result); }; }

    function sourcetag_possibleConstructorReturn(self, call) { if (call && (sourcetag_typeof(call) === "object" || typeof call === "function")) { return call; } return sourcetag_assertThisInitialized(self); }

    function sourcetag_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function sourcetag_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function sourcetag_getPrototypeOf(o) { sourcetag_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return sourcetag_getPrototypeOf(o); }

    /**
     * Image Tag
     * Depends on 'tags/htmltag', 'cloudinary'
     */




    /**
     * Creates an HTML (DOM) Image tag using Cloudinary as the source.
     * @constructor SourceTag
     * @extends HtmlTag
     * @param {string} [publicId]
     * @param {Object} [options]
     */

    var sourcetag_SourceTag = /*#__PURE__*/function (_HtmlTag) {
      sourcetag_inherits(SourceTag, _HtmlTag);

      var _super = sourcetag_createSuper(SourceTag);

      function SourceTag(publicId) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        sourcetag_classCallCheck(this, SourceTag);

        return _super.call(this, "source", publicId, options);
      }
      /** @override */


      sourcetag_createClass(SourceTag, [{
        key: "closeTag",
        value: function closeTag() {
          return "";
        }
        /** @override */

      }, {
        key: "attributes",
        value: function attributes() {
          var srcsetParam = this.getOption('srcset');
          var attr = sourcetag_get(sourcetag_getPrototypeOf(SourceTag.prototype), "attributes", this).call(this) || {};
          var options = this.getOptions();
          merge_root_merge_default()(attr, generateImageResponsiveAttributes(this.publicId, attr, srcsetParam, options));

          if (!attr.srcset) {
            attr.srcset = url_url(this.publicId, options);
          }

          if (!attr.media && options.media) {
            attr.media = generateMediaAttr(options.media);
          }

          return attr;
        }
      }]);

      return SourceTag;
    }(htmltag);
    /* harmony default export */ var sourcetag = (sourcetag_SourceTag);
    // CONCATENATED MODULE: ./src/tags/picturetag.js
    function picturetag_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { picturetag_typeof = function _typeof(obj) { return typeof obj; }; } else { picturetag_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return picturetag_typeof(obj); }

    function picturetag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function picturetag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function picturetag_createClass(Constructor, protoProps, staticProps) { if (protoProps) picturetag_defineProperties(Constructor.prototype, protoProps); if (staticProps) picturetag_defineProperties(Constructor, staticProps); return Constructor; }

    function picturetag_get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { picturetag_get = Reflect.get; } else { picturetag_get = function _get(target, property, receiver) { var base = picturetag_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return picturetag_get(target, property, receiver || target); }

    function picturetag_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = picturetag_getPrototypeOf(object); if (object === null) break; } return object; }

    function picturetag_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) picturetag_setPrototypeOf(subClass, superClass); }

    function picturetag_setPrototypeOf(o, p) { picturetag_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return picturetag_setPrototypeOf(o, p); }

    function picturetag_createSuper(Derived) { var hasNativeReflectConstruct = picturetag_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = picturetag_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = picturetag_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return picturetag_possibleConstructorReturn(this, result); }; }

    function picturetag_possibleConstructorReturn(self, call) { if (call && (picturetag_typeof(call) === "object" || typeof call === "function")) { return call; } return picturetag_assertThisInitialized(self); }

    function picturetag_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function picturetag_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function picturetag_getPrototypeOf(o) { picturetag_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return picturetag_getPrototypeOf(o); }







    var picturetag_PictureTag = /*#__PURE__*/function (_HtmlTag) {
      picturetag_inherits(PictureTag, _HtmlTag);

      var _super = picturetag_createSuper(PictureTag);

      function PictureTag(publicId) {
        var _this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var sources = arguments.length > 2 ? arguments[2] : undefined;

        picturetag_classCallCheck(this, PictureTag);

        _this = _super.call(this, 'picture', publicId, options);
        _this.widthList = sources;
        return _this;
      }
      /** @override */


      picturetag_createClass(PictureTag, [{
        key: "content",
        value: function content() {
          var _this2 = this;

          return this.widthList.map(function (_ref) {
            var min_width = _ref.min_width,
                max_width = _ref.max_width,
                transformation = _ref.transformation;

            var options = _this2.getOptions();

            var sourceTransformation = new src_transformation(options);
            sourceTransformation.chain().fromOptions(typeof transformation === 'string' ? {
              raw_transformation: transformation
            } : transformation);
            options = extractUrlParams(options);
            options.media = {
              min_width: min_width,
              max_width: max_width
            };
            options.transformation = sourceTransformation;
            return new sourcetag(_this2.publicId, options).toHtml();
          }).join('') + new imagetag(this.publicId, this.getOptions()).toHtml();
        }
        /** @override */

      }, {
        key: "attributes",
        value: function attributes() {
          var attr = picturetag_get(picturetag_getPrototypeOf(PictureTag.prototype), "attributes", this).call(this);

          delete attr.width;
          delete attr.height;
          return attr;
        }
        /** @override */

      }, {
        key: "closeTag",
        value: function closeTag() {
          return "</" + this.name + ">";
        }
      }]);

      return PictureTag;
    }(htmltag);
    /* harmony default export */ var picturetag = (picturetag_PictureTag);
    // CONCATENATED MODULE: ./src/tags/videotag.js
    function videotag_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { videotag_typeof = function _typeof(obj) { return typeof obj; }; } else { videotag_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return videotag_typeof(obj); }

    function videotag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function videotag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function videotag_createClass(Constructor, protoProps, staticProps) { if (protoProps) videotag_defineProperties(Constructor.prototype, protoProps); if (staticProps) videotag_defineProperties(Constructor, staticProps); return Constructor; }

    function videotag_get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { videotag_get = Reflect.get; } else { videotag_get = function _get(target, property, receiver) { var base = videotag_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return videotag_get(target, property, receiver || target); }

    function videotag_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = videotag_getPrototypeOf(object); if (object === null) break; } return object; }

    function videotag_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) videotag_setPrototypeOf(subClass, superClass); }

    function videotag_setPrototypeOf(o, p) { videotag_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return videotag_setPrototypeOf(o, p); }

    function videotag_createSuper(Derived) { var hasNativeReflectConstruct = videotag_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = videotag_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = videotag_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return videotag_possibleConstructorReturn(this, result); }; }

    function videotag_possibleConstructorReturn(self, call) { if (call && (videotag_typeof(call) === "object" || typeof call === "function")) { return call; } return videotag_assertThisInitialized(self); }

    function videotag_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function videotag_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function videotag_getPrototypeOf(o) { videotag_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return videotag_getPrototypeOf(o); }

    /**
     * Video Tag
     * Depends on 'tags/htmltag', 'util', 'cloudinary'
     */




    var VIDEO_TAG_PARAMS = ['source_types', 'source_transformation', 'fallback_content', 'poster', 'sources'];
    var videotag_DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv'];
    var videotag_DEFAULT_POSTER_OPTIONS = {
      format: 'jpg',
      resource_type: 'video'
    };
    /**
     * Creates an HTML (DOM) Video tag using Cloudinary as the source.
     * @constructor VideoTag
     * @extends HtmlTag
     * @param {string} [publicId]
     * @param {Object} [options]
     */

    var videotag_VideoTag = /*#__PURE__*/function (_HtmlTag) {
      videotag_inherits(VideoTag, _HtmlTag);

      var _super = videotag_createSuper(VideoTag);

      function VideoTag(publicId) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        videotag_classCallCheck(this, VideoTag);

        options = defaults({}, options, DEFAULT_VIDEO_PARAMS);
        return _super.call(this, "video", publicId.replace(/\.(mp4|ogv|webm)$/, ''), options);
      }
      /**
       * Set the transformation to apply on each source
       * @function VideoTag#setSourceTransformation
       * @param {Object} an object with pairs of source type and source transformation
       * @returns {VideoTag} Returns this instance for chaining purposes.
       */


      videotag_createClass(VideoTag, [{
        key: "setSourceTransformation",
        value: function setSourceTransformation(value) {
          this.transformation().sourceTransformation(value);
          return this;
        }
        /**
         * Set the source types to include in the video tag
         * @function VideoTag#setSourceTypes
         * @param {Array<string>} an array of source types
         * @returns {VideoTag} Returns this instance for chaining purposes.
         */

      }, {
        key: "setSourceTypes",
        value: function setSourceTypes(value) {
          this.transformation().sourceTypes(value);
          return this;
        }
        /**
         * Set the poster to be used in the video tag
         * @function VideoTag#setPoster
         * @param {string|Object} value
         * - string: a URL to use for the poster
         * - Object: transformation parameters to apply to the poster. May optionally include a public_id to use instead of the video public_id.
         * @returns {VideoTag} Returns this instance for chaining purposes.
         */

      }, {
        key: "setPoster",
        value: function setPoster(value) {
          this.transformation().poster(value);
          return this;
        }
        /**
         * Set the content to use as fallback in the video tag
         * @function VideoTag#setFallbackContent
         * @param {string} value - the content to use, in HTML format
         * @returns {VideoTag} Returns this instance for chaining purposes.
         */

      }, {
        key: "setFallbackContent",
        value: function setFallbackContent(value) {
          this.transformation().fallbackContent(value);
          return this;
        }
      }, {
        key: "content",
        value: function content() {
          var _this = this;

          var sourceTypes = this.transformation().getValue('source_types');
          var sourceTransformation = this.transformation().getValue('source_transformation');
          var fallback = this.transformation().getValue('fallback_content');
          var sources = this.getOption('sources');
          var innerTags = [];

          if (isArray_root_isArray_default()(sources) && !isEmpty(sources)) {
            innerTags = sources.map(function (source) {
              var src = url_url(_this.publicId, defaults({}, source.transformations || {}, {
                resource_type: 'video',
                format: source.type
              }), _this.getOptions());
              return _this.createSourceTag(src, source.type, source.codecs);
            });
          } else {
            if (isEmpty(sourceTypes)) {
              sourceTypes = videotag_DEFAULT_VIDEO_SOURCE_TYPES;
            }

            if (isArray_root_isArray_default()(sourceTypes)) {
              innerTags = sourceTypes.map(function (srcType) {
                var src = url_url(_this.publicId, defaults({}, sourceTransformation[srcType] || {}, {
                  resource_type: 'video',
                  format: srcType
                }), _this.getOptions());
                return _this.createSourceTag(src, srcType);
              });
            }
          }

          return innerTags.join('') + fallback;
        }
      }, {
        key: "attributes",
        value: function attributes() {
          var sourceTypes = this.getOption('source_types');
          var poster = this.getOption('poster');

          if (poster === undefined) {
            poster = {};
          }

          if (isPlainObject_root_isPlainObject_default()(poster)) {
            var defaultOptions = poster.public_id != null ? DEFAULT_IMAGE_PARAMS : videotag_DEFAULT_POSTER_OPTIONS;
            poster = url_url(poster.public_id || this.publicId, defaults({}, poster, defaultOptions, this.getOptions()));
          }

          var attr = videotag_get(videotag_getPrototypeOf(VideoTag.prototype), "attributes", this).call(this) || {};
          attr = omit(attr, VIDEO_TAG_PARAMS);
          var sources = this.getOption('sources'); // In case of empty sourceTypes - fallback to default source types is used.

          var hasSourceTags = !isEmpty(sources) || isEmpty(sourceTypes) || isArray_root_isArray_default()(sourceTypes);

          if (!hasSourceTags) {
            attr["src"] = url_url(this.publicId, this.getOptions(), {
              resource_type: 'video',
              format: sourceTypes
            });
          }

          if (poster != null) {
            attr["poster"] = poster;
          }

          return attr;
        }
      }, {
        key: "createSourceTag",
        value: function createSourceTag(src, sourceType) {
          var codecs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          var mimeType = null;

          if (!isEmpty(sourceType)) {
            var videoType = sourceType === 'ogv' ? 'ogg' : sourceType;
            mimeType = 'video/' + videoType;

            if (!isEmpty(codecs)) {
              var codecsStr = isArray_root_isArray_default()(codecs) ? codecs.join(', ') : codecs;
              mimeType += '; codecs=' + codecsStr;
            }
          }

          return "<source " + this.htmlAttrs({
            src: src,
            type: mimeType
          }) + ">";
        }
      }]);

      return VideoTag;
    }(htmltag);

    /* harmony default export */ var videotag = (videotag_VideoTag);
    // CONCATENATED MODULE: ./src/tags/clienthintsmetatag.js
    function clienthintsmetatag_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { clienthintsmetatag_typeof = function _typeof(obj) { return typeof obj; }; } else { clienthintsmetatag_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return clienthintsmetatag_typeof(obj); }

    function clienthintsmetatag_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function clienthintsmetatag_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function clienthintsmetatag_createClass(Constructor, protoProps, staticProps) { if (protoProps) clienthintsmetatag_defineProperties(Constructor.prototype, protoProps); if (staticProps) clienthintsmetatag_defineProperties(Constructor, staticProps); return Constructor; }

    function clienthintsmetatag_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) clienthintsmetatag_setPrototypeOf(subClass, superClass); }

    function clienthintsmetatag_setPrototypeOf(o, p) { clienthintsmetatag_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return clienthintsmetatag_setPrototypeOf(o, p); }

    function clienthintsmetatag_createSuper(Derived) { var hasNativeReflectConstruct = clienthintsmetatag_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = clienthintsmetatag_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = clienthintsmetatag_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return clienthintsmetatag_possibleConstructorReturn(this, result); }; }

    function clienthintsmetatag_possibleConstructorReturn(self, call) { if (call && (clienthintsmetatag_typeof(call) === "object" || typeof call === "function")) { return call; } return clienthintsmetatag_assertThisInitialized(self); }

    function clienthintsmetatag_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function clienthintsmetatag_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function clienthintsmetatag_getPrototypeOf(o) { clienthintsmetatag_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return clienthintsmetatag_getPrototypeOf(o); }

    /**
     * Image Tag
     * Depends on 'tags/htmltag', 'cloudinary'
     */


    /**
     * Creates an HTML (DOM) Meta tag that enables Client-Hints for the HTML page. <br/>
     *  See
     *  <a href="https://cloudinary.com/documentation/responsive_images#automating_responsive_images_with_client_hints"
     *  target="_new">Automating responsive images with Client Hints</a> for more details.
     * @constructor ClientHintsMetaTag
     * @extends HtmlTag
     * @param {object} options
     * @example
     * tag = new ClientHintsMetaTag()
     * //returns: <meta http-equiv="Accept-CH" content="DPR, Viewport-Width, Width">
     */

    var clienthintsmetatag_ClientHintsMetaTag = /*#__PURE__*/function (_HtmlTag) {
      clienthintsmetatag_inherits(ClientHintsMetaTag, _HtmlTag);

      var _super = clienthintsmetatag_createSuper(ClientHintsMetaTag);

      function ClientHintsMetaTag(options) {
        clienthintsmetatag_classCallCheck(this, ClientHintsMetaTag);

        return _super.call(this, 'meta', void 0, assign_root_assign_default()({
          "http-equiv": "Accept-CH",
          content: "DPR, Viewport-Width, Width"
        }, options));
      }
      /** @override */


      clienthintsmetatag_createClass(ClientHintsMetaTag, [{
        key: "closeTag",
        value: function closeTag() {
          return "";
        }
      }]);

      return ClientHintsMetaTag;
    }(htmltag);
    /* harmony default export */ var clienthintsmetatag = (clienthintsmetatag_ClientHintsMetaTag);
    // CONCATENATED MODULE: ./src/util/parse/normalizeToArray.js
    function normalizeToArray_toConsumableArray(arr) { return normalizeToArray_arrayWithoutHoles(arr) || normalizeToArray_iterableToArray(arr) || normalizeToArray_unsupportedIterableToArray(arr) || normalizeToArray_nonIterableSpread(); }

    function normalizeToArray_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function normalizeToArray_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return normalizeToArray_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return normalizeToArray_arrayLikeToArray(o, minLen); }

    function normalizeToArray_iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

    function normalizeToArray_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return normalizeToArray_arrayLikeToArray(arr); }

    function normalizeToArray_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


    /**
     * @desc normalize elements, support a single element, array or nodelist, always outputs array
     * @param elements<HTMLElement[]>
     * @returns {[]}
     */

    function normalizeToArray(elements) {
      if (isArray_root_isArray_default()(elements)) {
        return elements;
      } else if (elements.constructor.name === "NodeList") {
        return normalizeToArray_toConsumableArray(elements); // ensure an array is always returned, even if nodelist
      } else if (isString_root_isString_default()(elements)) {
        return Array.prototype.slice.call(document.querySelectorAll(elements), 0);
      } else {
        return [elements];
      }
    }
    // CONCATENATED MODULE: ./src/cloudinary.js
    function cloudinary_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function cloudinary_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function cloudinary_createClass(Constructor, protoProps, staticProps) { if (protoProps) cloudinary_defineProperties(Constructor.prototype, protoProps); if (staticProps) cloudinary_defineProperties(Constructor, staticProps); return Constructor; }


    var applyBreakpoints, closestAbove, defaultBreakpoints, cloudinary_findContainerWidth, cloudinary_maxWidth, updateDpr;











    defaultBreakpoints = function defaultBreakpoints(width) {
      var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
      return steps * Math.ceil(width / steps);
    };

    closestAbove = function closestAbove(list, value) {
      var i;
      i = list.length - 2;

      while (i >= 0 && list[i] >= value) {
        i--;
      }

      return list[i + 1];
    };

    applyBreakpoints = function applyBreakpoints(tag, width, steps, options) {
      var ref, ref1, ref2, responsive_use_breakpoints;
      responsive_use_breakpoints = (ref = (ref1 = (ref2 = options['responsive_use_breakpoints']) != null ? ref2 : options['responsive_use_stoppoints']) != null ? ref1 : this.config('responsive_use_breakpoints')) != null ? ref : this.config('responsive_use_stoppoints');

      if (!responsive_use_breakpoints || responsive_use_breakpoints === 'resize' && !options.resizing) {
        return width;
      } else {
        return this.calc_breakpoint(tag, width, steps);
      }
    };

    cloudinary_findContainerWidth = function findContainerWidth(element) {
      var containerWidth, style;
      containerWidth = 0;

      while ((element = element != null ? element.parentNode : void 0) instanceof Element && !containerWidth) {
        style = window.getComputedStyle(element);

        if (!/^inline/.test(style.display)) {
          containerWidth = lodash_width(element);
        }
      }

      return containerWidth;
    };

    updateDpr = function updateDpr(dataSrc, roundDpr) {
      return dataSrc.replace(/\bdpr_(1\.0|auto)\b/g, 'dpr_' + this.device_pixel_ratio(roundDpr));
    };

    cloudinary_maxWidth = function maxWidth(requiredWidth, tag) {
      var imageWidth;
      imageWidth = lodash_getData(tag, 'width') || 0;

      if (requiredWidth > imageWidth) {
        imageWidth = requiredWidth;
        lodash_setData(tag, 'width', requiredWidth);
      }

      return imageWidth;
    };

    var cloudinary_Cloudinary = /*#__PURE__*/function () {
      /**
       * Creates a new Cloudinary instance.
       * @class Cloudinary
       * @classdesc Main class for accessing Cloudinary functionality.
       * @param {Object} options - A {@link Configuration} object for globally configuring Cloudinary account settings.
       * @example<br/>
       *  var cl = new cloudinary.Cloudinary( { cloud_name: "mycloud"});<br/>
       *  var imgTag = cl.image("myPicID");
       * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters" target="_blank">
       *  Available configuration options</a>
       */
      function Cloudinary(options) {
        cloudinary_classCallCheck(this, Cloudinary);

        var configuration;
        this.devicePixelRatioCache = {};
        this.responsiveConfig = {};
        this.responsiveResizeInitialized = false;
        configuration = new src_configuration(options); // Provided for backward compatibility

        this.config = function (newConfig, newValue) {
          return configuration.config(newConfig, newValue);
        };
        /**
         * Use \<meta\> tags in the document to configure this `cloudinary` instance.
         * @return This {Cloudinary} instance for chaining.
         */


        this.fromDocument = function () {
          configuration.fromDocument();
          return this;
        };
        /**
         * Use environment variables to configure this `cloudinary` instance.
         * @return This {Cloudinary} instance for chaining.
         */


        this.fromEnvironment = function () {
          configuration.fromEnvironment();
          return this;
        };
        /**
         * Initializes the configuration of this `cloudinary` instance.
         *  This is a convenience method that invokes both {@link Configuration#fromEnvironment|fromEnvironment()}
         *  (Node.js environment only) and {@link Configuration#fromDocument|fromDocument()}.
         *  It first tries to retrieve the configuration from the environment variable.
         *  If not available, it tries from the document meta tags.
         * @function Cloudinary#init
         * @see Configuration#init
         * @return This {Cloudinary} instance for chaining.
         */


        this.init = function () {
          configuration.init();
          return this;
        };
      }
      /**
       * Convenience constructor
       * @param {Object} options
       * @return {Cloudinary}
       * @example cl = cloudinary.Cloudinary.new( { cloud_name: "mycloud"})
       */


      cloudinary_createClass(Cloudinary, [{
        key: "url",

        /**
         * Generates a URL for any asset in your Media library.
         * @function Cloudinary#url
         * @param {string} publicId - The public ID of the media asset.
         * @param {Object} [options] - The {@link Transformation} parameters to include in the URL.
         * @param {type} [options.type='upload'] - The asset's storage type.
         *  For details on all fetch types, see
         * <a href="https://cloudinary.com/documentation/image_transformations#fetching_images_from_remote_locations"
         *  target="_blank">Fetch types</a>.
         * @param {resourceType} [options.resource_type='image'] - The type of asset. Possible values:<br/>
         *  - `image`<br/>
         *  - `video`<br/>
         *  - `raw`
         * @return {string} The media asset URL.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         */
        value: function url(publicId) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return url_url(publicId, options, this.config());
        }
        /**
         * Generates a video asset URL.
         * @function Cloudinary#video_url
         * @param {string} publicId - The public ID of the video.
         * @param {Object} [options] - The {@link Transformation} parameters to include in the URL.
         * @param {type} [options.type='upload'] - The asset's storage type.
         *  For details on all fetch types, see
         *  <a href="https://cloudinary.com/documentation/image_transformations#fetching_images_from_remote_locations"
         *  target="_blank">Fetch types</a>.
         * @return {string} The video URL.
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference"
         *  target="_blank">Available video transformations</a>
         */

      }, {
        key: "video_url",
        value: function video_url(publicId, options) {
          options = assign_root_assign_default()({
            resource_type: 'video'
          }, options);
          return this.url(publicId, options);
        }
        /**
         * Generates a URL for an image intended to be used as a thumbnail for the specified video.
         *  Identical to {@link Cloudinary#url|url}, except that the `resource_type` is `video`
         *  and the default `format` is `jpg`.
         * @function Cloudinary#video_thumbnail_url
         * @param {string} publicId -  The unique identifier of the video from which you want to generate a thumbnail image.
         * @param {Object} [options] - The image {@link Transformation} parameters to apply to the thumbnail.
         * In addition to standard image transformations, you can also use the `start_offset` transformation parameter
         * to instruct Cloudinary to generate the thumbnail from a frame other than the middle frame of the video.
         * For details, see
         * <a href="https://cloudinary.com/documentation/video_manipulation_and_delivery#generating_video_thumbnails"
         * target="_blank">Generating video thumbnails</a> in the Cloudinary documentation.
         * @param {type} [options.type='upload'] - The asset's storage type.
         * @return {string} The URL of the video thumbnail image.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         */

      }, {
        key: "video_thumbnail_url",
        value: function video_thumbnail_url(publicId, options) {
          options = assign_root_assign_default()({}, DEFAULT_POSTER_OPTIONS, options);
          return this.url(publicId, options);
        }
        /**
         * Generates a string representation of the specified transformation options.
         * @function Cloudinary#transformation_string
         * @param {Object} options - The {@link Transformation} options.
         * @returns {string} The transformation string.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         */

      }, {
        key: "transformation_string",
        value: function transformation_string(options) {
          return new src_transformation(options).serialize();
        }
        /**
         * Generates an image tag.
         * @function Cloudinary#image
         * @param {string} publicId - The public ID of the image.
         * @param {Object} options - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag DOM element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "image",
        value: function image(publicId) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var client_hints, img, ref;
          img = this.imageTag(publicId, options);
          client_hints = (ref = options.client_hints != null ? options.client_hints : this.config('client_hints')) != null ? ref : false;

          if (options.src == null && !client_hints) {
            // src must be removed before creating the DOM element to avoid loading the image
            img.setAttr("src", '');
          }

          img = img.toDOM();

          if (!client_hints) {
            // cache the image src
            lodash_setData(img, 'src-cache', this.url(publicId, options)); // set image src taking responsiveness in account

            this.cloudinary_update(img, options);
          }

          return img;
        }
        /**
         * Creates a new ImageTag instance using the configuration defined for this `cloudinary` instance.
         * @function Cloudinary#imageTag
         * @param {string} publicId - The public ID of the image.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {ImageTag} An ImageTag instance that is attached (chained) to this Cloudinary instance.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "imageTag",
        value: function imageTag(publicId, options) {
          var tag;
          tag = new imagetag(publicId, this.config());
          tag.transformation().fromOptions(options);
          return tag;
        }
        /**
         * Creates a new PictureTag instance, configured using this `cloudinary` instance.
         * @function Cloudinary#PictureTag
         * @param {string} publicId - the public ID of the resource
         * @param {Object} options - additional options to pass to the new ImageTag instance
         * @return {PictureTag} A PictureTag that is attached (chained) to this Cloudinary instance
         */

      }, {
        key: "pictureTag",
        value: function pictureTag(publicId, options) {
          var tag;
          tag = new picturetag(publicId, this.config());
          tag.transformation().fromOptions(options);
          return tag;
        }
        /**
         * Creates a new SourceTag instance, configured using this `cloudinary` instance.
         * @function Cloudinary#SourceTag
         * @param {string} publicId - the public ID of the resource.
         * @param {Object} options - additional options to pass to the new instance.
         * @return {SourceTag} A SourceTag that is attached (chained) to this Cloudinary instance
         */

      }, {
        key: "sourceTag",
        value: function sourceTag(publicId, options) {
          var tag;
          tag = new sourcetag(publicId, this.config());
          tag.transformation().fromOptions(options);
          return tag;
        }
        /**
         * Generates a video thumbnail URL from the specified remote video and includes it in an image tag.
         * @function Cloudinary#video_thumbnail
         * @param {string} publicId - The unique identifier of the video from the relevant video site.
         *  Additionally, either append the image extension type to the identifier value or set
         *  the image delivery format in the 'options' parameter using the 'format' transformation option.
         *  For example, a YouTube video might have the identifier: 'o-urnlaJpOA.jpg'.
         * @param {Object} [options] - The {@link Transformation} parameters to apply.
         * @return {HTMLImageElement} An HTML image tag element
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "video_thumbnail",
        value: function video_thumbnail(publicId, options) {
          return this.image(publicId, merge_root_merge_default()({}, DEFAULT_POSTER_OPTIONS, options));
        }
        /**
         * Fetches a facebook profile image and delivers it in an image tag element.
         * @function Cloudinary#facebook_profile_image
         * @param {string} publicId - The Facebook numeric ID. Additionally, either append the image extension type
         *  to the ID or set the image delivery format in the 'options' parameter using the 'format' transformation option.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "facebook_profile_image",
        value: function facebook_profile_image(publicId, options) {
          return this.image(publicId, assign_root_assign_default()({
            type: 'facebook'
          }, options));
        }
        /**
         * Fetches a Twitter profile image by ID and delivers it in an image tag element.
         * @function Cloudinary#twitter_profile_image
         * @param {string} publicId - The Twitter numeric ID. Additionally, either append the image extension type
         *  to the ID or set the image delivery format in the 'options' parameter using the 'format' transformation option.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "twitter_profile_image",
        value: function twitter_profile_image(publicId, options) {
          return this.image(publicId, assign_root_assign_default()({
            type: 'twitter'
          }, options));
        }
        /**
         * Fetches a Twitter profile image by name and delivers it in an image tag element.
         * @function Cloudinary#twitter_name_profile_image
         * @param {string} publicId - The Twitter screen name. Additionally, either append the image extension type
         *  to the screen name or set the image delivery format in the 'options' parameter using the 'format' transformation option.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "twitter_name_profile_image",
        value: function twitter_name_profile_image(publicId, options) {
          return this.image(publicId, assign_root_assign_default()({
            type: 'twitter_name'
          }, options));
        }
        /**
         * Fetches a Gravatar profile image and delivers it in an image tag element.
         * @function Cloudinary#gravatar_image
         * @param {string} publicId - The calculated hash for the Gravatar email address.
         *  Additionally, either append the image extension type to the screen name or set the image delivery format
         *  in the 'options' parameter using the 'format' transformation option.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "gravatar_image",
        value: function gravatar_image(publicId, options) {
          return this.image(publicId, assign_root_assign_default()({
            type: 'gravatar'
          }, options));
        }
        /**
         * Fetches an image from a remote URL and delivers it in an image tag element.
         * @function Cloudinary#fetch_image
         * @param {string} publicId - The full URL of the image to fetch, including the extension.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLImageElement} An image tag element.
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "fetch_image",
        value: function fetch_image(publicId, options) {
          return this.image(publicId, assign_root_assign_default()({
            type: 'fetch'
          }, options));
        }
        /**
         * Generates a video tag.
         * @function Cloudinary#video
         * @param {string} publicId - The public ID of the video.
         * @param {Object} [options] - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {HTMLVideoElement} A video tag DOM element.
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "video",
        value: function video(publicId) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return this.videoTag(publicId, options).toHtml();
        }
        /**
         * Creates a new VideoTag instance using the configuration defined for this `cloudinary` instance.
         * @function Cloudinary#videoTag
         * @param {string} publicId - The public ID of the video.
         * @param {Object} options - The {@link Transformation} parameters, {@link Configuration} parameters,
         *  and standard HTML &lt;img&gt; tag attributes to apply to the image tag.
         * @return {VideoTag} A VideoTag that is attached (chained) to this `cloudinary` instance.
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         * @see <a href="https://cloudinary.com/documentation/solution_overview#configuration_parameters"
         *  target="_blank">Available configuration options</a>
         */

      }, {
        key: "videoTag",
        value: function videoTag(publicId, options) {
          options = defaults({}, options, this.config());
          return new videotag(publicId, options);
        }
        /**
         * Generates a sprite PNG image that contains all images with the specified tag and the corresponding css file.
         * @function Cloudinary#sprite_css
         * @param {string} publicId - The tag on which to base the sprite image.
         * @param {Object} [options] - The {@link Transformation} parameters to include in the URL.
         * @return {string} The URL of the generated CSS file. The sprite image has the same URL, but with a PNG extension.
         * @see <a href="https://cloudinary.com/documentation/sprite_generation" target="_blank">
         *  Sprite generation</a>
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         */

      }, {
        key: "sprite_css",
        value: function sprite_css(publicId, options) {
          options = assign_root_assign_default()({
            type: 'sprite'
          }, options);

          if (!publicId.match(/.css$/)) {
            options.format = 'css';
          }

          return this.url(publicId, options);
        }
        /**
         * Initializes responsive image behavior for all image tags with the 'cld-responsive'
         *  (or other defined {@link Cloudinary#responsive|responsive} class).<br/>
         *  This method should be invoked after the page has loaded.<br/>
         *  <b>Note</b>: Calls {@link Cloudinary#cloudinary_update|cloudinary_update} to modify image tags.
         * @function Cloudinary#responsive
         * @param {Object} options
         * @param {String} [options.responsive_class='cld-responsive'] - An alternative class
         *  to locate the relevant &lt;img&gt; tags.
         * @param {number} [options.responsive_debounce=100] - The debounce interval in milliseconds.
         * @param {boolean} [bootstrap=true] If true, processes the &lt;img&gt; tags by calling
         *  {@link Cloudinary#cloudinary_update|cloudinary_update}. When false, the tags are processed
         *  only after a resize event.
         * @see {@link Cloudinary#cloudinary_update|cloudinary_update} for additional configuration parameters
         * @see <a href="https://cloudinary.com/documentation/responsive_images#automating_responsive_images_with_javascript"
         *  target="_blank">Automating responsive images with JavaScript</a>
         * @return {function} that when called, removes the resize EventListener added by this function
         */

      }, {
        key: "responsive",
        value: function responsive(options) {
          var _this = this;

          var bootstrap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          var ref, ref1, ref2, responsiveClass, responsiveResize, timeout;
          this.responsiveConfig = merge_root_merge_default()(this.responsiveConfig || {}, options);
          responsiveClass = (ref = this.responsiveConfig.responsive_class) != null ? ref : this.config('responsive_class');

          if (bootstrap) {
            this.cloudinary_update("img.".concat(responsiveClass, ", img.cld-hidpi"), this.responsiveConfig);
          }

          responsiveResize = (ref1 = (ref2 = this.responsiveConfig.responsive_resize) != null ? ref2 : this.config('responsive_resize')) != null ? ref1 : true;

          if (responsiveResize && !this.responsiveResizeInitialized) {
            this.responsiveConfig.resizing = this.responsiveResizeInitialized = true;
            timeout = null;

            var makeResponsive = function makeResponsive() {
              var debounce, ref3, ref4, reset, run, wait, waitFunc;
              debounce = (ref3 = (ref4 = _this.responsiveConfig.responsive_debounce) != null ? ref4 : _this.config('responsive_debounce')) != null ? ref3 : 100;

              reset = function reset() {
                if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
                }
              };

              run = function run() {
                return _this.cloudinary_update("img.".concat(responsiveClass), _this.responsiveConfig);
              };

              waitFunc = function waitFunc() {
                reset();
                return run();
              };

              wait = function wait() {
                reset();
                timeout = setTimeout(waitFunc, debounce);
              };

              if (debounce) {
                return wait();
              } else {
                return run();
              }
            };

            window.addEventListener('resize', makeResponsive);
            return function () {
              return window.removeEventListener('resize', makeResponsive);
            };
          }
        }
        /**
         * @function Cloudinary#calc_breakpoint
         * @private
         * @ignore
         */

      }, {
        key: "calc_breakpoint",
        value: function calc_breakpoint(element, width, steps) {
          var breakpoints = lodash_getData(element, 'breakpoints') || lodash_getData(element, 'stoppoints') || this.config('breakpoints') || this.config('stoppoints') || defaultBreakpoints;

          if (isFunction_root_isFunction_default()(breakpoints)) {
            return breakpoints(width, steps);
          } else {
            if (isString_root_isString_default()(breakpoints)) {
              breakpoints = breakpoints.split(',').map(function (point) {
                return parseInt(point);
              }).sort(function (a, b) {
                return a - b;
              });
            }

            return closestAbove(breakpoints, width);
          }
        }
        /**
         * @function Cloudinary#calc_stoppoint
         * @deprecated Use {@link calc_breakpoint} instead.
         * @private
         * @ignore
         */

      }, {
        key: "calc_stoppoint",
        value: function calc_stoppoint(element, width, steps) {
          return this.calc_breakpoint(element, width, steps);
        }
        /**
         * @function Cloudinary#device_pixel_ratio
         * @private
         */

      }, {
        key: "device_pixel_ratio",
        value: function device_pixel_ratio(roundDpr) {
          roundDpr = roundDpr == null ? true : roundDpr;
          var dpr = (typeof window !== "undefined" && window !== null ? window.devicePixelRatio : void 0) || 1;

          if (roundDpr) {
            dpr = Math.ceil(dpr);
          }

          if (dpr <= 0 || dpr === 0 / 0) {
            dpr = 1;
          }

          var dprString = dpr.toString();

          if (dprString.match(/^\d+$/)) {
            dprString += '.0';
          }

          return dprString;
        }
        /**
        * Applies responsiveness to all <code>&lt;img&gt;</code> tags under each relevant node
        *  (regardless of whether the tag contains the {@link Cloudinary#responsive|responsive} class).
        * @param {Element[]} nodes The parent nodes where you want to search for &lt;img&gt; tags.
        * @param {Object} [options] The {@link Cloudinary#cloudinary_update|cloudinary_update} options to apply.
        * @see <a href="https://cloudinary.com/documentation/image_transformation_reference"
        *  target="_blank">Available image transformations</a>
        * @function Cloudinary#processImageTags
        */

      }, {
        key: "processImageTags",
        value: function processImageTags(nodes, options) {
          if (isEmpty(nodes)) {
            // similar to `$.fn.cloudinary`
            return this;
          }

          options = defaults({}, options || {}, this.config());
          var images = nodes.filter(function (node) {
            return /^img$/i.test(node.tagName);
          }).map(function (node) {
            var imgOptions = assign_root_assign_default()({
              width: node.getAttribute('width'),
              height: node.getAttribute('height'),
              src: node.getAttribute('src')
            }, options);
            var publicId = imgOptions['source'] || imgOptions['src'];
            delete imgOptions['source'];
            delete imgOptions['src'];
            var attr = new src_transformation(imgOptions).toHtmlAttributes();
            lodash_setData(node, 'src-cache', url_url(publicId, imgOptions));
            node.setAttribute('width', attr.width);
            node.setAttribute('height', attr.height);
            return node;
          });
          this.cloudinary_update(images, options);
          return this;
        }
        /**
        * Updates the dpr (for `dpr_auto`) and responsive (for `w_auto`) fields according to
        *  the current container size and the device pixel ratio.<br/>
        *  <b>Note</b>:`w_auto` is updated only for images marked with the `cld-responsive`
        *  (or other defined {@link Cloudinary#responsive|responsive}) class.
        * @function Cloudinary#cloudinary_update
        * @param {(Array|string|NodeList)} elements - The HTML image elements to modify.
        * @param {Object} options
        * @param {boolean|string} [options.responsive_use_breakpoints=true]
        * Possible values:<br/>
        *  - `true`: Always use breakpoints for width.<br/>
        *  - `resize`: Use exact width on first render and breakpoints on resize.<br/>
        *  - `false`: Always use exact width.
        * @param {boolean} [options.responsive] - If `true`, enable responsive on all specified elements.
        *  Alternatively, you can define specific HTML elements to modify by adding the `cld-responsive`
        *  (or other custom-defined {@link Cloudinary#responsive|responsive_class}) class to those elements.
        * @param {boolean} [options.responsive_preserve_height] - If `true`, original css height is preserved.
        *  Should be used only if the transformation supports different aspect ratios.
        */

      }, {
        key: "cloudinary_update",
        value: function cloudinary_update(elements, options) {
          var _this2 = this;

          var containerWidth, dataSrc, match, requiredWidth;

          if (elements === null) {
            return this;
          }

          if (options == null) {
            options = {};
          }

          var responsive = options.responsive != null ? options.responsive : this.config('responsive');
          elements = normalizeToArray(elements);
          var responsiveClass;

          if (this.responsiveConfig && this.responsiveConfig.responsive_class != null) {
            responsiveClass = this.responsiveConfig.responsive_class;
          } else if (options.responsive_class != null) {
            responsiveClass = options.responsive_class;
          } else {
            responsiveClass = this.config('responsive_class');
          }

          var roundDpr = options.round_dpr != null ? options.round_dpr : this.config('round_dpr');
          elements.forEach(function (tag) {
            if (/img/i.test(tag.tagName)) {
              var setUrl = true;

              if (responsive) {
                lodash_addClass(tag, responsiveClass);
              }

              dataSrc = lodash_getData(tag, 'src-cache') || lodash_getData(tag, 'src');

              if (!isEmpty(dataSrc)) {
                // Update dpr according to the device's devicePixelRatio
                dataSrc = updateDpr.call(_this2, dataSrc, roundDpr);

                if (htmltag.isResponsive(tag, responsiveClass)) {
                  containerWidth = cloudinary_findContainerWidth(tag);

                  if (containerWidth !== 0) {
                    switch (false) {
                      case !/w_auto:breakpoints/.test(dataSrc):
                        requiredWidth = cloudinary_maxWidth(containerWidth, tag);
                        dataSrc = dataSrc.replace(/w_auto:breakpoints([_0-9]*)(:[0-9]+)?/, "w_auto:breakpoints$1:".concat(requiredWidth));
                        break;

                      case !(match = /w_auto(:(\d+))?/.exec(dataSrc)):
                        requiredWidth = applyBreakpoints.call(_this2, tag, containerWidth, match[2], options);
                        requiredWidth = cloudinary_maxWidth(requiredWidth, tag);
                        dataSrc = dataSrc.replace(/w_auto[^,\/]*/g, "w_".concat(requiredWidth));
                    }

                    lodash_removeAttribute(tag, 'width');

                    if (!options.responsive_preserve_height) {
                      lodash_removeAttribute(tag, 'height');
                    }
                  } else {
                    // Container doesn't know the size yet - usually because the image is hidden or outside the DOM.
                    setUrl = false;
                  }
                }

                var isLazyLoading = options.loading === 'lazy' && !_this2.isNativeLazyLoadSupported() && _this2.isLazyLoadSupported() && !elements[0].getAttribute('src');

                if (setUrl || isLazyLoading) {
                  // If data-width exists, set width to be data-width
                  _this2.setAttributeIfExists(elements[0], 'width', 'data-width');
                }

                if (setUrl && !isLazyLoading) {
                  lodash_setAttribute(tag, 'src', dataSrc);
                }
              }
            }
          });
          return this;
        }
        /**
         * Sets element[toAttribute] = element[fromAttribute] if element[fromAttribute] is set
         * @param element
         * @param toAttribute
         * @param fromAttribute
         */

      }, {
        key: "setAttributeIfExists",
        value: function setAttributeIfExists(element, toAttribute, fromAttribute) {
          var attributeValue = element.getAttribute(fromAttribute);

          if (attributeValue != null) {
            lodash_setAttribute(element, toAttribute, attributeValue);
          }
        }
        /**
         * Returns true if Intersection Observer API is supported
         * @returns {boolean}
         */

      }, {
        key: "isLazyLoadSupported",
        value: function isLazyLoadSupported() {
          return window && 'IntersectionObserver' in window;
        }
        /**
         * Returns true if using Chrome
         * @returns {boolean}
         */

      }, {
        key: "isNativeLazyLoadSupported",
        value: function isNativeLazyLoadSupported() {
          return 'loading' in HTMLImageElement.prototype;
        }
        /**
         * Returns a {@link Transformation} object, initialized with the specified options, for chaining purposes.
         * @function Cloudinary#transformation
         * @param {Object} options The {@link Transformation} options to apply.
         * @return {Transformation}
         * @see Transformation
         * @see <a href="https://cloudinary.com/documentation/image_transformation_reference" target="_blank">
         *  Available image transformations</a>
         * @see <a href="https://cloudinary.com/documentation/video_transformation_reference" target="_blank">
         *  Available video transformations</a>
         */

      }, {
        key: "transformation",
        value: function transformation(options) {
          return src_transformation["new"](this.config()).fromOptions(options).setParent(this);
        }
      }], [{
        key: "new",
        value: function _new(options) {
          return new this(options);
        }
      }]);

      return Cloudinary;
    }();

    assign_root_assign_default()(cloudinary_Cloudinary, constants_namespaceObject);
    /* harmony default export */ var cloudinary = (cloudinary_Cloudinary);
    // CONCATENATED MODULE: ./src/namespace/cloudinary-core.js
    /**
     * Creates the namespace for Cloudinary
     */
















    /* harmony default export */ var cloudinary_core = __webpack_exports__["default"] = ({
      ClientHintsMetaTag: clienthintsmetatag,
      Cloudinary: cloudinary,
      Condition: condition,
      Configuration: src_configuration,
      crc32: src_crc32,
      FetchLayer: fetchlayer,
      HtmlTag: htmltag,
      ImageTag: imagetag,
      Layer: layer_layer,
      PictureTag: picturetag,
      SubtitlesLayer: subtitleslayer,
      TextLayer: textlayer,
      Transformation: src_transformation,
      utf8_encode: src_utf8_encode,
      Util: lodash_namespaceObject,
      VideoTag: videotag
    });


    /***/ }),

    /***/ "lodash/assign":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_assign__;

    /***/ }),

    /***/ "lodash/cloneDeep":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_cloneDeep__;

    /***/ }),

    /***/ "lodash/compact":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_compact__;

    /***/ }),

    /***/ "lodash/difference":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_difference__;

    /***/ }),

    /***/ "lodash/functions":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_functions__;

    /***/ }),

    /***/ "lodash/identity":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_identity__;

    /***/ }),

    /***/ "lodash/includes":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_includes__;

    /***/ }),

    /***/ "lodash/isArray":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_isArray__;

    /***/ }),

    /***/ "lodash/isElement":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_isElement__;

    /***/ }),

    /***/ "lodash/isFunction":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_isFunction__;

    /***/ }),

    /***/ "lodash/isPlainObject":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_isPlainObject__;

    /***/ }),

    /***/ "lodash/isString":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_isString__;

    /***/ }),

    /***/ "lodash/merge":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_merge__;

    /***/ }),

    /***/ "lodash/trim":
    /***/ (function(module, exports) {

    module.exports = __WEBPACK_EXTERNAL_MODULE_lodash_trim__;

    /***/ })

    /******/ });
    });

    });

    var cloudinaryCore$1 = /*@__PURE__*/unwrapExports(cloudinaryCore);

    /**
     * Return object without null/undefined entries
     * @param {*} obj
     */
    const nonEmpty = (obj) => Object.entries(obj).reduce((a, [k, v]) => (v == null ? a : { ...a, [k]: v }), {});

    const getTag$1 = (props, tagType) => {
      const { public_id, ...ops } = nonEmpty(props); // Remove null/undefined props
      const cld = cloudinaryCore$1.Cloudinary.new(ops); // Initialize cloudinary with new props

      return cld[`${tagType}Tag`](public_id, ops);
    };

    /**
     * Get a new <img> tag initialized with given props
     * @param {*} props
     */
    const getImageTag = (props) => getTag$1(props, "image");

    /**
     * Cloudinary underlying JS library will handle responsive behavior
     * @param {HTMLImageElement} img
     * @param {object} options
     */
    const makeElementResponsive = (img, options) =>{
      const cld = cloudinaryCore$1.Cloudinary.new(options); // Initialize cloudinary with new props
      cld.cloudinary_update(img, options);
      cld.responsive(options, false);
    };

    /* src/Image.svelte generated by Svelte v3.23.2 */

    function create_fragment$g(ctx) {
    	let img;
    	let bindImage_action;
    	let mounted;
    	let dispose;
    	let img_levels = [{ alt: "" }, /*attributes*/ ctx[0]];
    	let img_data = {};

    	for (let i = 0; i < img_levels.length; i += 1) {
    		img_data = assign$1(img_data, img_levels[i]);
    	}

    	return {
    		c() {
    			img = element$1("img");
    			set_attributes(img, img_data);
    		},
    		m(target, anchor) {
    			insert$1(target, img, anchor);

    			if (!mounted) {
    				dispose = action_destroyer$1(bindImage_action = /*bindImage*/ ctx[1].call(null, img));
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			set_attributes(img, img_data = get_spread_update$1(img_levels, [{ alt: "" }, dirty & /*attributes*/ 1 && /*attributes*/ ctx[0]]));
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach$1(img);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const bindImage = node => imgElement = node;
    	let imgElement; // Reference to underlying <img> element

    	afterUpdate(() => {
    		if ($$props.responsive && imgElement) {
    			makeElementResponsive(imgElement, $$props);
    		}
    	});

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign$1(assign$1({}, $$props), exclude_internal_props$1($$new_props)));
    	};

    	let attributes;

    	$$self.$$.update = () => {
    		 $$invalidate(0, attributes = getImageTag($$props).attributes()); // The <img> attributes, computed on update.
    	};

    	$$props = exclude_internal_props$1($$props);
    	return [attributes, bindImage];
    }

    class Image extends SvelteComponent$1 {
    	constructor(options) {
    		super();
    		init$1(this, options, instance$g, create_fragment$g, safe_not_equal$1, {});
    	}
    }

    /* src/components/projects/OTmobile.svelte generated by Svelte v3.31.0 */
    const file$g = "src/components/projects/OTmobile.svelte";

    // (51:2) {#if carouselOpen}
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
    			add_location(div, file$g, 51, 4, 1718);
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
    		source: "(51:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div5;
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
    	let div3;
    	let image;
    	let t4;
    	let div4;
    	let p;
    	let t5;
    	let t6;
    	let div5_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projecttechgrid = new ProjectTechGrid({
    			props: { techUsed: /*techUsed*/ ctx[3] },
    			$$inline: true
    		});

    	image = new Image({
    			props: {
    				cloud_name: "de36vblcl",
    				public_id: "portfolio/images/OT/OThome_a0bmp4",
    				alt: "Overtime Tracker",
    				width: "200"
    			},
    			$$inline: true
    		});

    	let if_block = /*carouselOpen*/ ctx[0] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
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
    			div3 = element("div");
    			create_component(image.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			p = element("p");
    			t5 = text("Before breaking into the tech world I worked as a 9-1-1 Dispatcher. Due to the horrendous amount of\n      overtime, I became tired of wading through all of my calendar's events\n      to see when I was working week to week. I spun up this little app using\n      React Native, TypeScript, and different aspects of the Expo calendar API.\n      Identifying problems in my life and creating my own automated solutions\n      has been the most rewarding part of software development thus far.");
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div5 = claim_element(nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			header = claim_element(div5_nodes, "HEADER", { class: true });
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
    			div3 = claim_element(header_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			claim_component(image.$$.fragment, div3_nodes);
    			div3_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", {});
    			var div4_nodes = children(div4);
    			p = claim_element(div4_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Before breaking into the tech world I worked as a 9-1-1 Dispatcher. Due to the horrendous amount of\n      overtime, I became tired of wading through all of my calendar's events\n      to see when I was working week to week. I spun up this little app using\n      React Native, TypeScript, and different aspects of the Expo calendar API.\n      Identifying problems in my life and creating my own automated solutions\n      has been the most rewarding part of software development thus far.");
    			p_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t6 = claim_space(div5_nodes);
    			if (if_block) if_block.l(div5_nodes);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-7qmubs");
    			add_location(h2, file$g, 23, 6, 721);
    			attr_dev(i, "class", "fas fa-photo-video svelte-7qmubs");
    			add_location(i, file$g, 25, 8, 810);
    			attr_dev(div0, "class", "image-icon svelte-7qmubs");
    			add_location(div0, file$g, 24, 6, 753);
    			attr_dev(div1, "class", "title svelte-7qmubs");
    			add_location(div1, file$g, 22, 4, 695);
    			attr_dev(div2, "class", "header-left svelte-7qmubs");
    			add_location(div2, file$g, 28, 4, 871);
    			attr_dev(div3, "class", "thumbnail svelte-7qmubs");
    			add_location(div3, file$g, 31, 4, 949);
    			attr_dev(header, "class", "svelte-7qmubs");
    			add_location(header, file$g, 21, 2, 682);
    			attr_dev(p, "class", "svelte-7qmubs");
    			add_location(p, file$g, 41, 4, 1179);
    			add_location(div4, file$g, 40, 2, 1169);
    			attr_dev(div5, "class", div5_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"));
    			add_location(div5, file$g, 20, 0, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, header);
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
    			append_dev(header, div3);
    			mount_component(image, div3, null);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, p);
    			append_dev(p, t5);
    			append_dev(div5, t6);
    			if (if_block) if_block.m(div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*openCarousel*/ ctx[4], false, false, false),
    					listen_dev(div3, "click", /*openCarousel*/ ctx[4], false, false, false)
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
    					if_block.m(div5, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$darkmode*/ 2 && div5_class_value !== (div5_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-7qmubs"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projecttechgrid.$$.fragment, local);
    			transition_in(image.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projecttechgrid.$$.fragment, local);
    			transition_out(image.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(projecttechgrid);
    			destroy_component(image);
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
    		Image,
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OTmobile",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/projects/UxDashboard.svelte generated by Svelte v3.31.0 */
    const file$h = "src/components/projects/UxDashboard.svelte";

    // (144:2) {#if carouselOpen}
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
    			add_location(div, file$h, 144, 4, 3427);
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
    		source: "(144:2) {#if carouselOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
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
    	let br0;
    	let br1;
    	let span;
    	let t6;
    	let t7;
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
    			t0 = text("Test Data - Axos Bank");
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
    			t5 = text("Designed, wrote and implemented a data pipeline from the Testim.io test\n      automation framework. I extracted data from within the framework by\n      building a node.js/express api, which dumped the data into an\n      Elasticsearch cluster. I visualized the data in Kibana to enable teams to\n      check on the performance metrics of their applications in different\n      testing and production environments.\n      ");
    			br0 = element("br");
    			br1 = element("br");
    			span = element("span");
    			t6 = text("*Images shown do not use actual company data");
    			t7 = space();
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
    			t0 = claim_text(h2_nodes, "Test Data - Axos Bank");
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
    			t5 = claim_text(p_nodes, "Designed, wrote and implemented a data pipeline from the Testim.io test\n      automation framework. I extracted data from within the framework by\n      building a node.js/express api, which dumped the data into an\n      Elasticsearch cluster. I visualized the data in Kibana to enable teams to\n      check on the performance metrics of their applications in different\n      testing and production environments.\n      ");
    			br0 = claim_element(p_nodes, "BR", {});
    			br1 = claim_element(p_nodes, "BR", {});
    			span = claim_element(p_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t6 = claim_text(span_nodes, "*Images shown do not use actual company data");
    			span_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t7 = claim_space(div4_nodes);
    			if (if_block) if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-5epwbx");
    			add_location(h2, file$h, 117, 6, 2482);
    			attr_dev(i, "class", "fas fa-photo-video svelte-5epwbx");
    			add_location(i, file$h, 119, 8, 2576);
    			attr_dev(div0, "class", "image-icon svelte-5epwbx");
    			add_location(div0, file$h, 118, 6, 2519);
    			attr_dev(div1, "class", "title svelte-5epwbx");
    			add_location(div1, file$h, 116, 4, 2456);
    			attr_dev(div2, "class", "header-left svelte-5epwbx");
    			add_location(div2, file$h, 122, 4, 2637);
    			attr_dev(img, "class", "thumbnail svelte-5epwbx");
    			attr_dev(img, "width", "350");
    			if (img.src !== (img_src_value = "images/dashboardscreenshot.PNG")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "UX Dashboard");
    			add_location(img, file$h, 125, 4, 2715);
    			attr_dev(header, "class", "svelte-5epwbx");
    			add_location(header, file$h, 115, 2, 2443);
    			add_location(br0, file$h, 140, 6, 3314);
    			add_location(br1, file$h, 140, 12, 3320);
    			attr_dev(span, "class", "svelte-5epwbx");
    			add_location(span, file$h, 140, 18, 3326);
    			attr_dev(p, "class", "svelte-5epwbx");
    			add_location(p, file$h, 133, 4, 2887);
    			add_location(div3, file$h, 132, 2, 2877);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-5epwbx"));
    			add_location(div4, file$h, 114, 0, 2384);
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
    			append_dev(p, br0);
    			append_dev(p, br1);
    			append_dev(p, span);
    			append_dev(span, t6);
    			append_dev(div4, t7);
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

    			if (!current || dirty & /*$darkmode*/ 2 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$darkmode*/ ctx[1] ? "container-dark" : "container") + " svelte-5epwbx"))) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UxDashboard",
    			options,
    			id: create_fragment$i.name
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

    function create_fragment$j(ctx) {
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$j.name
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
    			attr_dev(iframe, "class", "iframe svelte-1gyss4t");
    			if (iframe.src !== (iframe_src_value = "images/resume.pdf")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "resume");
    			add_location(iframe, file$j, 9, 4, 158);
    			attr_dev(div, "class", "container svelte-1gyss4t");
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

    function create_fragment$k(ctx) {
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$k.name
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

    function create_fragment$l(ctx) {
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$l.name
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

    function create_fragment$m(ctx) {
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$m.name
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

    function create_fragment$n(ctx) {
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$n.name
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

    function create_fragment$o(ctx) {
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$o.name
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
