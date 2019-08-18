/** ____________________ Custom Element Components ____________________ **/
/* Steven Van Sant 
 * Copyright 2018,
 * Licencse MIT 
____________________ **/

(function DashioFull() {
    const camelCaseCE = /\-[aA-zZ]/g,
          camelCaseToDSV = /[A-Z]/g;

    const mixins = {},
          CEvents = {};

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
        if (typeOf(k) === 'string') { return mergeOne(source, k, v); }
        for (let i = 1, l = arguments.length; i < l; i++) {
            for (let key in arguments[i]) { mergeOne(source, key, arguments[i][key]); }
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

    // Helper Functions
    function QueryArray(arr, val) {
        if (Dashing.typeOf(val) === "string") {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === val) { return i; }
            }
            return false;
        }
    } 
    function writeSetterGetter(key, proto, obj) { 
        Object.defineProperty(proto.prototype, key, {
            configurable: false,
            enumerable: true,
            get: obj.get || function () { return false; },
            set: obj.set || function () { false; }
        });
    }
    function addMethod(name, proto, fn) {
        Object.defineProperty(proto.prototype, name, {
            writeable: false,
            configurable: false,
            value: fn
        });
    }
    function addAttrSetterGetter(name, proto, prop) {
        let n = name.replace(camelCaseCE, function AttrCamelCase(stg) { let r = stg[1]; return r.toUpperCase(); });
        writeSetterGetter(n, proto, {
            get: prop.get ? prop.get : function noop() { },
            set: prop.set ? prop.set : function noop(value) { false; }
        }); 
        return prop.connected ? n : false;
    } 
    function writeCustomEvent(node, name, _detail) { 
        if (_detail !== false) {
            let event = new CustomEvent(n, {
                detail: _detail
            });

            node.dispatchEvent(event);
            return true;
        } else { return false; }
    }

    const states = {},
        insertRule = CSSStyleSheet.prototype.insertRule,
        deleteRule = CSSStyleSheet.prototype.deleteRule,
        regexpConditionMatch = /\s*state\s*:\s*(\w+)/;

    // StyleSheet 
    class CssWriter {
        constructor(name) {
            if (document.getElementById(name)) {
                this.Stylesheet = { ready: document.getElementById(name), progressing: false };
            }
            else if(typeof name === "string") {
                let sy = document.createElement("style");
                    sy.id = name;
                    this.Stylesheet = { ready: false, progressing: sy };
            }

            document.addEventListener('load', function LoadCss(e) {
                let node = e.target;
                if (node.nodeName === 'STYLE' && node.sheet) {
                    Array.prototype.forEach.call(node.sheet.cssRules, function CssWriterLoad(rule) { css.parseRule(node, rule); });
                }
            }, true);

        }
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
                console.log(match);
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
    };

    // Svg class
    class Svg {
        constructor() {
            this.fragments = {};
        }
    }

    // Canvas class
    class Canvas {
        constructor() {
            this.fragments = {};
        }
    }

    // Images Class
    class Images {
        constructor() {
            this.length = 0;
            this.library = {};
        }
        add(name, image) {
            this.query(name) === false ? this.library[name] = image : true;
        }
        get library() { return this.Library || false; }
        set library(value) {
            if (this.Library !== false) { return true; }
            this.Library = Dashing.typeOf(value) === "array" ? value : [];
        }
        query(name, options) {
            if (!this.library[name]) {
                // not found
            }
        }
    }

    // Icon Class
    class Iconography {
        constructor() {
            this.uploads = {};
        }
        add(name, snippet) {
            this.uploads[name] = this.uploads[name] ? this.uploads[name] : snippet;
        }
        createIcon(type, snippet) {
            let ico = document.createDocumentFragment(),
                _doc = null;
            snippet = this.uploads[snippet] ? this.uploads[snippet] : "<text stroke='black' stroke-width='1'>Error: Icon not found.</text>";
            switch (type) {
                case "png":
                case "gif":
                case "jpeg":
                case "img":
                    _doc = document.createElement("img");
                    _doc.src = snippet;
                    break;
                case "canvas":
                    _doc = document.createElement("canvas");
                    // needs to be started
                    break;
                case "svg":
                default:
                    _doc = document.createElementNS("http://www.w3.org/2000/svg", "svg");

                    _doc.innerHTML = snippet;

                    let css = _doc.firstElementChild.querySelector("style") || false,
                        vbox = null;

                    if (css !== false) {
                        _doc.appendChild(css);
                    }

                    if (_doc.firstElementChild.getAttribute("data-icon") === "true") {
                        _doc.firstElementChild;
                    }
                    else if (_doc.firstElementChild.getAttribute("data-icon") === "symbol") {
                        vbox = _doc.firstElementChild.getAttribute("viewBox");
                        vbox ? _doc.setAttribute("viewBox", vbox) : null;
                        _doc.appendChild(_doc.firstElementChild.firstElementChild);

                        _doc.firstElementChild.hasAttribute("width") ? _doc.setAttribute('width', _doc.firstElementChild.getAttribute("width")) : null;
                        _doc.firstElementChild.hasAttribute("height") ? _doc.setAttribute('height', _doc.firstElementChild.getAttribute("height")) : null;
                        _doc.removeChild(_doc.firstElementChild);
                    }
                    break;
            }
            ico.appendChild(_doc);
            return ico;
        }
        insertIcon(target, opts) {
            let ico = this.createIcon(opts.type, opts.snippet);
            switch (opts.insertAt) {
                case "beforebegin":
                case "afterend":
                case "afterbegin":
                case "beforeend":
                    opts.drawer !== false ? (this.drawer = opts.drawer, this.fireDrawer(ico.firstElementChild)) :
                        this.drawer !== false ? this.fireDrawer(ico.firstElementChild) : false;
                    opts.overwrite === true ? target.innerHTML = "" : null;
                    target.insertAdjacentElement(opts.insertAt, ico.firstElementChild);
                    break;
                case "atIndex":
                    opts.drawer !== false ? (this.drawer = opts.drawer, this.fireDrawer(ico.firstElementChild)) :
                        this.drawer !== false ? this.fireDrawer(ico.firstElementChild) : false;
                    opts.overwrite === true ? target.innerHTML = "" : null;
                    target.elements[opts.insertIndex].insertAdjacentElement("afterend", ico.firstElementChild);
                    break;
            }
        }

        fireDrawer(icon, css) {
            this.drawer(icon, css);
            this.drawer = false;
        }
        set drawer(value) { this.draw = Dashing.typeOf(value) === "function" ? value : false; }
        get drawer() { return this.draw; }

        set uploader(value) {
            Dashing.typeOf(value) === "object" ? (Dashing.model.requests[value.id] ? Dashing.model.requests[value.id].firstElementChild !== null ? (value.uploader(Dashing.model.requests[value.id])) : (value.uploader(document.querySelector("[data-icons]"))) : this.Uploader = value.uploader) : function UndefinedError() { return "Caution: No uploader available."; };
        }
        get uploader() { return this.Uploader; }
    }

    // Shadow class
    class Shadow {
        constructor() {
            this.attached = {};
        }
        set attach(options) {
            this.attached[element.id] = {
                shadow: options.element.elem.attachShadow({ mode: options.mode || "open" })
            }
        }
        get attach() {
            return function GetAttached(name) {
                return this.attached[name] || false;
            };
        }
    }

    // Writer class
    class Writer extends Shadow {
        constructor() {
            super();
            this.inkart = {};
            this.borderart = {};
            this.patterns = {
                default: `<div default-stamp="true"></div>`
            };

            this.PenStroke = "black";
            this.PenFill = "black";

            this.x = 0;
            this.y = 0;

            this.width = "auto";
            this.height = "auto";

            this.svg = new Svg();
            this.canvas = new Canvas();

        }

        set borderArt(value) {
            let name = null;
            if (typeof ptip.name === "string") { name = ptip.name; }
            else { return false; }
            this.borderart[name] = typeof ptio.snippet === "string" ? ptio.snippet : "Pen tip Type Error";
        }
        get borderArt() { return function GetBorderArt(name) { return this.borderart[name] ? this.borderart[name] : false; } }

        pen(name, options) { }
        set penTip(ptip) {
            let name = null;
            if (typeof ptip.name === "string") { name = ptip.name; }
            else { return false; }
            this.inkart[name] = typeof ptio.snippet === "string" ? ptio.snippet : "Pen tip Type Error";
        }
        get penTip() { return function GetTip(name) { return this.inkart[name] ? this.inkart[name] : false; } }
        set penFill(pcolor) { this.PenFill = pcolor; }
        get penFill() { return this.PenFill }
        set penStroke(scolor) { this.PenStroke = scolor; }
        get penStroke() { return this.PenStroke; }

        stamp(name, options) {
            let context = null,
                snippet = null;
            if (Dashing.typeOf(this) === "htmlelement") {
                if (this.shadow) { context = this.shadow; }
                else { context = this; }
            } else { return false; }
            return new Promise(function (res, rej) {
                if (Dashing.writer.stampPattern(name)) {
                    snippet = Dashing.writer.stampPattern(name);
                }
                else { rej ? rej(name, options) : false; }
                let opts = null;
                if (Dashing.typeOf(options) === "object") {
                    opts = options;
                }
                else { rej ? rej(name, options) : false; }
                let r = document.createDocumentFragment(),
                    doc = document.createElement("div");
                    doc.innerHTML = snippet;
                r.appendChild(doc.firstElementChild);
                    r.firstElementChild.setAttribute("data-stamp", name);
                    opts.width ? r.firstElementChild.style.width = opts.width : false;
                    opts.height ? r.firstElementChild.style.height = opts.height : false;
                    context.appendChild(r.firstElementChild);
                res ? res(context.querySelector(`[data-stamp="${name}"]`)) : false;
            });
        }
        set stampPattern(spattern) {
            let name = null;
            if (typeof spattern.name === "string") { name = spattern.name; }
            else { return false; }
            this.patterns[name] = typeof spattern.snippet === "string" ? spattern.snippet : "Pattern Type Error";
        }
        get stampPattern() { return function GetStampPattern(name) { return this.patterns[name] ? this.patterns[name] : false; } }

        set extension(value) {
            if (this.Extension) { return true; }
            this.Extension = Dashing.typeOf(value) === "htmlelement" ? value : false; 
        }

    }

    let _setprog = 0;
    function noop(n) { return n || false; }
    class Model {
        constructor(data) {
            this.requests = {};
            this.requests._progress = 0; 
            this.requests._loaded = 0; 

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
                    Dashing.model.requests[_id] = e.target.response;
                    Dashing.model.requests._loaded += 1;
                    options.onload(e);
                } : function LOADREF(e) {
                    Dashing.model.requests[_id] = e.target.response;
                    Dashing.model.requests._loaded += 1;
                };

                _xhr.onprogress = options.onprogress ? function ProgressModel(e) {
                    Dashing.model.requests._progress += 1;
                    options.onprogress(e);
                } : function ProgressModelDefault(e) {
                    Dashing.model.requests._progress += 1;
                };

                _xhr.onerror = options.onerror ? function ERRORREF(e) {
                    Dashing.model.requests[_id] = `Request Error: ${e.target.responseURL}`;
                    options.onerror(e);
                } : function ERRORREF(e) {
                    Dashing.model.requests[_id] = `Request Error: ${e.target.responseURL}`;
                };

                _xhr.send();

                return _id;
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
        }
        open() {

        }
        add(_case, _cond, _def) {
            // Add key words passed as cases here.
        }
        set case(data) {
            // 
        }
        get case() {
            //
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

    class localDB extends Validator {
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

    let Dashing = null,
        elements = null;
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
            // set the extension
            this.extension = document.querySelector(dashed.rootElement) || document.querySelector("x-extension");
            // set the css 
            this.stylesheet = CssWriter;
            // set the writer
            this.writer = Writer;
            // set the iconography
            this.iconography = Iconography;

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

            // Set elements variable and build Components 
            elements = dashed.elements;
            let elems = Dashing.build(dashed.namespaces, {
                set: function SetCeClass(definition) {
                    let name = definition.name.replace(camelCaseToDSV, function (stg) { return `-${stg.toLowerCase()}`; });
                    if (/^[a-z]+\-/g.test(name)) {
                        let _methods = definition.methods ? definition.methods() : {};

                        let _attrs = definition.attrs ? definition.attrs() : {},
                            _akeys = [];

                        let _events = definition.events ? definition.events() : {};
                            definition.events ? delete definition.events : false;

                        let _lc = definition.lifecycle ? definition.lifecycle() : false;
                        _lc !== false ? (
                            _lc.removed ? definition.prototype.disconnectedCallback = _lc.removed : false
                        ) : false;

                        let _mxa = null,
                            _mxe = null,
                            _mxm = null,
                            _mx = definition.mixins ? definition.mixins() : false;
                        if(_mx !== false) {
                            for (let m = 0; m < _mx.length; m++) {
                                let nm = _mx[m];
                                    mixins[nm].attrs ? merge(_attrs, mixins[nm].attrs()) : false;
                                    mixins[nm].methods ? merge(_methods, mixins[nm].methods()) : false;
                                    mixins[nm].events ? merge(_events, mixins[nm].events()) : false;

                            }
                            delete definition.mixins;
                        }

                        for (let km in _methods) { addMethod(km, definition, _methods[km]); }
                        definition.methods ? delete definition.methods : false;

                        for (let am in _attrs) { _akeys.push(addAttrSetterGetter(am, definition, _attrs[am])); }
                        definition.attrs ? delete definition.attrs : false;

                        class DashingElement extends definition {
                            constructor() {
                                super();
                                _lc.created ? _lc.created.call(this) : false;

                            }
                            connectedCallback() {
                                for (let i = 0; i < _akeys.length; i++) {
                                    if (_akeys[i].connected !== false) { this[_akeys[i]] = this[_akeys[i]]; }
                                }
                                _lc.inserted ? _lc.inserted.call(this) : false;

                                for (let em in _events) {
                                    let en = em.match(/^[aA-zZ]+/g)[0],
                                        delegate = em.match(/\(.+\)$/g);
                                    delegate = delegate === null ? false : delegate[0].replace(/[\(\)]/g, "");

                                    let context = delegate ? document.querySelector(delegate) : this,
                                        _fire = Dashing.typeOf(_events[em]) === "object" ? _events[em].fire ? _events[em].fire : noop : Dashing.typeOf(_events[em]) === "function" ? _events[em] : noop,
                                        _detail = Dashing.typeOf(_events[em]) === "object" ? _events[em].detail ? _events[em].detail : false : false;

                                    context === null ? false : Dashing.on(context, en, _fire, _detail);
                                }
                            }
                        }
                            Dashing.register(name, DashingElement);
                    }
                }
            });
        }
        on(context, type, callback, options) {
            console.log(context);
            if (options) { writeCustomEvent(context, type, options.detail ? options.detail : false); }
            context === null ? false : context.addEventListener(type, callback);
        }
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
                    mixins[data.name] = mixins[data.name] ? mixins[data.name] : data.value;
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
                        xhr.onprogress = data.progress || function XhrProgress(e) { return true; };
                        xhr.onerror = data.error || function XhrModelError(e) { console[("error" || "log")]("XhrModel Error: " + e); };

                        xhr.send();

                    return xhr.response;
            }
        }
        build(nms, def) {
            let comps = function elems() { };
            // loop through namespaces
            for (let i = 0; i < (nms || []).length; i++) {
                let nm = nms[i].replace(camelCaseCE, function (stg) {
                    let r = stg.toUpperCase();
                    return r[1];
                });
                writeSetterGetter(nm, comps, def);
            }

            elements(new comps());
            return comps;
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
            let qy = (this.querySelector ? this : document).querySelector(query);
            return qy ? fn.call(this, qy) : (nullFn || noop).call(this, qy);
        }
        uid() { return Math.random().toString(36).substr(2, 10); }
        createAccessor(selector) {
            return {
                get: function () {
                    return this.querySelector(selector);
                }
            };
        }
        register(name, chlass) {
            customElements.define(name, chlass);
        } 
        get iconography() { return this.Iconography || false; }
        set iconography(value) {
            if (this.Iconography) { return true; }
            this.Iconography = this.typeOf(value) === "function" ? new value() : false;
        }
        get stylesheet() { }
        set stylesheet(value) {
            if (this.Stylesheet) { return true; }
            this.Stylesheet = this.typeOf(value) === "function" ? new value() : false;
        }
        get images() { return this.Images || false; }
        set images(value) {
            if (this.Image) { return true; }
            this.Images = this.typeOf(value) === "function" ? new value() : false;
        }
        get writer() {
            return this.Writer;
        }
        set writer(value) {
            if (this.Writer) { return true; }
            this.Writer = this.typeOf(value) === "function" ? new value() : false;
            this.writer.extension = this.extension;
        }
        set bounded(options) {
            // 
        }
    }

    Dashing = new dashboard({
        /**
         * @name Namespaces
         * @description Array of HTML Element names
         * @notes The `celements` property must be set to true so that the constructor reads the array.
        */
        namespaces: [
            "x-json", 
            "x-extension",
            "x-book",
            "x-panel",
            "x-page",
            "x-table",
            "x-header",
            "x-footer",
            "x-menu",
            "x-shiftbox",
            "x-tabbox",
            "x-modal",
            "x-message",
            "x-link"
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
                static methods() {
                    return {
                        appendResources: function AppendResources(target, frag) {
                            if (target) {
                                target.appendChild(frag);
                            }
                            else {
                                this.appendChild(frag);
                            }
                        }
                    };
                }

                static attrs() {
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
                static mixins() { return ["dashed"]; }
                // Methods 
                static methods() {
                    return {
                        userRequestServices: function UserRequestServices(isInNeedOf, target, assistant, optionals) {
                            // get the reqeusted service 
                            switch (isInNeedOf) {
                                case "prompt":
                                    let _dbid = xtag.uid().toString();
                                    
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
                        // [getFormValues] in progress
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
                        queryJson: function QueryJsonPromise(search, data, token, recurse) {
                            let _this = this,
                                objterm = null;
                            if (recurse === true) {
                                if (Dashing.typeOf(data) === "object") {
                                    if (token === "#") { 
                                        objterm = data.id;
                                    }
                                    else if (token === ".") {
                                        objterm = data.class;
                                    }
                                    else if (token === "-") {
                                        objterm = data.name;
                                    }
                                    else if (Dashing.typeOf(token) === "string") {
                                        objterm = data[token];
                                    }

                                    if (objterm === search) {
                                        return data;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                                else if (Dashing.typeOf(data) === "array") {
                                    for (let i = 0; i < data.length; i++) {
                                        if (Dashing.typeOf(data[i]) === "object" || Dashing.typeOf(data[i]) === "array") {
                                            let r = _this.queryJson(search, data[i], token, true);
                                            return r;
                                        }
                                        else if (Dashing.typeOf(data[i] === "string")) {
                                            if (data[i] === key) {
                                                return data[i];
                                            }
                                        }
                                    }
                                }
                                else if (Dashing.typeOf(data) === "nodelist") {
                                    let token = null;
                                    for (let i = 0; i < data.length; i++) {
                                        let j = JSON.parse(data[i].innerHTML);
                                        objterm = null;

                                        if (token === "#") {
                                            objterm = j.id;
                                        }
                                        else if (token === ".") {
                                            objterm = j.class;
                                        }
                                        else if (token === "-") {
                                            objterm = j.name;
                                        }
                                        else if (Dashing.typeOf(token) === "string") {
                                            objterm = j[key];
                                        }

                                        if (objterm === key) {
                                            return j;
                                        }
                                    }
                                }
                                else {
                                    return key;
                                }

                            }

                            return new Promise(function QPromise(resolve, reject) {
                                setTimeout(function () {
                                    if (Dashing.typeOf(data) === "object") {
                                        if (token === "#") {
                                            console.log(data);
                                            objterm = data.id;
                                        }
                                        else if (token === ".") {
                                            objterm = data.class;
                                        }
                                        else if (token === "-") {
                                            objterm = data.name;
                                        }
                                        else if (Dashing.typeOf(token) === "string") {
                                            objterm = data[token];
                                        }

                                        if (objterm === search) {
                                            console.log(resolve);
                                            resolve(data); 
                                        }
                                        else {
                                            reject(data);
                                        }
                                    }
                                    else if (Dashing.typeOf(data) === "array") {
                                        for (let i = 0; i < data.length; i++) {
                                            if (Dashing.typeOf(data[i]) === "object" || Dashing.typeOf(data[i]) === "array") {
                                                let r = _this.queryJson(search, data[i], token, true);
                                                resolve(r);
                                            }
                                            else if (Dashing.typeOf(data[i] === "string")) {
                                                if (data[i] === key) {
                                                    return resolve(data[i]);
                                                }
                                            }
                                        }
                                    }
                                    else if (Dashing.typeOf(data) === "nodelist") {
                                        let token = null;
                                        for (let i = 0; i < data.length; i++) {
                                            let j = JSON.parse(data[i].innerHTML);
                                                objterm = null;
                                            if (token === "#") { objterm = j.id; }
                                            else if (token === ".") { objterm = j.class; }
                                            else if (token === "-") { objterm = j.name; }
                                            else if (Dashing.typeOf(token) === "string") { objterm = j[key]; }
                                            if (objterm === key) { resolve(j); }
                                        }
                                    }
                                    else {
                                        reject(key);
                                    }
                                }, 333);
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
                            this.model = true;
                            this.stylesheet = Dashing.stylesheet;
                            this.icons = Dashing.iconography;
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
                                            let icos = e.target.response,
                                                filenm = e.target.responseURL.match(/[\w\-]+(?=\.html)/g);
                                            if (Dashing.typeOf(_this.icons.uploader) === "function") {
                                                _this.icons.add(filenm[0], icos);
                                                _this.setAttribute("icos", "true");
                                                _this.icons.uploader(icos);
                                            }
                                            else {
                                                _this.appendChild(icos.firstElementChild);
                                                _this.setAttribute("icos", "true");
                                            }
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
                        },
                        stylesheet: {
                            connected: true,
                            get: function GetStyleSheet() { return this.getAttribute("stylesheet") || false; },
                            set: function SetSyleSheet(value) {
                                if (this.Stylesheet) { return true; }
                            }
                        },
                        "main-menu": {
                            connected: true,
                            get: function GetMainMenu() { return this.getAttribute("main-menu") || false; },
                            set: function SetMainMenu(value) {
                                Dashing.typeOf(value) === "string" ?
                                    (this.setAttribute("main-menu", value),
                                        this.MainMenu = document.getElementById(value) ) :
                                    ( this.MainMenu = false );
                                
                            }
                        },
                        "main-display": {
                            connected: true,
                            get: function GetMainMenu() { return this.getAttribute("main-display") || false; },
                            set: function SetMainMenu(value) {
                                Dashing.typeOf(value) === "string" ?
                                    (this.setAttribute("main-display", value),
                                        this.MainDisplay = document.getElementById(value)) :
                                    (this.MainDisplay = false);

                            }
                        }
                    };
                }

                // Events
                static events() {
                    return {
                        config: {
                            detail: {},
                            fire: function Config(e) {
                                // 
                            }
                        }
                    };
                }

                // setters/getters
                set model(value) {
                    this.Model = this.Model ? this.Model : {
                        requests: {}
                    };

                    if (Dashing.typeOf(value) === "object") {
                        this.Model.requests = value.Model.requests ? value.Model.requests : Dashing.model.requests ? Dashing.model.requests : { _uploads: 0, _progress: 0 };
                    }
                    else if (Dashing.typeOf(value) === "boolean") {
                        this.Model.requests = Dashing.model.requests;
                    }
                }
                get model() {
                    return this.Model;
                }

                set book(value) {
                    this.Book = value;
                }
                get book() { }

                get writer() { return Dashing.writer; }
            };

            elems.xMenu = class xMenu extends HTMLElement {
                static lifecycle() {
                    return {
                        created: function CreatedXMenu() {
                            this.display = null;
                            this.templateItems = null;
                            this.currentIndex = 0;
                            this.template = {};
                        }
                    };
                }
                static methods() {
                    return {
                        createTabButton: function CreateTabButton(_id) {
                            let _title = _id.replace(/\-\w/ig, function (stg) { return stg.toUpperCase(); });
                                _title = _title.replace(/\-/g, " ");
                                _title = _title.replace(/\s\w/, function (stg) { return stg.toUpperCase(); });
                                _title = _title.replace(/^\w/, function (stg) { return stg.toUpperCase(); });
                            let _tabbtn = document.createElement("button");
                                _tabbtn.setAttribute("panel-content", _id);
                                _tabbtn.innerHTML = _title;
                            this.insertAdjacentElement("beforeend", _tabbtn);
                        },
                        "dashing-js-builder": function DashingJsBuilder() {
                            return `<x-form id="dashing-js-builder" resource-selection="builder" form-view="Form-Sheet-View">
                                <strong>DashingJS Builder</strong>
                                <form name="dashingjs-build">
                                    <label for="build_name">Upload: </label><input type="file" id="build_name" name="build_name" placeholder="Upload" />
                                    <input type="button" name="submit_build" value="Build" />
                                </form>
                            </x-form>`;
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
                                if (document.querySelector(val)) {
                                    this.display = document.querySelector(val);
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
                                    if (Dashing.typeOf(this.templateItems) === "array") {
                                        for (let i = 0; i < this.templateItems.length; i++) {
                                            let _doc = document.querySelector(`#${this.templateItems[i]}`);
                                            if (_doc) {
                                                this.template = {
                                                    id: this.templateItems[i],
                                                    template: function () { return _doc.outerHTML; }
                                                };
                                            }
                                            else {
                                                this.template = {
                                                    id: this.templateItems[i],
                                                    template: function () { return false; }
                                                };
                                            }
                                            this.createTabButton(this.templateItems[i]);
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
                                if (val === false) { return false; }
                                this.setAttribute("display-current", val);
                                if (val !== this.current) {
                                    this.current = val;
                                    this.templateItems[this.currentIndex] === val ? true :
                                        this.currentIndex = QueryArray(this.templateItems, val);
                                    let _val = val.match(/[\w\-]+/g)[0]
                                    this.display.innerHTML = this.template(_val) ? this.template(_val)() : "<div>Resource Not Found.</div>";
                                }
                            }
                        }
                    };
                }

                set template(value) {
                    this.Templates ? true : this.Templates = {};
                    if (Dashing.typeOf(value) === "object" && value.id && value.template && !this.template[value.id]) {
                        this.Templates[value.id] = value.template;
                    }
                }
                get template() {
                    return function GetTemplate(name) { return this.Templates[name] ? this.Templates[name] : false; }
                }
            };

            elems.xPanel = class xPanel extends HTMLElement {
                set drawer (value) {
                    this.extension.icons.drawer = value;
                }
                get drawer() {
                    return this.extension.icons.drawer;
                }

                static mixins() { return ["iconography", "resizer"]; }

                static lifecycle() {
                    return {
                        created: function createdXPanel() {
                            this.extension = document.querySelector("x-extension");
                            this.menu = this.menu;
                        },
                        inserted: function InsertedXPanel() {
                            this.cached = this.cached ? this.cached : {};
                            this.createCaches(this.xMenu.templateItems);
                        }
                    };
                }
                static methods() {
                    return {
                        getEditorJson: function GetEditorJson() {
                            let _textEditor = this.xContent.firstElementChild.querySelector("textarea"),
                                _jsn = null;
                            try { _jsn = JSON.parse(_textEditor.value); }
                            catch (e) { _jsn = JSON.parse('{"id": "Error"}'); }
                            return _jsn;
                        },
                        isConentCached: function IsConentCached(content) {
                            // In Work
                        },
                        createCaches: function CreateCaches(_items) {
                            if (Dashing.typeOf(_items) === "array") {
                                for (let i = 0; i < _items.length; i++) {
                                    this.cached[_items[i]] = this.xDisplay.firstElementChild.caching || {};
                                }
                            }
                        }
                    };
                }
                static attrs() {
                    return {
                        display: {
                            connected: true,
                            get: function GetPanelContent() {
                                return this.getAttribute("display") || false;
                            },
                            set: function SetPanelContent(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    this.setAttribute("display", val);
                                    this.xDisplay = this.querySelector(val);
                                }
                                else { this.xDisplay = this; }
                            }
                        }, 
                        menu: {
                            connected: false,
                            get: function GetPanelMenu() {
                                return this.getAttribute("menu") || false;
                            },
                            set: function SetPanelMenu(val) {
                                if (Dashing.typeOf(val) === "string" && this.querySelector(val)) {
                                    this.setAttribute("menu", val);
                                    this.xMenu = this.querySelector(val);
                                }
                            }
                        }, 
                        minimized: {
                            connected: true,
                            get: function GetMinimized() { return this.hasAttribute("minimized") ? true : null; },
                            set: function SetMinimized(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("minimized", "true");
                                    this.xMenu.display.style.display = "none";
                                    this.normalized = false;
                                }
                                else if (val === false || val === "false") {
                                    this.removeAttribute("minimized");
                                    this.xMenu.display.removeAttribute("style");
                                }
                            }
                        }, 
                        normalized: {
                            connected: true,
                            get: function GetEnlarged() { return this.hasAttribute("normalized") ? true : null; },
                            set: function SetEnlarged(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("normalized", "true");
                                    this.maximized = false;
                                    this.minimized = false;
                                }
                                else if(val === false || val === "false") {
                                    this.removeAttribute("normalize");
                                }
                            }
                        }, 
                        maximized: {
                            connected: true,
                            get: function GetMaximized() { return this.hasAttribute("maximized") ? true : null; },
                            set: function SetMaximized(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("maximized", "true");
                                    this.normalized = false;
                                    this.minimized = false;
                                    this.setAttribute("style", "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100000; background-color: white;");
                                }
                                else if (val === false || val === "false") {
                                    this.removeAttribute("maximized");
                                    this.removeAttribute("style");
                                }
                            }
                        }, 
                        "resizer-options": {
                            connected: true,
                            get: function GetPanelResizer() {
                                return this.getAttribute("resizer-options") || false;
                            },
                            set: function SetPanelResizer(val) { 
                                if (Dashing.typeOf(val) === "string" && this.querySelector(val)) {
                                    this.setAttribute("resize-options", val);
                                    this.resizerBar = true;
                                    let _container = this.querySelector(val),
                                        _panelresizer = document.createElement("div");
                                        _panelresizer.setAttribute("resizer-menu", "true");

                                    _panelresizer.innerHTML = `<button icon="minimize" title="Minimize">${"_"}</button>
                                            <button icon='normal' title="Normal">${"[]"}</button>
                                            <button icon='maximize' title="Maximize">${"[-]"}</button>`;
                                    _container.insertAdjacentElement("afterbegin", _panelresizer);
                                }
                                else if (val === "true") {
                                    this.setAttribute("resize-options", val);
                                    this.resizerBar = true;
                                    let _container = document.createElement(`div`);
                                    _container.setAttribute("resizer-menu", val);
                                    _container.innerHTML = `<button icon="minimize" title="Minimize">${"_"}</button>
                                            <button icon='normal' title="Normal">${"[]"}</button>
                                            <button icon='maximize' title="Maximize">${"[-]"}</button>`;
                                    this.insertAdjacentElement("beforeend", _container);
                                }
                            }
                        }
                    };
                }
                static events() {
                    return {
                        "click(x-menu > button[panel-content])": function ChangePanelContent(e) {
                            let _panel = this.getAttribute("panel-content"),
                                _menu = this.parentNode; 
                            if (_menu.displayCurrent !== _panel) {
                                // Display's new content for the panel
                                // Need to validate data for print before we set the current display.
                                _menu.displayCurrent = _panel;
                            }
                        }
                    };
                }
            };

            elems.xBook = class xBook extends HTMLElement {
                static mixins() { return ["iconography", "resizer"]; }

                static lifecycle() {
                    return {
                        created: function Created() {
                            let book = this;
                            this.querySelectorAll("x-page").forEach(function (node, i) {
                                if (Number(book.page) - 1 === i) { node.active = true; }
                            });
                            this.extension = Dashing.extension;
                            this.id = this.id ? this.id : "xbook" + document.getElementsByTagName("x-book").length;
                        },
                        inserted: function Insert() {
                            this.extension.book = this.extension.book ? this.extension.book : {
                                id: this.id || Dashing.uid() + "auto-book-id",
                                pages: {
                                    length: this.querySelectorAll("x-page").length || 0,
                                    elements: this.querySelectorAll("x-page")
                                }
                            };

                        }
                    };
                }

                static methods() {
                    return {
                        createPageTabs: function CreatePageTabs(page) {
                            //
                        },
                        progressPageCounter: function ProgressPageCounter() {
                            this.pageCounter.innerHTML = `${this.page}/${this.pages}`;
                        }

                    };
                }

                static attrs() {
                    return {
                        pages: {
                            connected: true,
                            get: function GetPages() { return this.querySelectorAll("x-page").length; },
                            set: function SetPages(value) {
                                let val = this.querySelectorAll("x-page").length;
                                if (typeof value === "number") { val = value; }
                                this.setAttribute("pages", val);
                            }
                        },
                        page: {
                            connected: true,
                            set: function SetBookPage(val) { val ? this.setAttribute("page", val) : this.setAttribute("page", "1"); },
                            get: function GetBookPage() { return Number(this.getAttribute("page")); }
                        },
                        "book-menu": {
                            connected: true,
                            get: function GetBookMenu() {
                                //
                            },
                            set: function SetBookMenu(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    this.setAttribute("book-menu", val);
                                    let bookmenu = this.querySelector("[main-book-menu]");
                                    if (bookmenu) {
                                        
                                        this.xMenu = bookmenu;
                                        
                                    }
                                    else {
                                        let node = document.createElement("x-menu");
                                            node.setAttribute("main-book-menu", "true");
                                            this.insertAdjacentElement("afterbegin", node);
                                        this.xMenu = this.querySelector(`[main-book-menu]`);
                                        this.xMenu.displayTarget = `x-page[active]`;
                                    }
                                    switch (val) {
                                        case "left":
                                            this.xMenu.setAttribute("style", `position: sticky; display: flex; flex-direction: column;`)
                                            break;
                                        case "top":
                                            this.xMenu.setAttribute("style", `position: sticky; display: flex; flex-direction: column; top: 0px; left: 0px; min-width: 100%; `);
                                            break;
                                        case "right":
                                            break;
                                        case "bottom":
                                            break;
                                        case "false":
                                        case "hide":
                                        case "minimize":
                                        case "":
                                        default:
                                            this.xMenu.removeAttribute("style"); 
                                            break;
                                    }
                                }
                            }
                        },
                        "book-controls": {
                            connected: true,
                            get: function GetBookControls() {
                                return this.getAttribute("book-controls") || false;
                            },
                            set: function SetBookControls(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    Dashing.fnQuery.call(this, `${val}`, function BookControlsFn(controls) {
                                        // 
                                    }, function BookControlsNullFn() {
                                            let ctls = document.createElement("div");
                                                ctls.setAttribute("control-menu", val);
                                            ctls.innerHTML = `<button book-icon="page-decrement" for-book="#${this.id}">-</button><button book-icon="page-increment" for-book="#${this.id}">+</button><aside page-counter="1">1/${this.pages}</aside>`;
                                            (this.xMenu || this).appendChild(ctls);
                                            this.pageControls = this.querySelector("[control-menu]");
                                            this.pageCounter = this.querySelector("[page-counter]");
                                            this.pageControls.querySelector(`button[book-icon="page-decrement"]`).addEventListener("click", function PageLeft(e) {
                                                console.log(this);
                                                let n = document.querySelector(this.getAttribute("for-book")),
                                                    index = n.page,
                                                    _nodes = n.querySelectorAll("x-page"),
                                                    pages = n.pages;
                                                if (index <= 1) {
                                                    n.page = pages;
                                                    _nodes[0].active = false;
                                                    _nodes[pages - 1].active = true;
                                                }
                                                else {
                                                    n.page = index - 1;
                                                    _nodes[index - 1].active = false;
                                                    _nodes[index - 2].active = true;
                                                }
                                                n.progressPageCounter();
                                            });
                                            this.pageControls.querySelector(`button[book-icon="page-increment"]`).addEventListener("click", function PageLeft(e) {
                                                let n = document.querySelector(this.getAttribute("for-book")),
                                                    index = n.page,
                                                    _nodes = n.querySelectorAll("x-page"),
                                                    pages = n.pages;
                                                if (index >= pages) {
                                                    n.page = 1;
                                                    _nodes[pages - 1].active = false;
                                                    _nodes[0].active = true;
                                                }
                                                else {
                                                    n.page = Number(index + 1);
                                                    _nodes[index - 1].active = false;
                                                    _nodes[index].active = true;
                                                }
                                                n.progressPageCounter();
                                            });
                                        });
                                }
                            }
                        },
                        "book-resizer": {
                            connected: true,
                            get: function GetBookResizer() {
                                return this.getAttribute("book-resizer") || false;
                            },
                            set: function SetBookResizer(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    this.setAttribute("book-resizer", val);
                                    let tar = this.querySelector(val);
                                    Dashing.fnQuery.call(tar, `[resizer-menu]`, function BookResizerFn(resizer) {
                                        console.log(resizer);
                                    },
                                        function BookResizerNullfn(resizer) {
                                            let rzr = document.createElement("div");
                                                rzr.setAttribute("resizer-menu", "true");
                                            rzr.innerHTML = `<button icon="minimize" title="Minimize">${"_"}</button>
                                                <button icon='normal' title="Normal">${"[]"}</button>
                                                <button icon='maximize' title="Maximize">${"[-]"}</button>`;
                                            tar.appendChild(rzr);
                                        });
                                }
                            }
                        },
                        "book-title": {
                            connected: true,
                            get: function GetBookTitle() { return this.getAttribute("book-title") || false; },
                            set: function SetBookTitle(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    let stg = /\<script|onclick|onmouseover|onmouseout|obdblclick/gi.test(val) === true ? "not allowed error" : val
                                    this.setAttribute("book-title", stg);
                                    Dashing.fnQuery.call(this, `[book-icon]`, function BookTitleFn(title) {
                                        title.innerHTML = val;
                                    },
                                        function BookTitleNullfn(title) {
                                            
                                        });
                                }
                            }
                        },
                        "tabbed-book": {
                            connected: true,
                            get: function GetTabbedBook() {
                                return this.getAttribute("tabbed-book") || false;
                            },
                            set: function SetTabbedBook(val) {
                                if (Dashing.typeOf(val) === "string") {
                                    Dashing.fnQuery(`#${val}`, function TabbedBookQuery(doc) {
                                        //
                                    },
                                        function TabbedBookQueryNull(doc) {
                                            //
                                        });
                                }
                            }
                        }

                    };
                }

                static events() {
                    return {
                    };
                }

                // setters/getters
                set drawer(value) {
                    this.extension.icons.drawer = value;
                }
                get drawer() {
                    return this.extension.icons.drawer;
                }
                get writer() { return Dashing.writer; }

            };

            elems.xPage = class xPage extends HTMLElement {

                static lifecycle() {
                    return {
                        create: function created() {
                            this.activeContent ? this.activeContent = this.activeContent : null;
                        }
                    };
                }

                static methods() {
                    return {
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
                            connected: true,
                            set: function SetActive(val) { val === false ? this.removeAttribute("active") : this.setAttribute("active", val); },
                            get: function GetActive() { return this.hasAttribute("active"); }
                        },
                        selected: {
                            get: function GetSelected(val) { return this.getAttribute("selected"); }
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
                        workspaces: {
                            set: function SetWorkspaces(val) {
                                this._workspace ? true : this._workspace = { length: 0 };

                                this._workspace[val.id] ? this.setAttribute("workspaces", `Info: ${val.id} already defined.`) :
                                    (this._workspace[val.id] = val, this._workspace.length += 1, this.setAttribute("workspaces", "true"));

                            },
                            get: function GetWorkspaces() { return function GetWorkspace(val) { return this._workspace[val]; }; }
                        }
                    };
                }

                static events() {
                    return {
                    };
                }
            };

            elems.xHeader = class xHeader extends HTMLElement {
            };

            elems.xFooter = class xFooter extends HTMLElement {
            };

            elems.xShiftbox = class extends HTMLElement {

                static methdos() {
                    return {
                        toggleOverlay: function ToggleOverlay(box, fn) {
                            let section = this.querySelector('section');
                            if (section && box.tapclose) {
                                section[fn](box.xtag.tapoverlay);
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
                        'collapse-button': {
                            set: function SetAllowCollapse(opts) {
                                // 
                            },
                            get: function GetAllowCollapse() {
                                //
                            }
                        },
                        'close-pane-button': {
                            set: function SetAllowCollapse(opts) {
                                if (xtag.typeOf(opts) !== "object") {
                                    let cbtn = document.createElement("button");
                                        cbtn.type = "button";
                                        cbtn.innerHTML = opts.title;
                                        cbtn.className = opts.class;
                                    opts.target.appendChild(cbtn);
                                }
                            },
                            get: function GetAllowCollapse() { return this.hasAttribute("close-pane-button"); }
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
                        'dblclick(x-shiftbox[tapclose] > aside)': function OpenShiftbox(e) {
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

            elems.xTabbox = class xTabbox extends HTMLElement {
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
                        'tap(x-tabbox > menu > *)': function TapSelectEvent(e) {
                            xtag.fireEvent(this, "selectEvent", { detail: { index: Number(e.target.getAttribute("index")) } });
                        }
                    };
                }

                static lifecycle() {
                    return {
                        created: function Created() {
                            this.selectedIndex = this.selectedIndex;
                        }
                    };
                }

                static attrs() {
                    return {
                        'tab-lements': {
                            get: function TabElements() {
                                return xtag.queryChildren(this, 'menu > *');
                            }
                        },
                        'panel-elements': {
                            get: function PanelElements() {
                                return xtag.queryChildren(this, 'ul');
                            }
                        },
                        'selected-index': {
                            set: function (val) {
                                this.setAttribute("selected-index", val);
                            },
                            get: function () { return this.getAttribute("selected-index"); }
                        },
                        'selected-tab': (function () { return Dashing.createAccessor("menu > [selected]"); })(),
                        'selected-panel': (function () { return Dashing.createAccessor("menu > [selected]"); })()
                    };
                }
            };

            elems.xTable = class xTable extends HTMLElement { 

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
                            return "";
                        },
                        cellResponse: function CellResponse(msgs) {
                            return "";
                        },
                        removeCell: function RemoveCell(_cell) {
                            // 
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
                        'database-active': {
                            set: function SetActiveDB(val) {
                                this.setAttribute("database-active", this.databaseActive);
                            },
                            get: function GetActiveDB() { return this.getAttribute("database-active"); }
                        },
                        'allow-menu': {
                            set: function SetMenu(val) {
                                
                                this.setAttribute("allow-menu", "true");
                            },
                            get: function GetMenu() { return this.getAttribute("allow-menu"); }
                        },
                        'allow-pagination': {
                            set: function SetPagination(_target) {
                                this.setAttribute("allow-pagination", this.allowPagination);
                            },
                            get: function () { return this.getAttribute("allow-pagination"); }
                        },
                        'allow-refresh': {
                            set: function SetRefresh(_tar) {
                                //
                            },
                            get: function GetAllowRefresh() {
                                return this.getAttribute("allow-refresh");
                            }
                        },
                        'table-form': {
                            get: function GetTableForm() { return this.tForm; },
                            set: function SetTableForm(fm) { this.tForm = fm; }
                        },
                        'command-cell': {
                            get: function GetCommandCell() { return this.cmdCell; },
                            set: function SetCommandCell(_cell) { this.cmdCell = _cell; }
                        },
                        'table-confirm': {
                            get: function GetTableConfirm() {
                                return this.hasAttribute("table-confirm");
                            },
                            set: function SetTableConfirm(opts) {
                                //
                            }
                        },
                        'cell-value': {
                            set: function SetCellValue(val) {
                                this.cValue = val;
                            },
                            get: function GetCellValue(val) {
                                return this.readCellValue(this.cValue);
                            }
                        },
                        'message': {
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
                        'multiline-enabled': {
                            set: function SetMultilineEnabled(target) {
                                let frag = xtag.createFragment(`<button type="button"><h3>+</h3></button>`);
                                target.appendChild(frag);
                                this.multiline = frag;
                            }
                        },
                        'data-book': {
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
                        activeToggle: function ToggleModal(n) {
                            n.active = n.active === false ?
                                m.active = true :
                                n.active = false;
                        }
                    };
                }

                static lifecycle() {
                    return {
                        created: function CreatedModal() {
                            this.overlayElement = document.createElement('x-modal-overlay');
                        },
                        inserted: function InsertedModal() {
                            if (Dashing.BrowserInfo.oldiOS || Dashing.BrowserInfo.oldDroid) { setTop(this); }
                        },
                        removed: function RemoveModal() {
                            //
                        }
                    };
                }

                static events() {
                    return {
                        'tap(button[value="Confirm"])': function ConfirmPlatform(e) {
                            //
                        },
                        'tap(button[toggler])': function ChangePlatform(e) {
                            let n = document.getElementById(this.getAttribute("toggler"));
                            n.activeToggle.call(this, n);
                        }
                    };
                }

                static attrs() {
                    return {
                        active: {
                            set: function SetActive(val) {
                                if (Dashing.typeOf(val) === "string" || val === true) {
                                    this.setAttribute("active", val);
                                }
                                else if (val === false) { this.removeAttribute("active"); }
                            },
                            get: function GetActive() { return this.hasAttribute("active") || null; }
                        },
                        overlay: {
                            connected: true,
                            get: function GetOverlay() { return this.hasAttribute("overlay"); },
                            set: function SetOverlay(value) {
                                if (value === true && !this.overlayReady) {
                                    this.insertAdjacentElement("afterend", this.overlayElement);
                                    this.overlayReady = true
                                    this.overlayElement = this.nextElementSibling;

                                }
                            }
                        },
                        'toggle': {
                            connected: true,
                            get: function GetToggle() {
                                return this.getAttribute("toggle") || false;
                            },
                            set: function SetToggle(val) {
                                if (val === false) { this.removeAttribute("toggle"); }
                                this.setAttribute("toggle", val);
                                let n = document.getElementById(val);
                                if (!n) {
                                    n = document.createElement("button");
                                    n.setAttribute("id", val);
                                    this.id = this.id ? this.id : `xmodal-${document.getElementsByTagName("x-modal").length}`;
                                    n.setAttribute("toggler", this.id);
                                    n.innerHTML = "|O|";
                                    this.Toggle = n;

                                    this.appendChild(n);
                                }
                                else {
                                    this.Toggle = n;
                                }
                            }
                        },
                        'escape-hide': {
                            get: function () { return this.hasAttribute("escape-hide"); },
                            set: function (val) { this.setAttribute("escape-hide", val); }
                        },
                        'click-hide': {
                            get: function ClickHide() { return this.hasAttribute("click-hide"); },
                            set: function ClickHide(val) {
                                this.setAttribute("click-hide", "true");
                            }
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
                        'message-display': {
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
        // User Interaction property
        platformPrompt: true,
        celements: true,
        'add(mixin=dashed)': class Dashed {
            static methods() {
                return {
                    add: function AddDashed(name, options) {
                        // Send name through switch default return console warning.
                        switch (name) {
                            // 
                            case "fragment":
                                //
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
            static attrs() {
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
        'add(mixin=iconography)': class Drawing {
            static methods() {
                return {
                    addResizerIcons: function AddResizerIcons(opts) {
                        for (let i = 0; i < opts.snippets.length; i++) {
                            let icons = opts.snippets;
                            this.extension.icons.insertIcon(this.xMenu.querySelector(`button[icon="${icons[i]}"]`),
                                {
                                    snippet: icons[i],
                                    insertAt: opts.insertAt || "afterbegin",
                                    overwrite: opts.overwrite || true,
                                    type: opts.type || "svg",
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                        }
                    },
                    addLogoIcon: function AddLogoIcon(opts) {
                        this.extension.icons.insertIcon(this.xMenu.querySelector("strong[logo]") || this.xMenu,
                            {
                                snippet: "logo",
                                insertAt: opts.insertAt || false,
                                overwrite: opts.overwrite || false,
                                type: opts.type,
                                insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                            });
                    },
                    addContentIcons: function AddContentIcons(opts) {
                        let _this = this;
                        this.xMenu.templateItems.forEach(function appendContentIcons(item, index) {
                            _this.extension.icons.insertIcon(_this.querySelectorAll("button[panel-content]")[index],
                                {
                                    snippet: item,
                                    insertAt: opts.insertAt || false,
                                    overwrite: opts.overwrite || true,
                                    type: opts.type,
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                        });
                    },
                    insertIcons: function InsertPanelIcon(type, opts) {
                        switch (type) {
                            case "content":
                                this.addContentIcons({
                                    overwrite: opts.overwrite || true,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: opts.snippets || this.templateItems,
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                break;
                            case "resizer":
                                this.addResizerIcons({
                                    overwrite: opts.overwrite,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: ["minimize", "normal", "maximize"],
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                break;
                            case "logo":
                                this.addLogoIcon({
                                    overwrite: opts.overwrite,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: "logo",
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                break;
                            case "all":
                            case "*":
                                this.addLogoIcon({
                                    overwrite: opts.overwrite,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippet: "logo",
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                this.addResizerIcons({
                                    overwrite: opts.overwrite,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: ["minimize", "normal", "maximize"],
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                this.addContentIcons({
                                    overwrite: opts.overwrite,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: opts.snippets || this.templateItems,
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                break;
                            default:
                                console.log(opts.snippets);
                                this.extension.icons.insertIcon(this, {
                                    overwrite: opts.overwrite || false,
                                    insertAt: opts.insertAt || "afterbegin",
                                    type: opts.type || "svg",
                                    snippets: opts.snippets || [],
                                    insertIndex: opts.insertAt === "insertAt" ? opts.insertionIndex || 0 : false,
                                    drawer: Dashing.typeOf(opts.drawer) === "function" ? opts.drawer : false
                                });
                                break;
                        }
                    }
                };
            }
            static attrs() {
                return {
                    iconography: {
                        connected: true,
                        get: function GetIconography() { return this.hasAttribute("iconography"); },
                        set: function SetIconography(value) {
                            if (value === "true" || value === true) {
                                this.setAttribute("iconography", "true");
                                this.drawer = value.drawer ? value.drawer : false;
                                this.insertIcons("*", {
                                    insertAt: "before",
                                    type: "svg",
                                    overwrite: true,
                                    drawer: Dashing.typeOf(value.drawer) === "function" ? value.drawer : false
                                });
                            }
                            else if (Dashing.typeOf(value) === "object") {
                                this.setAttribute("iconography", "true");
                                this.insertIcons(value.name||"", {
                                    insertAt: value.insertAt,
                                    snippets: value.snippets,
                                    type: value.type,
                                    overwrite: value.overwrite,
                                    drawer: Dashing.typeOf(value.drawer) === "function" ? value.drawer : false
                                });
                            }
                            else if (value === "false" || value === false) { this.removeAttribute("iconography"); }
                        }
                    }
                };
            }
        },
        'add(mixin=resizer)': class Themed {
            static events() {
                return {
                    "click(x-menu > div[resizer-menu] > button[icon])": function ResizePanel(e) {
                        let _parent = this.parentNode.parentNode.parentNode;
                        switch (this.getAttribute("icon")) {
                            case "minimize":
                                _parent.minimized = true;
                                break;
                            case "normal":
                                _parent.normalized = true;
                                break;
                            case "maximize":
                                _parent.maximized = true;
                                break;
                        }
                    }
                };
            }
            static attrs() {
                return {
                    minimized: {
                        connected: true,
                        get: function GetMinimized() { return this.hasAttribute("minimized") ? true : null; },
                        set: function SetMinimized(val) {
                            if (val === true || val === "true") {
                                this.setAttribute("minimized", "true"); 
                                this.xMenu.display.style.display = "none"; 
                                this.normalized = false; 
                            }
                            else if (val === false || val === "false") {
                                this.removeAttribute("minimized");
                                this.xMenu.display.removeAttribute("style");
                            }
                        }
                    },
                    normalized: {
                        connected: true,
                        get: function GetEnlarged() { return this.hasAttribute("normalized") ? true : null; },
                        set: function SetEnlarged(val) {
                            if (val === true || val === "true") {
                                this.setAttribute("normalized", "true");
                                this.maximized = false;
                                this.minimized = false;
                            }
                            else if (val === false || val === "false") {
                                this.removeAttribute("normalize");
                            }
                        }
                    },
                    maximized: {
                        connected: true,
                        get: function GetMaximized() { return this.hasAttribute("maximized") ? true : null; },
                        set: function SetMaximized(val) {
                            if (val === true || val === "true") {
                                this.setAttribute("maximized", "true");
                                this.normalized = false;
                                this.minimized = false;
                                this.setAttribute("style", "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100000; background-color: white;");
                            }
                            else if (val === false || val === "false") {
                                this.removeAttribute("maximized");
                                this.removeAttribute("style");
                            }
                        }
                    }

                };
            }
        },
        'add(prototype=toggle)': Toggle,
        'add(prototype=localDB)': localDB,
        'add(prototype=model)': Model,
        'add(prototype=validator)': Validator
    });

})();