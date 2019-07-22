/** ____________________ X-TAG COMPONENTS ____________________ **/
/** ____________________
 * @message: 
 * - This document is commented all the way through if you would like to find a method or object try pressing
 * - `control + f`, if your on windows and doing a search for the name of the method or object, ect you need or want to 
 * - modify.  
 * -
 * - Comments written on this page will be provided as often as possible, please see the github wiki for more info on
 * - x-components.js and its commenting system. ___
 * 
 * Copyright 2018,
 * Licencse MIT 
 * 
 * 
 * @THANKS TO EVERY ONE WHO HAS CONTRIBUTED CODE TO THE CORE OF THIS OPEN SOURCE PROJECT.
____________________ **/

(function DashioFull() {
    // Check Globals
    if (!window.xtag) {
        window.xtag = {
            mixins: {},
            pseudos: {},
            addEvent: function AddEvent(node, type, fn) {
                console.log(node);
                node.addEventListener(type, fn);
            }

        };
    }

    /** ____________________
     * @note Methods and variables for tabbox
     * ** @name rules
     * ** @name _elements
     * ** @name _observers
    ____________________ **/
    const rules = {},
        _observers = {},
        _elements = {},
        _requests = {},
        _mod = { initiated: false };

    // Helper functions from X-Tag V-1
    function typeOf(obj) {
        let typeCache = {},
            typeString = typeCache.toString,
            type = typeString.call(obj),
            typeRegexp = /\s([a-zA-Z]+)/;
        return typeCache[type] || (typeCache[type] = type.match(typeRegexp)[1].toLowerCase());
    }
    function mergeOne(source, key, current) {
        let type = typeOf(current);
        if (type === 'object' && typeOf(source[key]) === 'object') { merge(source[key], current); }
        else { source[key] = clone(current, type); }
        return source;
    }
    function merge(source, k, v) {
        if (typeOf(k) === 'string') return mergeOne(source, k, v);
        for (let i = 1, l = arguments.length; i < l; i++) {
            let object = arguments[i];
            for (let key in object) { mergeOne(source, key, object[key]); }
        }
        return source;
    }
    function clone(item, type) {
        let fn = clone[type || typeOf(item)];
        return fn ? fn(item) : item;
    }
        clone.object = function (src) {
            let obj = {};
            for (let key in src) obj[key] = clone(src[key]);
            return obj;
        };
        clone.array = function (src) {
            let i = src.length, array = new Array(i);
            while (i--) array[i] = clone(src[i]);
            return array;
        };
    function QueryArray(arr, val) {
        if (xtag.typeOf(val) === "string") {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === val) { return i; }
            }
            return false;
        }
    }

    // Command cell regular expressions
    const testLiteralCmd = /\w+\{[\w\,]+\}\;/g,
          testArrayCmd = /\w+\[[\w\,]+\]\;/g,
          testStringCmd = /\w+\([\w\,]+\)\;/g,
          testNumberCmd = /\w+\|[\d\.]+\|\;/g;

    const states = {},
        insertRule = CSSStyleSheet.prototype.insertRule,
        deleteRule = CSSStyleSheet.prototype.deleteRule,
        regexpConditionMatch = /\s*state\s*:\s*(\w+)/;

    // StyleSheet 
    class CssWriter {
        constructor(name) {
            if (document.getElementById(name)) {
                this.Stylesheet = { ready: document.getElementById(name) };
            }
            else {
                let sy = document.createElement("style");
                sy.id = name;
                this.Stylesheet = { progressing: sy };
            }

            document.addEventListener('load', function LoadCss(e) {
                let node = e.target;
                if ((node.nodeName === 'LINK' || node.nodeName === 'STYLE') && node.sheet) {
                    Array.prototype.forEach.call(node.sheet.cssRules, function (rule) { css.parseRule(node, rule); });
                }
            }, true);

        }
        get Stylesheet() { return this.css.sheet; }
        set Stylesheet(_sy) {
            if (_sy.ready) {
                this.sheet = _sy.ready.sheet;
                this.style = _sy.ready;
            }
            else {
                let _syid = _sy.progressing.id;
                document.head.appendChild(_sy.progressing);
                this.sheet = document.getElementById(_syid).sheet;
                this.style = document.getElementById(_syid);
            }
        }
        transitions(elem, options, state) {
            if (state === "hide") {
                let _applyStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioned="${elem.getAttribute("transition-end")}"]{ -webkit-transition:`,
                    _deltaStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioned="${elem.getAttribute("transition-end")}"]{`;
                elem.setAttribute("transitioned", elem.getAttribute("transition-end"));
                elem.removeAttribute("transitioning");
                options.keys.forEach((item, index, source) => {
                    _applyStyle += `${item} ${options[item]}`;
                    _deltaStyle += `${item}: ${options.delta[item]}`;
                    let z = index + 1;
                    if (z === source.length) {
                        _applyStyle += `;}`;
                        _deltaStyle += `;}`;
                    }
                    else {
                        _applyStyle += `,`;
                        _deltaStyle += `;`;
                    }
                });
                sheet.insertRule(_applyStyle);
                sheet.insertRule(_deltaStyle);
            }
            else if (state === "show") {
                let _applyStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioning="${elem.getAttribute("transition-start")}"]{ -webkit-transition:`,
                    _deltaStyle = `${elem.nodeName.toLowerCase()}[type="${elem.getAttribute("type")}"][transitioning="${elem.getAttribute("transition-start")}"]{`;
                elem.setAttribute("transitioning", elem.getAttribute("transition-start"));
                elem.removeAttribute("transitioned");
                options.keys.forEach((item, index, source) => {
                    _applyStyle += `${item} ${options[item]}`;
                    _deltaStyle += `${item}: ${options.delta[item]}`;
                    let z = index + 1;
                    if (z === source.length) {
                        _applyStyle += `;}`;
                        _deltaStyle += `;}`;
                    }
                    else {
                        _applyStyle += `,`;
                        _deltaStyle += `;`;
                    }
                });
                sheet.insertRule(_applyStyle);
                sheet.insertRule(_deltaStyle);
            }
        }
        parseRule(node, rule, remove) {
            if (rule instanceof CSSSupportsRule) {
                let match = rule.conditionText.match(regexpConditionMatch);
                if (match) {
                    let state = states[match[1]];
                    let entries = (state || (state = states[match[1]] = { active: false, entries: [] })).entries;
                    let entry = rule.__CSSStateRule__ = {
                        sheet: node.sheet,
                        rule: rule,
                        text: '@media all {' + Array.prototype.reduce.call(rule.cssRules, function (str, z) {
                            return str + ' ' + z.cssText;
                        }, '') + '}'
                    };
                    entries.push(entry);
                    if (state.active) activateEntry(entry);
                }
            }
        }
        activateEntry(entry) {
            let index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.rule) + 1;
            entry.sheet.insertRule(entry.text, index);
            entry.active = entry.sheet.cssRules[index];
        }
        activate(name) {
            let state = states[name] || (states[name] = { entries: [] });
            state.active = true;
            state.entries.forEach(activateEntry);
        }
        deactivate(name) {
            let state = states[name];
            if (state && state.active) {
                state.active = false;
                state.entries.forEach(function (entry) {
                    let index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.active);
                    entry.sheet.deleteRule(index);
                    delete entry.active;
                });
            }
        }
    }

    // Create new CssWriter
    const css = new CssWriter("ApplicationInlineStyleElement"),
        sheet = css.sheet;

    // Pseudos
    (function _Pseudos_() {
        // Transitions
        class Transitions {
            constructor(options) { merge(this, options); this.allowed = []; }

            update(name, elem) {
                let delta = this[name];
                if (delta !== undefined && delta.ready === false) {
                    delta.ready = true;
                    this.attrs(this, name, {

                    });
                }
                else if (delta !== undefined && delta.ready === true) {
                    delta.ready = false;
                    delta.hide(elem);
                }
            }

            add(name, options) {
                this[name] = { id: name, attributes: options.attrs };
            }

            get attrs() {
                return function ApplyAttr(init, attr, state, override) {
                    if (state === "show") {
                        let val = null;

                        if (override !== undefined) { val = override; }
                        else { val = "true"; };
                        init === false ? this.removeAttribute(attr) : this.setAttribute(attr, val);
                    }
                    else if (state === "hide") {
                        let val = null;

                        if (override !== undefined) { val = override; }
                        else { val = "true"; };

                        init === false ? this.setAttribute(attr, val) : this.removeAttribute(attr);
                    }
                };
            }
            get style() {
                return function ApplyStyle(pseudo, state) {
                    let _style = pseudo.style,
                        _dt = _style.delta,
                        _keys = _style.keys;

                    css.transitions(this, _style, state);
                };
            }

        }
        let transitions = new Transitions({
            show: function Show(pseudo) {
                if (pseudo.override === undefined) {
                    transitions.attrs.apply(this, [transitions[pseudo.validated.name].initState, pseudo.validated.name, "show"]);
                    transitions.style.apply(this, [pseudo, "show"]);
                }
                else if (typeof pseudo.override === "string") {
                    transitions.attrs.apply(this, [pseudo.initState, pseudo.validated.name, "show"]);
                    transitions.style.apply(this, [pseudo, "show"]);
                }
                return true;
            },
            hide: function Hide(pseudo) {
                if (pseudo.override === undefined) {
                    transitions.attrs.apply(this, [transitions[pseudo.validated.name].initState, pseudo.validated.name, "hide"]);
                    transitions.style.apply(this, [pseudo, "hide"]);
                }
                else if (typeof pseudo.override === "string") {
                    console.log(pseudo);
                    transitions.attrs.apply(this, [pseudo.initState, pseudo.validated.name, "hide"]);
                    transitions.style.apply(this, [pseudo, "hide"]);
                }
                return true;
            }
        });

        xtag.addTransition = function AddTransition(name, options) { transitions.add(name, options); };

        xtag.pseudos.transition = {
            onCompiled: function OnCompiled(fn, pseudo) {
                let args = pseudo.arguments;

                this.style = pseudo.listener() || {
                    delta: {}
                };
                this.style.keys = Object.keys(this.style.delta);
                this.state = args[1];
                this.attrs = {};
                for (let c = 2; c < args.length; c++) {
                    this.attrs[args[c]] = { name: args[c], type: args[0] };
                }
                this.attrs.keys = Object.keys(this.attrs);
                this.show = `[show="${this.keys}"]`;
                this.hide = ``;
            },
            action: function (a, n) {
                // Execute action only if n is defined. 
                if (n === undefined) { return false; }
                let args = a.arguments;

                let _sat = this.getAttribute("transition-show") || "fade-in",
                    _hat = this.getAttribute("transition-hide") || "fade-out",
                    _st = transitions[_sat],
                    _ht = transitions[_hat];

                for (let i = 0; i < a.attrs.keys.length; i++) {
                    let _attr = this.hasAttribute(a.attrs.keys[i]) === true ? a.attrs[a.attrs.keys[i]].name : false,
                        _cstate = this.hasAttribute(a.attrs.keys[i]) === true ? true : false;

                    a.validated = a.attrs[a.attrs.keys[i]].type === "boolean" ? {
                        boolean: true,
                        string: false,
                        name: a.attrs[a.attrs.keys[i]].name,
                        value: this.getAttribute(a.attrs[a.attrs.keys[i]].name) || "",
                        duration: this.getAttribute("transition-duration") || "1s"
                    } : {
                            boolean: false,
                            string: a.attrs[a.attrs.keys[i]].type,
                            name: a.attrs[a.attrs.keys[i]].name,
                            value: this.getAttribute(a.attrs[a.attrs.keys[0]].name) || "",
                            duration: this.getAttribute("transition-duration") || "1s"
                        };

                    if (a.validated.boolean === true) {
                        transitions[a.validated.name] === undefined ? transitions[a.validated.name] = { initState: _cstate } : true;

                        a.state = _cstate === true ? "show" : args[1] === "show" ? ("show") : "hide";
                    }
                    else {
                        transitions[a.attrs.keys[i].name] !== undefined ? transitions[a.attrs.keys[i].name] = { initState: _cstate } : true;
                        a.state = _cstate === true ? "show" : args[1] === "show" ? ("show") : "hide";
                    }

                    a.transitions = {
                        hide: transitions[_hat],
                        show: transitions[_sat]
                    };

                    if (a.transitions[a.state].attributes[a.attrs.keys[i]] === args[0]) {
                        transitions[args[1]].apply(this, [a]);
                    }
                    else {
                        a.override = a.validated.value;
                        transitions[args[1]].apply(this, [a]);
                    }

                }

            }
        };

    })();

    let _setprog = 0;
    function noop(n) { return n || false; }
    class Model {
        constructor(_links, readyModelCallback) {
            if (!_links && !readyModelCallback) {
                this.requests = {};
                this.requests._progress = 0; 
                this.requests._loaded = 0; 
                this.requests.length = 0; 
            }
            else {
                this.requests = {}; 

                this.requests._progress = 0; 
                this.requests._loaded = 0; 
                this.requests.length = 0; 

                this.requests.mappings = readyModelCallback(); 
                this.requests.hrefs = this.getLinkHrefs(_links); 

                this.requests.keys = Object.keys(this.requests.mappings); 

                this.openModelLinks(); 
            } 
        }
        request(ref, options) {
            let _xhr = new XMLHttpRequest(),
                _id = ref.match(/[\w\-]+(?=\.\w+$)/g)[0];

            Dashing.requests ? true : Dashing.requests = {};
            Dashing.responses ? true : Dashing.responses = {};

            if (Dashing.requests[_id]) {
                return Dashing.responses[_id] ? Dashing.respones[_id] : false;
            }
            else {
                _xhr.open("GET", ref, true);

                _xhr.responseType = options.type ? options.type : "text";

                _xhr.onload = options.onload ? function LoadRef(e) {
                    Dashing.responses[_id] = e.target.responses;
                    options.onload(e);
                } : function LOADREF(e) {
                    Dashing.responses[_id] = e.target.responses;
                };

                _xhr.onprogress = options.onprogress ? options.onprogress : false;

                _xhr.onerror = options.onerror ? function ERRORREF(e) {
                    Dashing.responses[_id] = `Request Error: ${e.target.responseURL}`;
                    options.onerror(e);
                } : function ERRORREF(e) {
                    Dashing.responses[_id] = `Request Error: ${e.target.responseURL}`;
                };

                _xhr.send();

                Dashing.requests[_id] = _xhr;
                Dashing.responses[_id] = false;

                return _id;
            }
        }
        getLinkHrefs(links) {
            let _urlarray = [];
            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                if (link.hasAttribute("data-model") === true) {
                    let _href = link.getAttribute("href");
                        _urlarray.push(_href);
                    this.requests[_href.match(/[\w\-]+(?=\.[\w\-]+$)/g)[0]] = { appendResources: link.hasAttribute("append-resource") };
                }
            }
            return _urlarray;
        }
        openModelLinks(modelready) {
            let reqs = this.requests, 
                _links = reqs.hrefs;
            for (let z = 0; z < _links.length; z++) {
                let _href = _links[z].match(/[\w\-]+(?=\.[\w\-]+$)/g)[0],
                    _insert = reqs[_href],
                    _xlink = document.createElement(`x-link`),
                    _callbacks = reqs.mappings[_href];

                _xlink.load = _callbacks.load;
                _xlink.progress = _callbacks.progress;
                _xlink.error = _callbacks.error;

                _xlink.href = _links[z];

            }
        }
    }

    class Mappings {
        constructor(data, cases) {
            if (!data && !cases) {
                // 
            }
            else {
                //
            }
        }
        open(condition, cases) { }
        close(condition, cases) { }

        success(e, _super, _this) {

        }
        error(e, _super, _this) {

        }
    }

    class Validator extends Mappings {
        constructor(data, cases) {
            super();
            if (data === undefined || data === false || data === null) {
                this.case = false;
            }
            else if (xtag.typeOf(data) === "object") {
                this.case = data;
            }
        }
        open() {

        }
        add(_case, _cond, _def) {
            // Add key words passed as cases here.
            switch (_case) {
                case "startCase":
                    _cond.startCase = _cond;
                    return _def;
                case "finishCase":
                    _cond.finishCase = _cond;
                    return _def;
                default:
                    _cond.caseKeys === undefined ? (
                        _cond.caseKeys = [],
                        _cond.caseKeys.push(_case),
                        _cond[_case] = _def) : _cond.caseKeys.toString().match(_case) ? true : _cond.caseKeys.push(_case), _cond[_case] = _def;
                    return _def;
            }
        }
        set case(data) {
            if (data === undefined || data === false || data === null) {
                this.cached = {
                    current: null
                };
                this.cached.error = "Used falsey value for case setter. Please use the required object.";
            }
            else if (typeOf(data) === "object") {
                this.cached.error = false;
                this.cached.success = true;
                this.cached[data.id] ? "Not allowed to overwrite." : this.cached[data.id] = data;
            }
            else {
                this.cached.error = `Type error while setting case.`;
            } 
        }
        get case() {
            return function GetCase(name) {
                return this.cached[name] || false;
            };
        }
    }

    class Toggle {
        constructor(obj, args) {
            if (!args && !obj) {
                this.toggleGroups = false;
                this.toggle = null;
                this.display = null;
            }
            else {
                this.toggleGroups = { length: 0 };
                this.toggle = document.getElementById(args[0]);
                this.display = obj.display;
                if (obj.group === true) {
                    this.add("toggle-group", obj["toggle-group"]);
                }
                else if (obj.button === true) {
                    this.add("toggle-button", obj);
                }
            }
        }
        add(name, def) {
            switch (name) {
                case "toggle-group":
                    if (this.toggleGroups[def.name] === undefined) {
                        this.toggleGroups[def.name] = def;
                        // Create the group object and than assign events to the provided elements.
                    }
                    return name;
                case "toggle-button":
                    let tar = this.display;
                    xtag.addEvent(this.toggle, "click", function onShow(e) {
                        if (e.target.hasAttribute("active") === true) {
                            e.target.removeAttribute("active");
                            if (tar.hide) {
                                tar.hide();
                            }
                            else { console.info("Please provide a hide method form your custom element."); }
                        }
                        else {
                            e.target.setAttribute("active", "true");
                            if (tar.show) {
                                tar.show();
                            }
                            else { console.info("Please provide a show method form your custom element."); }
                        }
                    });
                    return name;
            }
        }
    }

    class CCSyntax {
        constructor(options) {
            this.commandCache = [];
            merge(this, options || {});
        }
        parseCCSLine(line) {
            let ln = "",
                paramln = "",
                arr = [],
                paramarr = [],
                stoken = false,
                istoken = "",
                _tokens = { "[": "arrays", "{": "literals", "(": "strings", "|": "numbers" };

            for (let z = 0; z < line.length; z++) {
                let chr = line[z];
                if (/\;/.test(chr)) {
                    arr.push({
                        cmd: ln,
                        params: paramarr,
                        token: istoken
                    });
                    ln = "";
                    paramarr = [];
                }
                else if (/[\{\[\(\|]/.test(chr) && stoken === false) {
                    stoken = true;
                    istoken = _tokens[chr];
                }
                else if (/[\}\]\)\|]/.test(chr)) {
                    paramarr.push(paramln);
                    paramln = "";
                    stoken = false;
                }
                else if (stoken === true && /\,/.test(chr) === true) {
                    paramarr.push(paramln);
                    paramln = "";
                }
                else if (stoken === true) { paramln += chr; }
                else { ln += chr; }
            }
            return arr;
        }
        compileCCSLine(_ccs, data) {
            let arr = [];
            for (let n = 0; n < data.length; n++) {
                let ccsobj = _ccs[data[n].token];
                arr.push({
                    cmd: this[data[n].cmd],
                    params: data[n].params
                });
            }
            return arr;
        }
        executeCCSStack(_ccs) {
            for (let z = 0; z < _ccs.length; z++) {
                _ccs[z].cmd.apply(this, [_ccs[z].params]);
            }
            return true;
        }
        // Command keys start
        write(args) { }
        create(args) {
            let _case = args[0];
            switch (_case) {
                case "databook":
                    let dbupdate = Dashing.pioDB.upgrade.apply(this, [Dashing.rootElement.jsonSchema[this.pluginTitle]]);

                    break;
                case "datasheet":
                    break;
                case "datalist":
                    break;
                case "datacell":
                    break;
            }
        }
        remove(args) { }
        edit(args) { }
        merge(args) { }
        sum(args) { }
        pow(args) { }
    }
    const ccs = new CCSyntax();

    class pioDB extends Validator {
        constructor(data) {
            super();
            this.status = {
                current: null,
                ready: false,
                progress: null,
                error: null,
            };
        }
        // @name InitDBConditions 
        InitDBConditions(_this) {
            let _messages = { allready: false },
                _trueCount = 0;
            for (let i = 0; i < _this.keys.length; i++) {
                _messages[_this.keys[i]] = _this.cased[_this.keys[i]]({}, _this.cased[_this.keys[i]]);
                _messages[_this.keys[i]].allready !== false ? _trueCount++ : false;
            }
            _trueCount === _this.keys.length ? _messages.allready = true : false;
            return _messages;
        }
        query(name, query) {
            let _dbq = window.indexedDB.open(name || "PioDashed", query.version || undefined);
            _dbq.onsuccess = function QueryOpenSuccess(e) {
                try {
                    let _dbqs = e.target.result,
                        storage = null,
                        _key = query.key;
                    // create an transaction object store.
                    storage = _dbqs.transaction(query.store, "readwrite").objectStore(query.store);
                    query.onfound(e);
                }
                catch (e) {
                    query[("onerror" || "noop")](e);
                    return { allready: false, message: `Error: Stores not upgraded for, ${name}` };
                }
                let _reqg = storage.get(_key);
                _reqg.onsuccess = query.success ? function QuerySuccess(e, fn) {
                    Dashing.DBReadyBoolean.queried ? Dashing.DBReadyBoolean.queried.push(query.store + "." + query.key) : false;
                    Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                    if (query.update === true) {
                        let data = e.target.result;
                        data = query.value;
                        let _put = storage.put(data, query.key);
                        _put.onsuccess = function PutSuccess(e) {
                            Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                        };
                        _put.onerror = function PutSuccess(e) { Dashing.DBReadyBoolean.currentQuery = e; };
                    }
                    query.success(e);
                    Dashing.pioDB.pio.init = lc;
                    return true;
                } :
                    function QuerySuccess(e) {
                        Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                        Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                        if (query.update === true) {
                            let data = e.target.result;
                            data = query.value;
                            let _put = storage.put(data, query.key);
                            _put.onsuccess = function PutSuccess(e) {
                                /* Enhancement needed. */
                                Dashing.DBReadyBoolean.initiated = true;
                            };
                            _put.onerror = function PutSuccess(e) { /* Enhancement needed. */ };
                        }
                        Dashing.rootElement.jsonSchema.meta.version += 1;
                        return true;
                    };
                _reqg.onerror = query.success ? function QueryError(e, fn) {
                    Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                    query.error(e);
                    Dashing.pioDB.pio.init = lc;
                    return false;
                } :
                    function QueryError(e) {
                        Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                        Dashing.rootElement.jsonSchema.meta.version += 1;
                        return false;
                    };
            };
            return _dbq;
        }
        queryAll(name, queries) {
            // Needs Enhancement
            for (let i = 0; i < query.keys.length; i++) {
                let _key = keys[i],
                    _req = _dbq.get(query._key);
            }
        }
        open(_name, _version) {
            this.status.current = _name ? _name : null;
            return _version ?
                window.indexedDB.open(_name, _version) :
                    window.indexedDB.open(_name);
        }
        upgrade(db, version, options) {
            if (typeof db === "string") {
                let _piup = window.indexedDB.open(db, version);

                _piup.onupgradeneeded = function PioUpgrade(e) {
                    if (options.upgrade) {
                        // 
                    }
                    else if (options.transactions) {
                        // 
                    }
                    else {
                        // 
                    }
                };

                _piup.onsuccess = function PioSucces(e) {
                    //
                };

                _piup.onerror = function OnError(e) {
                    // 
                };
            }
            else if (this.toString() === "[object HTMLElement]") {
                let _dbu = null;
                try {
                    _dbu = pioDB.open(this.pluginTitle, db.version);


                }
                catch (e) {
                    _dbu = Dashing.writer({
                        name: "_blank",
                        target: this
                    }, {
                            parent: {
                                fragment: xtag.createFragment(`<x-modal type="prompt"><div><p>ERROR</p></div></x-modal>`)
                            }
                        });
                }
            }
        }
    }

    let Dashing = null;
    class dashboard {
        constructor(dashed) {
            Dashing = this;
            let appHeader = document.head,
                keys = Object.keys(dashed),
                protokeys = [];

            // set xtags dependency namespace
            this.ce = dashed.ce;

            // set the namespace components
            this.namespaces = dashed.namespaces;
            // set the platform prompt
            this.platformPrompt = dashed.platformPrompt === undefined ? false : dashed.platformPrompt;
            // set the start screen
            this.startscreen = dashed.startscreen === undefined ? false : dashed.startscreen;
            // set the rootElement
            this.rootElement = document.querySelector(dashed.rootElement) || document.querySelector("x-extension");
            // set linked property
            this.linked = {};

                // Set added properties
                protokeys = Dashing.setAddedProps(dashed);

            // Fire keys
            Dashing.fireProps(dashed, keys, protokeys);

            // Init the onStart callback
            dashed.onStart === undefined ? null : dashed.onStart(dashboard.prototype);

            // Set a pio success callback
            this.onPioSuccess = dashed.onPioSuccess;

            // Set a pio transactions callback for upgrades
            this.onPioUprade = dashed.onPioUgrade;

            // Build Components 
            let elems = Dashing.build(dashed.namespaces, dashed);
            Dashing.built = elems;

            // Register Elements with x-tags if dashed.celements = true 
            if (dashed.celements === true) {
                let nms = Object.keys(Dashing.built);
                // Register the componensts using xtag's registration method. 
                for (let name = 0; name < nms.length; name++) {
                    xtag.register(Dashing.namespaces[name], Dashing.built[nms[name]]);
                }
            }
        }
        on(node, type, callback) { }
        typeOf(data) { return typeOf(data); }
        add(data) {
            switch (data.type) {
                case "prototype":
                    if (dashboard.prototype[data.name]) {
                        console.error("Error: The prototype, " + data.name + " is already present.");
                        break;
                    }
                    else {
                        dashboard.prototype[data.name] = new data.value();
                    }
                    break;
                case "event":
                    let _events = {},
                        keyed = Object.keys(data.value);
                    for (let i = 0; i < keyed.length; i++) {
                        keyed[i] !== "target" ? _events[keyed[i]] = data.value[keyed[i]] : false;
                    }
 
                    if (data.name === "window") {
                        Dashing.on(window, _events);
                        break;
                    }
                    else {
                        Dashing.on(document.querySelector(data.name), _events);
                    }
                    break;
                case "mixin":
                    xtag.mixins[data.name] = xtag.mixins[data.name] ? xtag.mixins[data.name] : data.value;
                    break;
                case "pseudo":
                    xtag.pseudos[data.name] = xtag.pseudos[data.name] ? xtag.pseudos[data.name] : data.value;
                    break;
                case "templates":
                    for (let i = 0; i < data.keys.length; i++) {
                        if (Dashing) {
                            Dashing.writer.templater(data.keys[i], data[data.keys[i]]);
                        }
                        else {
                            dashboard.prototype.writer.templater(data.keys[i], data[data.keys[i]]);
                        }
                    }
                    break;
                case "model":
                    break;
                case "link":
                    let xhr = new XMLHttpRequest();

                        xhr.open("GET", data.url, true); 

                        xhr.onload = data.load || function XhrModelLoadSuccess() { return true; };
                        xhr.onprogress = data.progress || function XhrProgress(e) { return true; }
                        xhr.onerror = data.error || function XhrModelError(e) { console[("error" || "log")]("XhrModel Error: " + e); };

                        xhr.send();

                    return xhr.response;
            }
        }
        update(data) {
            // 
        }
        build(nm, def) {
            let mxn = def.mixin,
                lc = def.lifecycle,
                acc = def.accessors,
                e = def.events,
                _proto_ = def.prototype,
                comps = function elems() { }
            // loop through namespaces
            for (let i = 0; i < (nm || []).length; i++) {
                // Parse name space to camel case
                let nms = nm[i].replace(/\-\w/g, function (stg) {
                    let r = stg.toUpperCase();
                    return r[1];
                });
                comps[nms] = {};
            }
            comps = def.elements(comps);
            return comps;
        }
        write(msg, target, frag) {
            // frag must be a function that return a HTMLElement
            let _frag = frag(msg);
            target.appendChild(_frag);
            return _frag;
        }
        writeJSON(type, data) {
            if (!this.templates[type.type]) {
                throw "Error Draw(type.type): The type of JSON you want to write doesn't exist.";
            }
            let templating = xtag.createFragment(`<template></template>`),
                _keyrootinput = document.createElement("input");

                _keyrootinput.setAttribute("json-root", type.keyName);
                _keyrootinput.setAttribute("column-span", "1 2");
                _keyrootinput.setAttribute("row-span", "1");
                _keyrootinput.type = "text";
                _keyrootinput.value = type.keyName;
                _keyrootinput.className = type.keyRootClass;

                type.keyClassName = "text-centered item-title";
                type.valueClassName = "text-centered item-title";

                templating = this.writer.draw({ name: type.type, target: templating }, { parent: data, child: type });
                templating.appendChild(_keyrootinput);

            return templating;
        }
        setAddedProps(dashed) {
            let keys = Object.keys(dashed),
                protokeys = [];
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i],
                    props = {};
                // Check to see if the key is an add property
                if (/^add/.test(key) === true) {
                    props = {
                        type: key.match(/\w+(?=\=)/g) ? key.match(/\w+(?=\=)/g)[0] : false,
                        name: key.match(/[^\=]+(?=\))/g) ? key.match(/[^\=]+(?=\))/g)[0] : false,
                        value: dashed[key]
                    };
                    props.type === "prototype" ? protokeys.push(props.name) : false;
                    Dashing.add(props);
                }
            }
            return protokeys;
        }
        fireProps(dashed, keys, protokeys) {
            let keyed = [];
            for (let i = 0; i < keys.length; i++) {
                let _key = keys[i],
                    _nameprop = _key.match(/^\w+(?=\()/g);
                if (_nameprop && _nameprop[0] && _nameprop[0] !== "add") {
                    protokeys.forEach(function checkProtoKeys(item, index) {
                        _nameprop = _nameprop ? _nameprop : false;
                        if (_nameprop[0] === item) {
                            let args = _key.match(/[^=\(]+(?=\))/g)[0];
                            new Dashing[_nameprop[0]](dashed[_key], args.match(/[^\,]+/g));
                            keyed.push(_key);
                        }
                    });
                }
            }
            return keyed;
        }
        isDataAttr(_node, _attr, _setattr) {
            let _dat = _node.hasAttribute("data-" + _attr),
                _att = _node.hasAttribute(_attr),
                _response = false,
                _attrtype = null;
            // find the data attribute if present
            _attrtype = _dat === true ? (_response = _node.getAttribute("data-" + _attr), "data-" + _attr) : _att === true ? (_response = _node.getAttribute(_attr), _attr) : false;
            // check if _setattr is defined
            _setattr !== undefined ? _node.setAttribute(_attrtype, _setattr) : false
            return _response;
        }
        BrowserInfo(appNavReady) {
            let browmtc = navigator.userAgent.match(/Firefox|OPR|Edge|Chrome/g),
                oldiOS = /OS [1-4]_\d like Mac OS X/i.test(navigator.userAgent),
                oldDroid = /Android 2.\d.+AppleWebKit/.test(navigator.userAgent),
                gingerbread = /Android 2\.3.+AppleWebKit/.test(navigator.userAgent),
                response = {};
            response.browser = browmtc ? browmtc[0] : "Error: The browser you're using couldn't be found.";
            response.oldiOS = oldiOS;
            response.oldDroid = oldDroid;
            response["android_v2-3"] = gingerbread;
            return response;
        }
        getObjectKeys(keys, obj, excludes) {
            if (keys === "*") {
                let _keys = Object.keys(obj),
                    _rex = {};
                for (let c = 0; c < excludes.length; c++) {
                    for (let k = 0; k < _keys.length; k++) {
                        if (_keys[k] !== excludes[c]) {
                            _rex[_keys[k]] = obj[_keys[k]];
                        }
                    }
                }
                return _rex;
            }
            let r = {};
            for (let i = 0; i < keys.length; i++) { r[keys[i]] = obj[keys[i]]; }
            return r;
        }
        fnQuery(query, fn, nullFn) {
            let qy = document.querySelector(query);
            return qy ? fn(qy) : (nullFn || noop)(qy);
        }
        createAccessor(selector) {
            return {
                get: function () {
                    return xtag.queryChildren(this, selector)[0];
                }
            };
        }
        get templates() { return dashboard.prototype.writer.templated || false; }
        set bounded(elem) {
            elem.bounds = {
                top: elem.getBoundingClientRect().top,
                left: elem.getBoundingClientRect().left,
                bottom: elem.getBoundingClientRect().bottom,
                right: elem.getBoundingClientRect().right,
                width: elem.getBoundingClientRect().width,
                height: elem.getBoundingClientRect().height
            };
        }
        set celements(val) {
            if (val === true) { /* */ }
            else {
                /* */
            }
        }
        get celements() {
            return {
                on: xtag.addEvent
            };
        }
        set platform(Platform) {
            // Enhancement: create a theme class with getters and setters for platform and other properties
            this.themed ? true : this.themed = {};
            this.themed.platform = Platform;
        }
        get platform() { return this.themed.platform || false; }
        get writer() {
            return {
                templated: {
                    "json-grid-div": function DivGrid(data, attrs) {
                        let keys = Object.keys(data),
                            _id = attrs.id ? "id='" + attrs.id + "'" : "",
                            _class = attrs.className ? "class='" + attrs.className + "'" : "",
                            _cols = attrs.colspan ? "data-colspan='" + attrs.colspan + "'" : "",
                            _rows = attrs.rows ? "data-row='" + attrs.rows + "'" : "",
                            _valueclassname = attrs.keyClassName,
                            _keyclassname = attrs.valueClassName;

                        let divnode = xtag.createFragment(`<div data-grid-template="2" ${_id} ${_class} ${_cols} ${_rows}></div>`);
                        for (let c = 0; c < keys.length; c++) {
                            let keyinput = document.createElement("input"),
                                valueinput = document.createElement("input");

                            keyinput.type = "text";
                            keyinput.value = keys[c];
                            keyinput.className = _keyclassname;
                            keyinput.setAttribute("json-key", keys[c]);
                            keyinput.setAttribute("data-colspan", "1");
                            keyinput.setAttribute("data-row", `${c + 2}`);

                            divnode.firstElementChild.appendChild(keyinput);

                            valueinput.type = "text";
                            valueinput.value = data[keys[c]];
                            valueinput.className = _valueclassname;
                            valueinput.setAttribute("json-value", data[keys[c]]);
                            valueinput.setAttribute("data-colspan", "2");
                            valueinput.setAttribute("data-row", `${c + 2}`);

                            divnode.firstElementChild.appendChild(valueinput);

                        }

                        return divnode;
                    },
                    "json-table": function JsonTable(table, data) {
                        let menutray = table.menuTray ? "data-menu-tray='" + table.menuTray + "'" : "",
                            _id = table.id ? "id='" + table.id + "'" : "",
                            _class = table.className ? "class='" + table.className + "'" : "",
                            _tableGrid = table.gridTemplate ? "data-grid-template ='" + table.gridTemplate + "'" : "",
                            _gridCol = table.gridCols ? "data-columns='" + table.gridCols + "'" : "",
                            _gridRow = table.gridRows ? "data-rows='" + table.gridRows + "'" : "",
                            _fmGrid = table.formGridTemplate ? "data-grid-template='" + table.formGridTemplate + "'" : "",
                            _fmGridSpan = table.formGridSpan ? "data-colspan='" + table.formGridSpan + "'" : "",
                            _fieldsetGridCols = table.fieldsetGridSpan ? "data-colspan='" + table.fieldsetGridSpan + "'" : "",
                            _btnGridCols = table.buttonGridSpan ? "data-colspan='" + table.buttonGridSpan + "'" : "",
                            _fmGridRow = table.formGridRow ? "data-row='" + table.formGridRow + "'" : "",
                            _href = table.href ? "data-href='" + table.href + "'" : "",
                            _buttonRow = table.buttonGridRow ? "data-row='" + table.buttonGridRow + "'" : "",
                            _fieldsetRow = table.fieldsetRow ? "data-row='" + table.fieldsetRow + "'" : "",
                            _keycolwidth = table.keyColWidth ? "grid-key-width='" + table.keyColWidth + "'" : "",
                            _themeSel = table.themeSelector ? "theme-selector='" + table.themeSelector + "'" : "",
                            _selTheme = table.selectableThemes ? "selectable-themes='" + table.selectableThemes + "'" : "",
                            _cellMenuSpan = table.cellMenuSpan ? "cell-menu-span='" + table.cellMenuSpan + "'" : "",
                            _cellMenuRow = table.cellMenuRow ? "cell-menu-row='" + table.cellMenuRow + "'" : "",
                            _submitValue = table.submitValue ? table.submitValue : "",
                            _message = table.message ? table.message : "";

                        let frag = `<x-table type="json" theme="default-JsonSchema" ${_cellMenuSpan} ${_cellMenuRow} ${_id} ${_class} ${menutray} ${_id} ${_tableGrid} ${_gridCol} ${_gridRow} ${_href} ${_themeSel} ${_selTheme}>
                                <form data-table="true" ${_fmGridRow} ${_keycolwidth} ${_fmGrid}>
                                    <fieldset ${_fieldsetGridCols} ${_fieldsetRow}>
                                        <legend>${data.headertitle || "<p>Welcome to your reporting station.</p>"}</legend>
                                        ${_message || `<p>Welcome!</p>`}
                                        <button type="button" data-icon="gh" value="GH Login" name="gh-signin">
                                            <svg width="25px" height="25px">
                                                <use xlink:href="#github" />
                                            </svg>
                                            <strong>GH Login</strong>
                                        </button>
                                    </fieldset>
                                    <button type="button" data-icon="print" data-modal="topQuickbar" data-event="true" name="print-json" value="${_submitValue}" ${_btnGridCols} ${_buttonRow}>
                                        <svg width="25px" height="25px">
                                            <use xlink:href="#print"></use></svg>
                                        <strong>${_submitValue}</strong>
                                    </button>
                                </form>
                            </x-table>`;

                        return xtag.createFragment(frag);
                    },
                    "selection-prompt": function SelectionPrompt(_prompt, selection) {
                        let _opts = typeof _prompt.values === "undefined" ? '' : JSON.stringify(_prompt.values),
                            _msg = typeof _prompt.message === "undefined" ? "" : _prompt.message,
                            _class = _prompt.class === undefined ? "modal-prompt" : _prompt.class,
                            _id = _prompt.id === undefined ? "modal-prompt" : _prompt.id,
                            _focus = _prompt.focus === undefined ? "" : "data-focus='" + _prompt.focus + "'",
                            _active = _prompt.active === undefined ? "" : "active='" + _prompt.active + "' overlay=''";

                        return xtag.createFragment(`<x-modal id="${_id}" class="${_class}" modal-index="${document.getElementsByTagName("x-modal").length + 1}" type="selection" data-focus="true" data-options='${_opts}' theme="single-column" grid-template="1" ${_active} ${_focus} >
                                    <section class="text-warning"><p>${_msg}</p></section>
                                </x-modal>`);
                    },
                    "prompter": function Prompter(prompt, _form) {
                        let _pid = prompt.id !== undefined ? `id="${prompt.id}"` : "",
                            _pclass = prompt.class !== undefined ? `class="${prompt.class}"` : "",
                            _pmessage = prompt.message !== undefined ? prompt.message : "",
                            _fmessage = _form.message !== undefined ? _form.message : "",
                            _fid = _form.id !== undefined ? `id="${_form.id}"` : "",
                            _fclass = prompt.class !== undefined ? `class="${_form.class}"` : "";
                        let _confirm = "";
                        if (_form.confirm !== undefined && _form.confirm === true) { _confirm = `<input type="button" value="Confirm" />`; }
                        let _prompter = `<x-modal type="prompt"  ${_pid} ${_pclass}>
                            <section prompt-message="true">${_pmessage}</section>
                            <form ${_fid} ${_fclass}>
                                <fieldset>
                                    ${_fmessage}
                                </fieldset>
                                ${_confirm}
                            </form>
                        </x-modal>`;
                        return xtag.createFragment(_prompter);
                    },
                    "_blank": function _Blank(template, details) {
                        let parent = template.fragment || xtag.createFragment(`div`);
                        parent.firstElementChild.innerHTML = details.omsg || "";
                        return parent;
                    },
                    "table-cell": function TableCell(_table, opts) {
                        let frag = xtag.createFragment(`<form> 
                            <section> 
                                <strong>$:</strong> <input type="text" placeholder="#" /> 
                                <button type="button" value="Confirm">Confirm</button> 
                            </section> 
                        </form>`);
                        return frag;
                    },
                    length: 5
                },
                templater: function templater(named, templatee) {
                    this.templated.length++;
                    this.templated[named] = templatee;
                },
                draw: function draw(type, attrs, frags, hasTypeCallback) {
                    let _frag = this.templated[type.name](attrs.parent, attrs.child).firstElementChild;

                    // check for hasTypeCallback parameter callback must be named [not anonymouse] [Needs Implementation] 
                    if (typeof hasTypeCallback === "object") { this[type.name] = hasTypeCallback; }
                    frags ? _frag.appendChild(frags) : null;
                    // check for template callback that accompanies the template type 
                    if (this[type.name] && typeof this[type.name].creator === "function") { this[type.name].creator(_frag, attrs || false); }
                    // append node to type target root 
                    type.target.appendChild(_frag);
                    if (this[type.name] && typeof this[type.name].events === "object") { Dashing.on(type.target, this[type.name].events); }
                    return _frag;

                }
            };
        }
    }

    Dashing = new dashboard({
        namespaces: [
            "x-extension",
            "x-book",
            "x-page",
            "x-table",
            "x-header",
            "x-footer",
            "x-menu",
            "x-shiftbox",
            "x-tabbox",
            "x-modal",
            "x-message",
            "x-link",
            "x-json"
        ],
        onStart: function StartFullDemo(root) {
            // 
        },
        startscreen: document.querySelector("#demo-extension"),
        onModelLoaded: function OnModelLoaded() {
            //
        },
        onPioSuccess: function (e) {
            //
        },
        elements: function Components(elems) {
            elems.xLink = class xLink extends HTMLElement {
                appendResources(target, frag) {
                    if (target) {
                        target.appendChild(frag);
                    }
                    else {
                        this.appendChild(frag);
                    }
                }
                parseResources(data) {
                    //
                }
                attrs() {
                    return {
                        load: {
                            set: function (fn) { this._load = fn; },
                            get: function () { return this._load; }
                        },
                        progress: {
                            set: function (fn) { this._progress = fn; },
                            get: function () { return this._progress; }
                        },
                        error: {
                            set: function (fn) { this._error = fn; },
                            get: function () { return this._error; }
                        },
                        href: {
                            get: function GetHref() { return this.getAttribute("href"); },
                            set: function SetHref(val) {
                                let opts = {};
                                    opts.onerror = this.error || noop;
                                    opts.onload = this.load || noop;
                                    opts.onprogress = this.progress || noop;
                                Dashing.model.request(val, opts) || noop;
                            }
                        }
                    };
                }
            };

            elems.xExtension = class xExtension extends HTMLElement {
                // Mixins 
                static mixins() { return ["dashed", "typed", "themed"]; }
                // Methods 
                static methods() {
                    return {
                        userRequestServices: function UserRequestServices(isInNeedOf, target, assistant, optionals) {
                            // get the reqeusted service 
                            switch (isInNeedOf) {
                                case "prompt":
                                    let _dbid = xtag.uid().toString();
                                    Dashing.writer.draw({ name: "_blank", target: target },
                                        {
                                            parent: {
                                                fragment: xtag.createFragment(`<x-table id="${_dbid}" type="indexed-database" theme="db-responses" database-active="PioDashed" allow-pagination="true" allow-menu="DB Menu" menu-position="top" allow-refresh="true"></x-table>`)
                                            },
                                            child: {
                                                omsg: assistant
                                            }
                                        },
                                        xtag.createFragment(
                                            `<svg width="25px" height="25px" class="rel spinner-1" data-svg-icon="hourglass-start">
                                                <use class="database-hourglass" width="25px" height="25px" xlink:href="#hourglass-start" />
                                            </svg>`),
                                        {
                                            creator: function Creator(doc) {
                                                // To do
                                            }
                                        }
                                    );
                                    return true;
                                case "camera":
                                    return;
                                case "microphone":
                                    return;
                                case "gyroscope":
                                    return;
                                case "compass":
                                    return;
                                case "location":
                                    return;
                                default:
                                    return "Error: No User request service exists named: " + isInNeedOf;
                            }
                        },
                        getFormValues: function GetFormValues(_form) {
                            let _obj = {};
                            return _obj;
                        },
                        checkUrl: function CheckUrl(url) {
                            let urltest = /url\([\w\-\.]+\)/gi.test(url);
                            if (urltest === true) {
                                let _url = url.replace(/url\(/g, "");
                                    _url = _url.replace(/\)/g, "");
                                return _url;
                            }
                            else { return false; }
                        }, 
                        requestHTML: function RequestHTML(url, load, progress, error) {
                            let _url = this.checkUrl(url);
                            if (_url !== false) {
                                Dashing.model.request(_url, {
                                    type: "document",
                                    onload: load,
                                    onerror: error,
                                    onprogress: progress
                                });
                            }
                        },
                        requestJson: function RequestJson(url, load, progress, error) {
                            let _url = this.checkUrl(url); 
                            if (_url !== false) {
                                Dashing.model.request(_url, {
                                    type: "json",
                                    onload: load,
                                    onerror: error,
                                    onprogress: progress
                                });
                            }
                        },
                        queryJson: function QueryJsonPromise(key, data) {
                            let _this = this,
                                keyId = key[0];
                            return new Promise(function QPromise(resolve, reject) {
                                if (Dashing.typeOf(data) === "object") {
                                    if (keyId === "#") {
                                        objterm = "#" + data[key].id;
                                    }
                                    else if (keyId === ".") {
                                        objterm = "." + data[key].class;
                                    }
                                    else if (keyId === "-") {
                                        objterm = "-" + data[key].name;
                                    }
                                    else if (/^\w+/gi.test(key) === true) {
                                        objterm = keyId;
                                    }

                                    if (objterm === key) {
                                        return resolve(data[i]);
                                    }
                                    return resolve(data[key] || false);
                                }
                                else if (Dashing.typeOf(data) === "array") {
                                    for (let i = 0; i < data.length; i++) {
                                        if (Dashing.typeOf(data[i]) === "object" || Dashing.typeOf(data[i]) === "array") {
                                            _this.queryJson(key, data[i]);
                                        }
                                        else if (Dashing.typeOf(data[i] === "string")) {
                                            if (data[i] === key) {
                                                return resolve(data[i]);
                                            }
                                        }
                                        else if (Dashing.typeOf(data[i] === "array")) {
                                            return _this.queryJson(key, data[i]);
                                        }
                                    }
                                }
                                else if (Dashing.typeOf(data) === "nodelist") {
                                    let objId = null;
                                    for (let i = 0; i < data.length; i++) {
                                        let j = JSON.parse(data[i].innerHTML);
                                        let keyId = key[0],
                                            objterm = null;

                                        if (keyId === "#") {
                                            objterm = "#" + j.id;
                                        }
                                        else if (keyId === ".") {
                                            objterm = "." + j.class;
                                        }
                                        else if (keyId === "-") {
                                            objterm = "-" + j.name;
                                        }
                                        else if (/^\w+/gi.test(keyId) === true) {
                                            objterm = j[key];
                                        }
                                        if (objterm === key) {
                                            return j;
                                        }
                                    }
                                }
                                else {
                                    return reject(key);
                                }
                                return null;
                            });

                        },
                        queryArray: QueryArray
                    };
                }

                // Lifecycle Callbacks
                static lifecycle() {
                    return {
                        created: function CreatedXExtension() {
                            this.jsonSchema = [];

                        },
                        inserted: function InsertedXExtension() {
                            // 
                        },
                        removed: function RemovedXExtension() {
                            this.closeDashed(this.schemes);
                        }
                    };
                }

                // Attributes
                static attrs() {
                    return {
                        icos: {
                            connected: true,
                            set: function SetIcos(val) {
                                let _this = this;
                                if (Dashing.typeOf(val) === "string") {
                                    let urltest = this.checkUrl(val);
                                    if (urltest !== false) {
                                        this.requestHTML(val, function OpenIcons(e) {
                                            let icos = e.target.response;
                                                _this.appendChild(icos.firstElementChild);
                                                _this.setAttribute("icos", "true");
                                        });
                                    }
                                }

                            },
                            get: function GetIcos(val) { return this.getAttribute("icos") || false; }
                        },
                        schema: {
                            connected: true,
                            set: function SetSchemes(jsnString) {
                                if (Dashing.typeOf(jsnString) === "string") {
                                    try {
                                        let urltest = /url\([\w\-\.]+\)/gi.test(jsnString);
                                        if (urltest === true) {
                                            let _this = this;
                                            let r = this.requestJson(jsnString,
                                                function LoadSchema(e) { 
                                                    _this.setAttribute("schema", "true"); 
                                                    _this.jsonSchema.push(e.target.response); 
                                                }
                                            );
                                        }
                                        else if (Dashing.typeOf(jsnString) === "string"
                                            && /^#[\w\-]+/gi.test(jsnString)) {
                                            this.jsonSchema.push(JSON.parse(jsnString));
                                            this.setAttribute("schema", "true");
                                        }

                                    }
                                    catch (e) {
                                        this.setAttribute("schema", "error"); 
                                    }
                                    finally {
                                        let xjsn = this.querySelectorAll("x-json");
                                        for (let x = 0; x < xjsn.length; x++) {
                                            this.jsonSchema.push(JSON.parse(xjsn[x].innerHTML));
                                        }
                                        xjsn.length > 0 ?
                                            this.setAttribute("schema", "true") : 
                                                this.setAttribute("schema", "false");
                                    }
                                }
                            },
                            get: function GetSchemes() { return this.getAttribute("schema") || false; }
                        }
                    };
                }

                // Events
                static events() {
                    return {
                        config: function Config(e) {
                            // 
                        }
                    };
                }
            };

            elems.xBook = class xBook extends HTMLElement {
                static mixins() { return ["dashed", "typed", "themed"]; }

                static lifecycle() {
                    return {
                        created: function Created() {
                            let book = this;
                            this.querySelectorAll("x-page").forEach(function (node, i) {
                                if (Number(book.page) - 1 === i) { node.active = true; }
                            });

                        },
                        inserted: function Inserted() {
                            this.allowTabs = this.allowTabs;
                        }
                    };
                }

                static methods() {
                    return {
                        createTabButtons: function CreateBookTabButtons() {
                            let ti = this.querySelectorAll("x-page");

                                // 
                        }
                    };
                }

                static attrs() {
                    return {
                        page: {
                            set: function (val) { val ? this.setAttribute("page", val) : false; },
                            get: function () { return this.getAttribute("page"); }
                        },
                        bookControls: {
                            connected: true,
                            get: function GetBookControls() {
                                return this.getAttribute("book-controls") || false;
                            },
                            set: function SetBookControls(val) {
                                if (xtag.typeOf(val) === "string") {
                                    Dashing.fnQuery(`#${val}`, function BookControlsFn(resizer) {
                                        // 
                                    }, function BookControlsNullFn() {
                                            //
                                        });
                                }
                            }
                        },
                        bookResizer: {
                            connected: true,
                            get: function GetBookResizer() {
                                return this.getAttribute("book-resizer") || false;
                            },
                            set: function SetBookResizer(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    Dashing.fnQuery(`#${val}`, function BookResizerFn(resizer) {
                                        // 
                                    }, function BookResizerNullfn(resizer) {
                                            //
                                        });
                                }
                            }
                        },
                        tabbedBook: {
                            connected: true,
                            get: function GetTabbedBook() {
                                return this.getAttribute("tabbed-book") || false;
                            },
                            set: function SetTabbedBook(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    Dashing.fnQuery(`#${val}`);
                                }
                            }
                        }

                    };
                }

                static events() {
                    return {
                        'click:delegate(button[page-left="true"])': function PageLeft(e) {
                            let index = Number(this.parentNode.page),
                                pages = this.parentNode.querySelectorAll("x-page");
                            if (index <= 1) {
                                this.parentNode.page = pages.length;
                                pages[0]._hide();
                                pages[pages.length - 1]._show();
                            }
                            else {
                                this.parentNode.page = Number(index - 1);
                                pages[index - 1]._hide();
                                pages[index - 2]._show();
                            }
                        },
                        'click:delegate(button[page-right="true"])': function PageRight(e) {
                            let index = Number(this.parentNode.page),
                                pages = this.parentNode.querySelectorAll("x-page");
                            if (index >= pages.length) {
                                this.parentNode.page = 1;
                                pages[pages.length - 1]._hide();
                                pages[0]._show();

                            }
                            else {
                                this.parentNode.page = Number(index + 1);
                                pages[index - 1]._hide();
                                pages[index]._show();

                            }
                        }
                    };
                }

            };

            elems.xPage = class xPage extends HTMLElement {
                static mixins() { return ["typed", "themed"]; }

                static lifecycle() {
                    return {
                        create: function created() {
                            this.activeContent ? this.activeContent = this.activeContent : null;
                        }
                    };
                }

                static methods() {
                    return {
                        '_hide:transition(boolean,hide,selected,active)': function _Hide(fn) {
                            if (fn === undefined || fn === false) {
                                return {
                                    height: "1s",
                                    width: "1s",
                                    left: "1s",
                                    opacity: "1s",
                                    delta: {
                                        left: "0%",
                                        height: "100%",
                                        width: "100%",
                                        opacity: "1"
                                    },
                                    initial: {
                                        left: "100%",
                                        height: "0%",
                                        width: "0%",
                                        opacity: "0"

                                    }
                                };
                            }
                            else {
                                let r = typeof fn === "function" ? fn() : false;
                                return r;
                            }
                        },
                        '_show:transition(boolean,show,selected,active)': function _Show(fn) {
                            if (fn === undefined || fn === false) {
                                return {
                                    height: "1s",
                                    width: "1s",
                                    left: "1s",
                                    delta: {
                                        height: "100%",
                                        width: "100%",
                                        left: "0%"
                                    },
                                    initial: {
                                        height: "0%",
                                        width: "0%",
                                        left: "100%"

                                    },
                                    target: `x-page[selected][active][show=""]`
                                };
                            }
                            else {
                                let r = typeof fn === "function" ? fn() : false;
                                return r;
                            }
                        }
                    };
                }

                static attrs() {
                    return {
                        pluginTitle: {
                            set: function SetPluginPage(val) {
                                this.title = val;
                                this.setAttribute("plugin-title", val);
                            },
                            get: function GetPluginPage() { return this.getAttribute("plugin-title"); }
                        },
                        active: {
                            set: function SetActive(val) { this._show(); },
                            get: function GetActive() { return this.getAttribute("active"); }
                        },
                        activeContent: {
                            get: function GetActivePluginContent() { return this.getAttribute("active-content") || false; },
                            set: function SetActivePluginContent(val) {
                                if (val === false) { return false; }
                                this.setAttribute("active-content", val);
                                this.currentContent = Dashing.model.XHR(val, {
                                    node: this,
                                    onload: function Load(e) {
                                        let frag = xtag.createFragment(`${e.target.response}`),
                                            _content = frag.firstElementChild.content.firstElementChild,
                                            _jsn = _content.nextElementSibling,
                                            _script = null,
                                            _css = frag.firstElementChild.content.querySelectorAll("style");

                                        try { _jsn = JSON.parse(`${_jsn.innerHTML}`); }
                                        catch (e) { console.error(e); }

                                        document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_content);
                                        document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_css[0]);

                                        if (!_jsn) { return true; }
                                        if (_jsn.scripts) {
                                            for (let i = 0; i < _jsn.scripts.keys.length; i++) {
                                                _script = document.createElement("script");
                                                _script.src = _jsn.scripts[_jsn.scripts.keys[i]];
                                                document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_script);
                                            }
                                        }
                                        if (_jsn.data) { this.node.DATA = _jsn.data; }

                                    },
                                    onprogress: function Progress(e) {

                                    },
                                    onerror: function Error(e) {

                                    }
                                });
                            }
                        },
                        selected: {
                            get: function GetSelected(val) { return this.getAttribute("selected"); }
                        },
                        transitionStart: {
                            get: function GetTransitionStart() { return this.getAttribute("tranisition-start"); }
                        },
                        transitionEnd: {
                            get: function GetTransitionStart() { return this.getAttribute("tranisition-end"); }
                        },
                        page: {
                            get: function () {
                                return this.getAttribute("page");
                            },
                            set: function (val) {
                                this.setAttribute("page", val);
                            }
                        },
                        pages: {
                            get: function () {
                                return this.getAttribute("pages");
                            },
                            set: function (val) {
                                this.setAttribute("pages", val);
                                if (this.parentNode.nodeName === "X-BOOK") {
                                    this.Pages = this.parentNode.querySelectorAll(`x-page`);
                                }
                            }
                        },
                        index: {
                            get: function () {
                                return Number(this.getAttribute("index"));
                            },
                            set: function (val) {
                                this.setAttribute("index", val);
                            }
                        },
                        pageWorkspace: {
                            set: function SetWorkspace(val) {
                                this.setAttribute("page-workspace", val);
                                this.workspace = document.getElementById(val);
                            },
                            get: function GetWorkspace() { return this.getAttribute("page-workspace"); }
                        },
                        pageSidebar: {
                            set: function SetPageSidebar(val) {
                                this.setAttribute("page-sidebar", val);
                                this.sidebar = document.getElementById(val);
                            },
                            get: function GetPageSidebar() { return this.getAttribute("page-sidebar"); }
                        },
                        workspaces: {
                            set: function SetWorkspaces(val) {
                                this._workspace ? true : this._workspace = { length: 0 };

                                this._workspace[val.id] ? this.setAttribute("workspaces", `Info: ${val.id} already defined.`) :
                                    (this._workspace[val.id] = val, this._workspace.length += 1, this.setAttribute("workspaces", "true"));

                            },
                            get: function GetWorkspaces() { return function GetWorkspace(val) { return this._workspace[val]; }; }
                        },
                        pluginHeader: {
                            set: function SetPluginHeader(val) {
                                val === true ? this._pluginHeader = this.querySelector("x-header") || this.querySelector("header") : this._pluginHeader = false;
                            },
                            get: function GetPluginHeader() {
                                return this._pluginHeader;
                            }
                        },
                        pluginFooter: {
                            set: function SetPluginFooter(val) {
                                val === true ? this._pluginFooter = this.querySelector("x-header") || this.querySelector("header") : this._pluginFooter = false;
                            },
                            get: function GetPluginFooter() { return this._pluginFooter; }
                        }
                    };
                }

                static events() {
                    return {
                        "mousedown": function (e) {
                            if (e.target.nodeName === "BUTTON" && e.target.hasAttribute("sidebar-event") === true) {
                                let nm = e.target.getAttribute("sidebar-event");

                                this.silo[nm](e);
                            }
                        }
                    };
                }
            };

            elems.xHeader = class xHeader extends HTMLElement {
                static mixins() { return ["dashed", "typed", "themed"]; }
            };

            elems.xFooter = class xFooter extends HTMLElement {
                static mixins() { return ["dashed", "typed", "themed"]; }


            };

            // x-menu is compatible with template strings.
            elems.xMenu = class xMenu extends HTMLElement {
                constructor() {
                    super();
                    this.display = null;
                    this.content = null;
                    this.templateItems = null;
                    this.currentIndex = 0;
                }
                static methods() {
                    return {
                        createTabButton: function CreateTabButton(_id) {
                            let _title = _id.replace("-", " "),
                                _tabbtn = document.createElement("button");
                            _tabbtn.setAttribute("panel-content", _id);
                            _tabbtn.innerHTML = _title.replace(/^[a-z]|\s[a-z]/ig, function (stg) { return stg.toUpperCase(); });
                            this.insertAdjacentElement("beforeend", _tabbtn);
                        },
                        "x-extension-demo": function XExtensionDemo() {
                            return `<textarea>
                                <x-extension></x-extension>
                            </textarea>`;
                        },
                        "x-panel-demo": function XExtensionDemo() {
                            return `<textarea>
                                <x-panel></x-panel>
                            </textarea>`;
                        }
                    };
                }
                static attrs() {
                    return {
                        "display-target": {
                            connected: true,
                            get: function GetActiveDisplay() {
                                return this.getAttribute("display-target");
                            },
                            set: function SetActiveDisplay(val) {
                                if (document.getElementById(val)) { 
                                    this.display = document.getElementById(val);
                                }
                            }
                        },
                        "display-items": {
                            connected: true,
                            get: function GetDisplayItems() {
                                return this.getAttribute("display-items");
                            },
                            set: function SetDisplayItems(val) {
                                this.setAttribute("display-items", val);
                                try { this.templateItems = JSON.parse(val); }
                                catch (e) { throw e; }
                                finally {
                                    if (xtag.typeOf(this.templateItems) === "array") {
                                        for (let i = 0; i < this.templateItems.length; i++) {
                                            let _tempKey = this.templateItems[i];
                                                this.createTabButton(_tempKey);
                                            if (!this[_tempKey]) {
                                                let _doc = document.querySelector(`#${_tempKey}`);

                                                this[_tempKey] = function () {
                                                    return _doc.outerHTML;
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "display-current": {
                            connected: true,
                            get: function GetCurrentDisplay() {
                                return this.getAttribute("display-current") || false;
                            },
                            set: function SetCurrentDisplay(val) {
                                this.setAttribute("display-current", val);
                                if (val !== this.current) {
                                    this.current = val;
                                    this.templateItems[this.currentIndex] === val ? true :
                                        this.currentIndex = QueryArray(this.templateItems, val);
                                    this.display.innerHTML = this[val]({
                                        hasvalidationMap: true
                                    });
                                }
                            }
                        }
                    };
                }
            };

            elems.xShiftbox = class extends HTMLElement {
                static mixins() { return ["typed"]; }

                static methdos() {
                    return {
                        toggleOverlay: function ToggleOverlay(box, fn) {
                            let section = this.querySelector('section');
                            if (section && box.tapclose) {
                                section[fn](box.xtag.tapoverlay);
                            }
                        },
                        pluginmenu: function Pluginmenu(e) {
                            console.warn("Type[pluginmenu]: Needs enhancement.");
                        },
                        add: function Add(type, target, options) {
                            if (type === "fragment") {
                                Dashing.writer.draw({
                                    name: options.name || "_blank",
                                    target: target || this
                                }, {
                                        parent: options.parent || {},
                                        child: options.child || {}
                                    },
                                    options.fragment || false,
                                    {
                                        creator: options.creator || noop,
                                        events: options.events || {}
                                    });
                            }
                            else if (type === "template") {
                                let keystest = this.templates.keys.some(function TestTemplateKeys(item, c) {
                                    return item === target;
                                });
                                // Check to see if its a new key being added to the shiftbox template cache
                                if (keystest === false) { this.templates.keys.push(target); }

                                // This will overwrite the target type you have previously added to the shiftbox. 
                                this.templates[`_${target}`] = {
                                    type: "templates",
                                    keys: [target]
                                };

                                // Attach fragment callback
                                this.templates[`_${target}`][target] = function ShiftBoxTempalte(node, data) {
                                    return xtag.createFragment(options.fragment);
                                };
                                // Add it the Dashing templates
                                Dashing.add(this.templates[`_${target}`]);

                            }

                        }
                    };
                }

                static lifecycle() {
                    return {
                        created: function Created() {
                            this.xtag.opened = this.hasAttribute('open');
                            this.xtag.tapoverlay = document.createElement('div');
                            this.xtag.tapoverlay.className = 'x-shiftbox-tapclose-overlay';
                            this.templates === undefined ? this.templates = { keys: [] } : true;
                        },
                        inserted: function Inserted() {
                            xtag.fireEvent(this, "open", {
                                detail: {
                                    shiftbox: this,
                                    targetShift: this.shift
                                }
                            });
                        }
                    };
                }

                static attrs() {
                    return {
                        'active': {
                            get: function GetActive() {
                                return this.hasAttribute("active");
                            },
                            set: function SetActive(bool) {
                                if (bool === false) { this.removeAttribute("active"); }
                                else if (bool === true) { this.setAttribute("active", ""); }
                            }
                        },
                        'shift': {
                            set: function SetShift(_shift) {
                                if (_shift === false) { return false; }
                                this.setAttribute("shift", _shift);
                            },
                            get: function () {
                                return this.getAttribute('shift') || false;
                            }
                        },
                        'open': {
                            set: function (bool) {
                                if (bool === false) {
                                    this.removeAttribute("open");
                                    this.close = true;
                                }
                                else if (typeof bool === "string") {
                                    this.setAttribute("open", bool);
                                    this.removeAttribute("close");
                                }
                            }
                        },
                        'close': {
                            set: function (bool) {
                                if (bool === false) {
                                    this.removeAttribute("close");
                                }
                                else if (bool === true) {
                                    this.setAttribute("close", "");
                                }
                            }
                        },
                        collapseButton: {
                            set: function SetAllowCollapse(opts) {
                                // 
                            },
                            get: function GetAllowCollapse() {
                                //
                            }
                        },
                        closePaneButton: {
                            set: function SetAllowCollapse(opts) {
                                let cbtn = document.createElement("button");
                                cbtn.type = "button";
                                cbtn.innerHTML = opts.title;
                                cbtn.className = opts.class;

                                if (opts.attrs) {
                                    //
                                }

                                opts.target.appendChild(cbtn);
                            },
                            get: function GetAllowCollapse() {
                                return this.hasAttribute("close-pane-button");
                            }
                        },
                        'tapclose': {
                            set: function SetTapclose(bool) {
                                if (bool === false) { this.removeAttribute("tapclose"); }
                                else if (bool === true) { this.setAttribute("tapclose", ""); }
                            },
                            get: function GetTapcloseState() { return this.hasAttribute("tapclose"); }
                        },
                        templated: {
                            get: function GetTemplate() {
                                return function _GetTemplate(name) {
                                    return this.templates[`_${name}`];
                                };
                            }
                        }
                    };
                }

                static events() {
                    return {
                        'dblclick:delegate(x-shiftbox[tapclose] > aside)': function OpenShiftbox(e) {
                            xtag.fireEvent(e.target.parentNode, "toggle", {
                                detail: {
                                    shiftbox: e.target.parentNode,
                                    targetShift: false
                                }
                            });
                        },
                        toggle: function OpenShiftBox(e) {
                            let box = e.detail.shiftbox,
                                tshift = e.detail.targetShift;

                            box.shift = tshift;
                            box.open = tshift;
                        }
                    };
                }

            };

            elems.xTabbox = class xFooter extends HTMLElement {
                static events() {
                    return {
                        "selectTab": function selectTab(e) {
                            let previous = [],
                                tab = e.detail.tab,
                                fireSelected = tab && !tab.hasAttribute('selected');
                            xtag.queryChildren(this, 'menu > [selected], ul > [selected]').forEach(function (node) {
                                previous.push(node);
                                node.removeAttribute('selected');
                            });
                            tab.setAttribute('selected', '');
                            let index = xtag.toArray(tab.parentNode.children).indexOf(tab);
                            if (index !== this.selectedIndex) { this.selectedIndex = index; }
                            
                            if (!rules[index]) {
                                rules[index] = 1;
                                let transform = 'transform: translateX(' + (index * -100) + '%);';
                                sheet.insertRule('x-tabbox[selected-index="' + index + '"] > ul > li:nth-of-type(' + (index + 1) + '){ opacity: 1; z-index: 1; ' + xtag.prefix.css  + '}', sheet.cssRules.length);
                            }
                            
                            let panel = xtag.queryChildren(this, 'ul > li')[e.detail.index];
                            if (panel) { panel.setAttribute('selected', ''); }
                            if (fireSelected) {
                                xtag.fireEvent(this, 'tabselected', {
                                    detail: {
                                        currentTab: tab,
                                        currentPanel: panel,
                                        previousTab: previous[0],
                                        previousPanel: previous[1]
                                    }
                                });
                            }
                        },
                        'selectEvent': function selectEvent(e) {
                            if (this.selectedIndex !== Number(e.detail.index)) {
                                xtag.fireEvent(e.currentTarget, "selectTab", {
                                    detail: {
                                        index: e.detail.index,
                                        tab: xtag.queryChildren(this, 'menu > *')[e.detail.index]
                                    }
                                });
                            }
                        },
                        'tap:delegate(x-tabbox > menu > *)': function TapSelectEvent(e) {
                            xtag.fireEvent(this, "selectEvent", { detail: { index: Number(e.target.getAttribute("index")) } });
                        },
                        'keydown:delegate(x-tabbox > menu > *):keypass(13, 32)': function KeySelectEvent(e) { xtag.fireEvent(this, "selectEvent", {}); }
                    };
                }

                static lifecycle() {
                    return {
                        created: function Created() {
                            this.selectedIndex = this.selectedIndex;
                        },
                        inserted: function Inserted() { xtag.fireEvent(this, "selectEvent", { detail: { index: Number(this.selectedIndex) } }); }
                    };
                }

                static attrs() {
                    return {
                        tabElements: {
                            get: function TabElements() {
                                return xtag.queryChildren(this, 'menu > *');
                            }
                        },
                        panelElements: {
                            get: function PanelElements() {
                                return xtag.queryChildren(this, 'ul');
                            }
                        },
                        selectedIndex: {
                            set: function (val) {
                                this.setAttribute("selected-index", val);
                            },
                            get: function () {
                                return this.getAttribute("selected-index");
                            }
                        },
                        selectedTab: (function () { return Dashing.createAccessor("menu > [selected]"); })(),
                        selectedPanel: (function () { return Dashing.createAccessor("menu > [selected]"); })()
                    };
                }

            };

            elems.xTable = class xTable extends HTMLElement {
                static mixins() { return ["typed", "themed", "dashed"]; }

                static methods() {
                    return {
                        readCellValue: function readCellValue(cVal) {
                            let _cmdstg = cVal.value,
                                _haslit = testLiteralCmd.test(cVal.value),
                                _hasarr = testArrayCmd.test(cVal.value),
                                _hasstg = testStringCmd.test(cVal.value),
                                _hasnum = testNumberCmd.test(cVal.value);

                            let obj = {};
                            if (_haslit === true) {
                                obj.literals = _cmdstg.match(testLiteralCmd);
                                testLiteralCmd.lastIndex;
                            }
                            else { testLiteralCmd.lastIndex; }
                            if (_hasarr === true) {
                                obj.arrays = _cmdstg.match(testArrayCmd);
                                testArrayCmd.lastIndex;
                            }
                            if (_hasstg === true) {
                                obj.strings = _cmdstg.match(testStringCmd);
                                testStringCmd.lastIndex;
                            }
                            if (_hasnum === true) {
                                obj.numbers = _cmdstg.match(testNumberCmd);
                                testNumberCmd.lastIndex;
                            }
                            let keylength = Object.keys(obj).length;
                            if (keylength === 0) {
                                obj = "Please provide a properly formated string.";
                            }
                            return obj;
                        },
                        writeTableMessage: function WriteTableMessage(val) {
                            return Dashing.writer.draw({ name: "_blank", target: this.databook || this }, {
                                parent: {
                                    fragment: xtag.createFragment(`<x-message message-display="${this.id}" transition-end="fade-up"></x-message>`)
                                },
                                child: {
                                    omsg: val
                                }
                            }, undefined, {
                                    creator: function _Creator_(node, data) {
                                        window.setTimeout(function () { node.setAttribute("transitioning", "fade-up"); }, 100);
                                    }
                                });
                        },
                        cellResponse: function CellResponse(msgs) {
                            return Dashing.writer.draw({ name: "_blank", target: this.databook || this }, {
                                parent: {
                                    fragment: xtag.createFragment(`<ul is="data-list"></ul>`)
                                },
                                child: msgs
                            }, undefined, {
                                    creator: function _Creator_(node, data) {
                                        let _msgs = data.child;
                                        for (let z = 0; z < _msgs.length; z++) {
                                            let _msg = document.createElement("li");
                                            _msg.setAttribute("is", "data-node");
                                            _msg.innerHTML = _msgs[z];
                                            node.appendChild(_msg);
                                        }
                                    }
                                });
                        },
                        removeCell: function RemoveCell(_cell) {
                            window.removeEventListener(_cell, "keydown");
                            window.removeEventListener(this.tableConfirm, "click");
                            this.tableForm.innerHTML = "";
                        }
                    };
                }

                static lifecycle() {
                    return {
                        created: function Created() {
                            this.table = {};
                            this.id ? true : this.id === xtag.uid();
                        },
                        inserted: function Inserted() {
                            if (this.allowMenu === "true") {
                                this.allowMenu = "<strong>Menu</strong>";
                            }
                            else if (typeof this.allowMenu === "string") {
                                this.allowMenu = `<strong data-menu-title="${this.allowMenu}">${this.allowMenu}</strong>`;
                            }
                            if (this.allowRefresh === "true") { this.allowRefresh = this.querySelector("menu.IDB-table-menu") || this; }
                            if (this.tableConfirm === true) { this.tableConfirm = this.tableConfirm; }
                            if (this.allowPagination === "true") { this.allowPagination = this.table.menu; }
                            if (typeof this.databaseActive === "string") { this.databaseActive = this.databaseActive; }
                        }
                    };
                }

                static attrs() {
                    return {
                        key: {
                            set: function SetKey(val) {
                                // 
                            }
                        },
                        value: {
                            set: function SetValue(val) {
                                //
                            }
                        },
                        databaseActive: {
                            set: function SetActiveDB(val) {
                                Dashing.writer.draw({ name: "_blank", target: this }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<div class="alert database-opened"></div>`)
                                    },
                                    child: {
                                        omsg: `Database Active: ${val}`
                                    }
                                }, undefined, {});
                                this.setAttribute("database-active", this.databaseActive);
                            },
                            get: function GetActiveDB() { return this.getAttribute("database-active"); }
                        },
                        allowMenu: {
                            set: function SetMenu(val) {
                                this.table.menu = Dashing.writer.draw({ name: "_blank", target: this }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<menu class="IDB-table-menu"></menu>`)
                                    },
                                    child: {
                                        omsg: `<svg width="25" height="25" data-svg-icon="database" grid-columns="2 1"><use xlink:href="#database" height="25" width="25" grid-rows="1 1" /></svg>${val || "<strong>Menu</strong>"}`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // 
                                        }
                                    });
                                this.setAttribute("allow-menu", "true");
                            },
                            get: function GetMenu() { return this.getAttribute("allow-menu"); }
                        },
                        allowPagination: {
                            set: function SetPagination(_target) {
                                if (/Element\]$/i.test((_target || this).toString()) === false) { console.error(`Pagination controls parameter requires an element node target: ${this.nodeName.toLowerCase()}.${this.id}.${this.clasName}`); }
                                this.pagination = Dashing.writer.draw({ name: "_blank", target: _target || this }, {
                                    parent: { fragment: xtag.createFragment(`<div type="controls" grid-rows="1 1" grid-columns="4 1"></div>`) },
                                    child: {
                                        omsg: `<button type="button"><svg width="25px" height="25px"><use xlink:href="#caret-circle-up" height='25px' width='25px' /></svg></button>
                                               <button type="button"><svg width="25px" height="25px"><use xlink:href="#caret-circle-down" height='25px' width='25px' /></svg></button>`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // console.log(doc);
                                        }
                                    });
                                this.setAttribute("allow-pagination", this.allowPagination);
                            },
                            get: function () { return this.getAttribute("allow-pagination"); }
                        },
                        allowRefresh: {
                            set: function SetRefresh(_tar) {
                                this.table.refresh = Dashing.writer.draw({ name: "_blank", target: _tar }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<button data-svg-icon="sync-alt" type="button"></button>`)
                                    },
                                    child: {
                                        omsg: `<svg width="25px" height="25px" data-svg-icon="sync-alt"><use xlink:href="#sync-alt" height='20px' width='20px' /></svg>`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // console.log(doc);
                                        }
                                    });
                            },
                            get: function GetAllowRefresh() {
                                return this.getAttribute("allow-refresh");
                            }
                        },
                        tableForm: {
                            get: function GetTableForm() { return this.tForm; },
                            set: function SetTableForm(fm) { this.tForm = fm; }
                        },
                        commandCell: {
                            get: function GetCommandCell() { return this.cmdCell; },
                            set: function SetCommandCell(_cell) { this.cmdCell = _cell; }
                        },
                        tableConfirm: {
                            get: function GetTableConfirm() {
                                return this.hasAttribute("table-confirm");
                            },
                            set: function SetTableConfirm(opts) {

                                Dashing.writer.draw({
                                    name: opts.name || "_blank",
                                    target: opts.target || this
                                }, {
                                        parent: opts.parent || { fragment: xtag.createFragment(`<button type="button" value="Save to database"></button>`) },
                                        child: opts.child || { omsg: `<svg class="fill-13px"><use xlink:href="#database" width="auto" height="auto"></use></svg>` }
                                    }, undefined, {
                                        creator: opts.creator || noop,
                                        events: opts.events || {}
                                    });
                            }
                        },
                        cellValue: {
                            set: function SetCellValue(val) {
                                this.cValue = val;
                            },
                            get: function GetCellValue(val) {
                                return this.readCellValue(this.cValue);
                            }
                        },
                        message: {
                            get: function GetMessage() {
                                return function GetMessage(index) {
                                    return this.messages[index] || false;
                                };
                            },
                            set: function SetMessage(option) {
                                this.messages[this.messages.length] = { node: option, text: option.textContent };
                                this.messages.length += 1;
                            }
                        },
                        multilineEnabled: {
                            set: function SetMultilineEnabled(target) {
                                let frag = xtag.createFragment(`<button type="button"><h3>+</h3></button>`);
                                target.appendChild(frag);
                                this.multiline = frag;
                            }
                        },
                        dataBook: {
                            get: function getDatabook() { return this.getAttribute("data-book") || false; },
                            set: function setDatabook(val) {
                                if (val === true) {
                                    let dbook = document.createElement("div");
                                    dbook.setAttribute("is", "data-book");
                                    this.databook = dbook;
                                    this.appendChild(dbook);
                                }
                            }
                        }
                    };
                }

            };

            elems.xModal = class xModal extends HTMLElement {
                static methods() {
                    return {
                        insertOverlay: function InsertOverlay(modal) {
                            let next = modal.nextElementSibling;
                            if (next) { modal.parentNode.insertBefore(modal.overlayElement, next); }
                            else { modal.parentNode.appendChild(modal.overlayElement); }
                        },
                        'show:transition(boolean,show,focus,hidden)': function ShowModal(fn) {
                            if (fn === undefined || fn === false) {
                                return {
                                    height: "2s",
                                    width: "2s",
                                    left: "2s",
                                    opacity: "2s",
                                    delta: {
                                        right: "25%",
                                        height: "80%",
                                        width: "90%",
                                        opacity: "1"
                                    },
                                    initial: {
                                        right: "0%",
                                        height: "80%",
                                        width: "90%",
                                        opacity: "1"
                                    }
                                };
                            }
                            else {
                                let r = typeof fn === "function" ? fn() : false;
                                if (this.Toggle) this.Toggle.setAttribute("active", "true");
                                return r;
                            }
                        },
                        'hide:transition(boolean,hide,focus,hidden)': function HideModal(fn) {
                            if (fn === undefined || fn === false) {
                                return {
                                    height: "1s",
                                    width: "1s",
                                    opacity: "1s",
                                    left: "2s",
                                    top: "1s",
                                    "background-color": "2s",
                                    delta: {
                                        height: "0%",
                                        width: "0%",
                                        "background-color": "rgba(0,0,0,1)",
                                        left: "95%",
                                        top: "1%",
                                        opacity: "1"
                                    },
                                    initial: {
                                        height: "0%",
                                        width: "0%",
                                        "background-color": "rgba(0,0,0,1)",
                                        left: "95%",
                                        top: "1%",
                                        opacity: "1"
                                    }
                                };
                            }
                            else {
                                let r = typeof fn === "function" ? fn() : false;
                                if (this.Toggle) this.Toggle.removeAttribute("active");
                                return r;
                            }
                        }
                    };
                }

                static mixins() { return ["dashed", "typed", "themed"]; }

                static lifecycle() {
                    return {
                        created: function CreatedModal() {
                            this.overlayElement = document.createElement('x-modal-overlay');
                            this.formStartup = this.formStartup;
                            this.buttonToggle = this.buttonToggle;
                            this.messagesAllowed = this.hasAttribute("messages-allowed");
                        },
                        inserted: function InsertedModal() {
                            if (Dashing.BrowserInfo.oldiOS || Dashing.BrowserInfo.oldDroid) { setTop(this); }
                            // Pass the 'this' element target to the 'database-table setter' to append the db table if needed.
                            if (this.databaseTable === "true") { this.databaseTable = "insert"; }
                        },
                        removed: function RemoveModal() {
                            if (this.type === "startup") {
                                (this.parentElement || document.body).removeChild(this.overlayElement);
                                this.xtag.lastParent = null;
                            }
                        }
                    };
                }

                static events() {
                    return {
                        'tap:outer': function TapOuterModal(e) {
                            if (e.target.nodeName !== "X-MODAL-OVERLAY") {
                                return false;
                            }

                            // Check modal type 
                            if (this.type === "startup" || this.type === "modal") {
                                this.hide();
                            }
                        },
                        'tap:delegate(input[value="Create"])': function SubmitModal(e) {
                            let checking = Dashing.conditioned.StartupFormConditions(e, Dashing.conditioned["StartupFormConditions"]),
                                parentModal = this.parentNode.parentNode.parentNode.parentNode.parentNode;

                        },
                        'tap:delegate(button[value="Confirm"])': function ConfirmPlatform(e) {
                            if (this.parentNode.type === "selection") {
                                Dashing.platform = { type: this.parentNode.querySelector('select').value };

                                this.parentNode.outerHTML = "";

                                Dashing.writer.draw({ name: "prompter", target: document.querySelector("x-modal[type='startup']") }, {
                                    parent: {
                                        id: "platform-found-prompt",
                                        class: 'prompt-fadeOut',
                                        message: `Congratulations!`
                                    },
                                    child: {
                                        confirm: false,
                                        message: `You chose the, ${Dashing.platform.type} platform.`
                                    }
                                }, undefined, {
                                        creator: function PromptDrawerCallback(doc) {
                                            window.setTimeout(function PromptRemoveTimeout() {
                                                doc.parentNode.removeChild(doc);
                                            }, 3000);
                                        }
                                    });

                            }
                        },
                        'change:delegate(select)': function ChangePlatform(e) {
                            Dashing.rootElement.setAttribute("platform", this.selectedOptions[0].value.toLowerCase());
                        }
                    };
                }

                static attrs() {
                    return {
                        messagesAllowed: {
                            get: function GetMsgsAllowed() { return this.getAttribute("messages-allowed"); },
                            set: function SetMsgsAllowed(val) {
                                this.setAttribute("messages-allowed", val);
                                this.msgsAllowed = val;
                                if (val === true) {
                                    this.messages = {
                                        length: 0
                                    };
                                }
                            }
                        },
                        focus: {
                            set: function SetFocus(val) {
                                if (this.hasAttribute("focus")) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            get: function GetFocus() { return this.getAttribute("focus"); }
                        },
                        responseTarget: {
                            set: function (val) {
                                this.setAttribute("response-target", val);
                                this.display = document.getElementById(val);
                            },
                            get: function () { return this.getAttribute("response-target"); }
                        },
                        databaseTable: {
                            get: function GetDBTable() { return this.getAttribute("database-table") || false; },
                            set: function SetDBTable(val) {
                                if (val === "true") { this.hasDBTable = true; }
                                else if (/insert$/.test(val.toString()) === true) {
                                    this.setAttribute("database-table", "true");
                                    Dashing.rootElement.userRequestServices("DBTable", this, `<key class="memory">AwaitingStart</key><value>Awaiting web application database startup.</value>`);
                                }
                                else { console.error(`Error: Setter option not available for, ${this.nodeName.toLowerCase()}#${this.id}.${this.className}`); }
                            }
                        },
                        formStartup: {
                            get: function GetStartupForm() { return this.getAttribute("form-startup") || false; },
                            set: function SetStartupForm(val) {
                                this.setAttribute("form-startup", val);
                                this.mform = document.getElementById(val);
                            }
                        },
                        buttonToggle: {
                            get: function GetButtonCreate() {
                                return this.getAttribute("button-toggle") || false;
                            },
                            set: function SetButtonCreate(val) {
                                this.setAttribute("button-toggle", val);
                                this.Toggle = document.getElementById(val);
                            }
                        },
                        buttonCreate: {
                            get: function GetButtonCreate() {
                                return this.getAttribute("button-create") || false;
                            },
                            set: function SetButtonCreate(val) {
                                this.setAttribute("button-create", val);
                                this.Create = document.getElementById(val);
                            }
                        },
                        buttonConfirm: {
                            set: function SetSubmitEvent(val) {
                                this.Confirm = document.getElementById(val);
                                if (this.Confirm === undefined) {
                                    let frag = document.createElement("button");
                                    frag.type = "button";
                                    frag.innerHTML = "Confirm";
                                    frag.value = "Confirm";

                                    this.appendChild(frag);
                                    this.Confirm = document.getElementById(val);
                                }
                                this.setAttribute("button-confirm", val);
                            },
                            get: function GetSubmitEvent() { return this.getAttribute("button-confirm"); }
                        },
                        escapeHide: {
                            get: function () { return this.hasAttribute("escape-hide"); },
                            set: function (val) { this.setAttribute("escape-hide", val); }
                        },
                        clickHide: {
                            get: function ClickHide() { return this.hasAttribute("click-hide"); },
                            set: function ClickHide(val) { this.setAttribute("click-hide", "true"); }
                        }
                    };
                }

            };

            elems.xJson = class xJson extends HTMLElement {
                connectedCallback() {
                    this.makeJson();
                }
                static methods() {
                    return {
                        // The makeJson function is referenced in xForm.
                        makeJson: function MakeJson(node) {
                            try {
                                let r = null,
                                    stg = node ? node.innerHTML.replace(/\\/g, "") : this.innerHTML.replace(/\\/g, "");
                                r = JSON.parse(stg);
                                return r;
                            }
                            catch (e) {
                                throw e;
                            }
                        },
                        queryJson: function UpdateValidationMap(data) {
                            let p = this.parentNode;
                        }
                    };
                }
                static attrs() {
                    return {
                        "validation-map": {
                            connected: true,
                            get: function GetValidationMap() { return this.hasAttribute("validation-map"); },
                            set: function SetValidationMap(value) {
                                this.validationMapping = value === true ? true : (this.removeAttribute("validation-map"), false);
                                if (this.parentNode.jsonArray) {
                                    this.parentNode.jsonArray ?
                                        this.parentNode.jsonArray.push(this.Json ? this.Json :
                                            JSON.parse(this.innerHTML)) : (this.parentNode.jsonArray = [], this.parentNode.push(this.Json ? this.Json : JSON.parse(this.innerHTML)));
                                }
                            }
                        }
                    };
                }
            };

            elems.xMessage = class xMessage extends HTMLElement {
                static lifecycle() {
                    return {
                        created: function CreatedMessage() {
                            this.messageDisplay = this.messageDisplay;
                        },
                        inserted: function InsertedMessage() {
                            let index = this.display.messages.length;
                            if (this.display.messagesAllowed === true) {
                                this.display.messages[index] = this.textContent;
                                this.display.messages.length += 1;
                            }
                        }
                    };

                }

                static attrs() {
                    return {
                        duration: {
                            get: function GetDuration() { return this.getAttribute("duration") || "2s"; },
                            set: function SetDuration(val) { /**/ }
                        },
                        status: {
                            get: function GetState() { return this.getAttribute("status"); },
                            set: function SetState(val) {
                                this.setAttribute("status", val);
                            }
                        },
                        messageDisplay: {
                            get: function GetMessageDisplay() { return this.getAttribute("message-display"); },
                            set: function SetMessageDsiplay(val) {
                                this.display = document.getElementById(val);
                                this.setAttribute("message-display", val);
                            }
                        }
                    };
                }

            };

            return elems;
        },
        platformPrompt: true,
        celements: true,
        'add(mixin=dashed)': class Dashed {
            static methods(XTagElement) {
                return {
                    add: function AddDashed(name, options) {
                        // Send name through switch default return console warning.
                        switch (name) {
                            // 
                            case "fragment":
                                Dashing.writer.draw({
                                    name: options.name || "_blank",
                                    target: options.target
                                }, {
                                        parent: options.parent,
                                        child: options.child
                                    }, undefined, {
                                        creator: options.creator,
                                        events: options.events
                                    });
                                break;
                            // 
                            case "templates":
                                let frags = {
                                    keys: options.keys
                                };
                                xtag.merge(frags, options.templates);
                                Dashing.add("templates", frags);
                                break;
                            default:
                                return `${this.nodeName}#${this.id || "undefined"}.${this.className || "undefined"}, tried to add, [${name}] but the option didn't exist.`;
                        }
                    },
                    writeOptions: function WriteOptions(values) {
                        let frag = document.createElement("select");
                        for (let i = 0; i < values.length; i++) {
                            let _opt = document.createElement("option");
                            _opt.value = values[i];
                            _opt.innerHTML = values[i];
                            frag.appendChild(_opt);
                            i === 0 ? frag.selected = _opt.selected = true : null;
                        }
                        frag.id = i.toString() + this.nodeName.toLowerCase() + "PioSelectables";
                        return frag;
                    }
                };
            }
            static attrs(XTagElement) {
                return {
                    templates: {
                        get: function GetTemplate() {
                            return function _GetTemplate(name) {
                                return this.templated[`_${name}`];
                            };
                        }
                    },
                    render: {
                        set: function SetRender(rend) {
                            console.log(rend);
                        },
                        get: function GetRender() { return true; }
                    }
                };
            }
        },
        'add(mixin=drawing)': class Drawing {
            static methods(XTagElement) {
                return {};
            }
        },
        'add(mixin=typed)': class Typed {
            static methods() {
                return {
                    default: function DefaultContainer(e) {
                        let detail = e.detail;


                        console.log(detail);
                    }
                };
            }
            static attrs() {
                return {
                    type: {
                        connected: true,
                        set: function SetType(val) {
                            // Enhancement for type condition callback events
                            
                        }
                    }
                };
            }
        },
        'add(mixin=themed)': class Themed {
            static methods() {
                return {
                    "default": function DefaultJsonSchema(e) {
                        return true;
                    }
                };
            }
            static attrs() {
                return {
                    theme: {
                        connected: true,
                        get: function GetTheme() { return this.getAttribute("theme"); },
                        set: function SetTheme(val) {
                            //
                        }
                    },
                    gridTemplate: {
                        get: function () {
                            return this.getAttribute("grid-template");
                        },
                        set: function (val) {
                            this.setAttribute("grid-template", val);
                        }
                    },
                    columnSpan: {},
                    rowSpan: {}
                };
            }
        },
        'add(prototype=toggle)': Toggle,
        'add(prototype=localDB)': pioDB,
        'add(prototype=model)': Model,
        'add(prototype=validator)': Validator
    });

})();