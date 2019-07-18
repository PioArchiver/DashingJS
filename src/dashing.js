/** ____________________ Dashing Core Custom Elements Package ____________________ **/
/** ____________________
 *
 * Copyright 2018,
 * Licencse MIT
 * Author Many
 * Description Made for the Kippikio Share Listing Template based of the WordPress framework.
 *
 * @THANKS TO EVERYONE WHO HAS CONTRIBUTED CODE TO THE CORE OF THIS OPEN SOURCE PROJECT.
____________________ **/

/*
 * Next Step: Test Validation and write validations for all the selected modes 
 * 1. Patron 
 * 2. Graph 
 * 3. Non-Profit 
 * 4. Image 
 * */

(function Dashio() {
    const rules = {},
          // FormViews and DataForms method properties return a HTML string
		  FormViews = {
			  "Editor-View": function EditorViewTemplate() {
				  return `<textarea id="Editor-View"></textarea>`;
			  },
			  "Form-Sheet-View": function FormSheetViewTemplate() {
				  return `<div id="Form-Sheet-View"></div>`;
			  }  
		  },
		  DataForms = {
            "Patron": function PatronsSheetTemplate(type, data) {
                  console.log(data);
                return `<div name="formViewInputs">
			        <h1>Patron Data</h1>
				    <label class="block"><span>Business Name</span> <input name="business_name" type="text" /></label>
				    <label class="block"><span>Logo</span> <input name="business_logo" type="file" /></label>
				    <label class="block"><span>Tagline</span> <input name="business_tagline" type="text" /></label>
				    <label class="block"><span>Business Phone</span> <input name="business_phone" type="text" /></label>
				    <label class="block"><span>Business E-mail</span> <input name="business_email" type="text" /></label>
                </div>`;
            },
			"Graph": function GraphSheetTemplate() {
                return `<div name="formViewInputs">
					<h1>Graph Data</h1>
					<label class="block"><span>Graph Name</span> <input type="text" /></label>
					<label class="block"><span class="block">Graph Text</span> <textarea></textarea></label>
					<label class="block"><span>Data</span> <input type="file" /></label>
					<label class="block"><span>Graph Type</span> <input type="text" /></label>
					<x-table></x-table>
				</div>`;
			},
			"Non-Profit": function ServiceSheetTemplate() {
				return `<div name="formViewInputs">
					<h1>Non-Profit Patron</h1>
					<label class="block"><span>Non-Profit Name</span> <input type="text" /></label>
					<label class="block"><span>Logo</span> <input type="file" /></label>
					<label class="block"><span>Tagline</span> <input type="text" /></label>
					<label class="block"><span>Non-Profit Phone</span> <input type="text" /></label>
					<label class="block"><span>Non-Profit E-mail</span> <input type="text" /></label>
				</div>`;
			},
			"Image": function ImageSheetTemplate() {
                return `<div name="formViewInputs">
					<h1>Image Data</h1>
					<label class="block"><span>Image Name</span> <input type="text" /></label>
					<label class="block"><span class="block">Image Text</span> <textarea></textarea></label>
					<label class="block"><span>Image File</span> <input type="file" /></label>
				</div>`;
			}
		};

    // The key names of the object `_validate_data` are formatted as follows: 
    // Dashed seperated terms
    // First term is either form or editor
    // Second term is the name of the selected value
    // Everything is lowercased
    const validater = {
        "form-graph": function ValidateFormData(panel, _form, detail) { },
        "editor-graph": function ValidateEditorData(panel, _form, detail) { },

        "form-patron": function ValidateFormResources(panel, _form, detail) {
            let _data = _form.elements;
            console.log(detail);
            for (let i = 0; i < (_data || []).length; i++) {
                let _item = _data[i];
                if ((_item.value || _item.value === "") && _item.name !== "") {
                    if (jsn.current.status === null) {
                        let cloned = Dashing.clone(detail.map[_item.name]);
                        // detail.current[_item.name] = cloned;
                        // detail.current[_item.name].value = _item.value;
                        if (jsn.map) {
                            // detail.map[_item.name] ? detail.current[_item.name] ? detail.map[_item.name];
                        }
                    }
                }

            }
        },
        "editor-patron": function ValidateEditorResources(panel, _form, detail) {
            let _pmenu = panel.xMenu;
            let _current = _pmenu.displayCurrent;

            for (let i in detail) {
                //
            }

            return detail;
        },

        "form-nonprofit": function (panel, _form, detail) { },
        "editor-nonprofit": function (panel, _form, detail) { },

        "form-image": function (panel, _form, detail) { },
        "editor-image": function (panel, _form, detail) { }
    };

    // This could be left out I think.
    var stylesheet = document.getElementById("ApplicationInlineStyleElement"),
      	sheet = null;
    if(stylesheet) {
      sheet = stylesheet.sheet;
    }
    else {
      var sy = document.createElement("style");
        sy.id = "ApplicationInlineStyleElement";
      document.body.appendChild(sy);
    }
	
    function noop() { return false; }
    var Dashing = null;
    class dashboard {
        constructor(dashed) {
            let ceObj = this.convertToCamels(dashed.namespaces);
                ceObj.setShadow = function SetShadow(name, template, open) {
                    return new Promise((resolve, reject) => {
                        if (this[name]) {
                            resolve(this[name], template ? template : ``, open !== undefined ? open : false);
                        }
                        else {
                            reject(name);
                        }
                    });
                };
                ceObj.getShadow = function GetShadow(name) { 
                    //
                };
                ceObj.queryShadow = function QueryShadow(name) {
                    // 
            };
            Dashing = this;

            let ceElems = dashed.elementals(ceObj),
				count = 0;
			this.BrowserInfo = this.browserInfo();
            for (var ce in ceElems) {
                xtag.register(dashed.namespaces[count], ceElems[ce]);
                count++;
            }
        }
        write(elem, msgs, fragFunc) {
            let _frag = null;

            if (xtag.typeOf(msgs) === "object" && /^editor\-view/i.test(msgs.current.status) === true) {
                _frag = fragFunc("editor-view", msgs);


            }
            else if (xtag.typeOf(msgs) === "object" && /^form\-view/i.test(msgs.current.status) === true) {
                _frag = fragFunc("form-view", msgs);
                _frag = xtag.typeOf(_frag) === "string" ? xtag.createFragment(_frag) : _frag; 
                elem.parentNode.isShadowAttached ? Dashing.attachShadowChild(elem, _frag) : elem.appendChild(_frag);
            }
            return elem;
        }
        convertToCamels(namespaces) {        	
        	var ceOBJ = {}
        	for(var i = 0; i < namespaces.length; i++) {
        		var name = namespaces[i],
					keyname = name.replace(/\-\w/g, function ceNameRexex(matched) { 
					return matched.replace("-", "").toUpperCase();  
				} ); 
				ceOBJ[keyname] = null; 
			}
			return ceOBJ;
        }
        browserInfo() {
            var browmtc = navigator.userAgent.match(/Firefox|OPR|Edge|Chrome/g),
                oldiOS = /OS [1-4]_\d like Mac OS X/i.test(navigator.userAgent),
                oldDroid = /Android 2.\d.+AppleWebKit/.test(navigator.userAgent),
                gingerbread = /Android 2\.3.+AppleWebKit/.test(navigator.userAgent),
                response = {};
            response.browser = browmtc ? 
				browmtc[0] : 
					"Error: The browser you're using couldn't be found.";
            response.oldiOS = oldiOS;
            response.oldDroid = oldDroid;
            response["android_v2-3"] = gingerbread;
            return response;
        }
        excludeObjectKeys(keys, obj, excludes) {
            if (keys === "*") {
                var _keys = Object.keys(obj),
                    _rex = {};
                for (var c = 0; c < excludes.length; c++) {
                    for (var k = 0; k < _keys.length; k++) {
                        if (_keys[k] !== excludes[c]) {
                            _rex[_keys[k]] = obj[_keys[k]];
                        }
                    }
                }
                return _rex;
            }
            var r = {};
            for (var i = 0; i < keys.length; i++) { r[keys[i]] = obj[keys[i]]; }
            return r;
        }
        fnQuery(query, fn) {
            var qy = document.querySelector(query);
            return fn(qy);
        }
        clone(data) {
            let type = xtag.typeOf(data);
            switch (type) {
                case "object":
                    let obj = Object.create(null);
                    for (let key in data) {
                        obj[key] = data[key];
                    }
                    return obj;
            }
        }
    }
   
    Dashing = new dashboard({
        namespaces: [
            "x-date", "x-menu",
            "x-panel", "x-form",
            "x-canvas", "x-press",
            "x-json"
        ],
        elementals: function Elementals(elems) {
            elems.xPress = class xPress extends HTMLElement {
                connectedCallback() {
                    this.getComments(true);
                    let _this = this;
                    let jPromise = new Promise(function JPromise(resolve, reject) {
                        resolve(_this);
                    });
                    jPromise.then(function resolveJPromise(val) {
                        _this.jsonData = _this.jsonData;
                    });
                    jPromise.catch(function rejectJPromise(val) {
                        console.log("error");
                    });
                    jPromise.finally(function fnallyJPromise(val) {
                        console.log(_this.Json);
                        _this.querySelector("div[validated-data]").innerHTML = JSON.stringify(_this.Json);

                    });

                }
                static methods() {
                    return {
                        validateContent: function ValidateContent() {
                            //	
                        },
                        getComments: function GetComments(remove) {
                            let _c = [],
                                _this = this,
                                iterator = document.createNodeIterator(
                                    this,
                                    NodeFilter.SHOW_COMMENT,
                                    function CommentNodeFilters(node) {
                                        if (remove === true) {
                                            _this.removeChild(node);
                                            _c = true;
                                        }
                                        else {
                                            _c.push(node);
                                        }
                                    }
                                );
                            iterator.nextNode();
                            return _c;
                        }
                    };
                }
                static attributes() {
                    return {
                        "validate": {
                            active: true,
                            connected: true,
                            get: function GetValidate() {
                                return this.getAttribute("validate") || false;
                            },
                            set: function SetValidate(val) {
                                // 
                            }
                        },
                        "json-data": {
                            active: true,
                            connected: true,
                            get: function GetJsonData() {
                                return this.hasAttribute("json-data") === false ?
                                    "default" :
                                    this.getAttribute("json-data");
                            },
                            set: function SetJsonData(val) {
                                if (val === true || val === "true" || val === "default") {
                                    let _jsnArr = this.querySelectorAll("x-json");
                                    if (!this.Json) { this.Json = JSON.parse("[]"); };
                                    for (let i = 0; i < _jsnArr.length; i++) {
                                        if (xtag.typeOf(_jsnArr[i].Json) === "array") {
                                            this.Json = this.Json.concat(_jsnArr[i].Json);
                                        }
                                        else if (xtag.typeOf(_jsnArr[i].Json) === "object") {
                                            this.Json.push(_jsnArr[i].Json);
                                        }
                                    }
                                }
                                else if (val === "false") {
                                    this.Json = false;
                                }
                            }
                        }
                    };
                }
            };

            elems.xPanel = class xPanel extends HTMLElement {
                connectedCallback() {
                    this.cached = this.cached ? this.cached : {};
                    this.createCaches(this.xMenu.templateItems);
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
                        createCaches: function CreateCaches(_items) {
                            if (xtag.typeOf(_items) === "array") {
                                for (let i = 0; i < _items.length; i++) {
                                    this.cached[_items[i]] = {
                                        id: _items[i],
                                        template: this.xMenu[_items[i]](),
                                        cached: false
                                    };
                                }
                                console.log(this.cached);
                            }
                        }
                    };
                }
                static attributes() {
                    return {
                        content: {
                            active: true,
                            connected: true,
                            get: function GetPanelContent() {
                                return this.getAttribute("content") || false;
                            },
                            set: function SetPanelContent(val) {
                                if (xtag.typeOf(val) === "string") {
                                    this.setAttribute("content", val);
                                    this.xContent = this.querySelector(`#${val}`);
                                }
                            }
                        },
                        menu: {
                            active: true,
                            connected: true,
                            get: function GetPanelMenu() {
                                return this.getAttribute("menu") || false;
                            },
                            set: function SetPanelMenu(val) {
                                if (xtag.typeOf(val) === "string") {
                                    this.setAttribute("menu", val);
                                    this.xMenu = this.querySelector(`#${val}`);
                                }
                            }
                        },
                        minimized: {
                            active: true,
                            connected: true,
                            get: function GetMinimized() { return this.hasAttribute("minimized"); },
                            set: function SetMinimized(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("minimized", "true");
                                    this.removeAttribute("style");
                                    this.xMenu.display.style.display = "none";
                                    this.removeAttribute("normalized");
                                    this.removeAttribute("maximized");
                                    this.isMinimized = true;
                                }
                                else {
                                    this.isMinimized = true;
                                    this.isMaximized = false;
                                    this.isNormalized = false;
                                    }
                            }
                        },
                        normalized: {
                            active: true,
                            connected: true,
                            get: function GetEnlarged() { return this.hasAttribute("enlarged"); },
                            set: function SetEnlarged(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("normalized", "true");
                                    this.xMenu.display.removeAttribute("style");
                                    this.removeAttribute("style");
                                    this.removeAttribute("minimized");
                                    this.removeAttribute("maximized");
                                    this.isNomralized = true;
                                }
                                else {
                                    this.isMinimized = false;
                                    this.isMaximized = false;
                                    this.isNormalized = true;
                                }
                            }
                        },
                        maximized: {
                            active: true,
                            connected: true,
                            get: function GetMaximized() { return this.hasAttribute("maximized"); },
                            set: function SetMaximized(val) {
                                if (val === true || val === "true") {
                                    this.setAttribute("maximized", "true");
                                    this.removeAttribute("minimized");
                                    this.removeAttribute("normalized");
                                    this.setAttribute("style", "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100000; background-color: white;");
                                    this.xMenu.display.removeAttribute("style");
                                    this.isMaximized = false;
                                }
                                else {
                                    this.isMinimized = false;
                                    this.isMaximized = true;
                                    this.isNormalized = false;
                                }
                            }
                        },
                        "resize-options": {
                            active: true,
                            connected: true,
                            get: function GetPanelResizer() {
                                return this.getAttribute("resizer-options") || false;
                            },
                            set: function SetPanelResizer(val) {
                                if (xtag.typeOf(val) === "string" && this.querySelector(`#${val}`)) {
                                    this.setAttribute("resize-options", val);
                                    this.resizerBar = true;
                                    let _container = this.querySelector(`#${val}`),
                                        _panelresizer = xtag.createFragment(`<div panel-resizer="true">
                                        <button icon="minimize"></button>
                                        <button icon='normal'></button>
                                        <button icon='maximize'></button>
                                    </div>`);
                                    _container.insertAdjacentElement("afterbegin", _panelresizer.firstElementChild);
                                }
                                else if (xtag.typeOf(val) === "string" && this.querySelector(`#${val}`) === null){
                                    this.setAttribute("resize-options", val);
                                    this.resizerBar = true;
                                    let _container = document.createElement(`div`);
                                        _container.setAttribute('panel-resizer="true"');
                                        _container.innerHTML = `
                                            <button icon="minimize"></button>
                                            <button icon='normal'></button>
                                            <button icon='maximize'></button>
                                        </div>`;
                                    this.insertAdjacentElement("beforeend", _container);
                                }
                            }
                        }
                    };
                }
                static events() {
                    return {
                        "click:delegate(x-menu > button[panel-content])": function ChangePanelContent(e) {
                            let _panel = this.getAttribute("panel-content"),
                                _menu = this.parentNode,
                                _this = this.parentNode.parentNode;
                            if (_menu.displayCurrent !== _panel) {
                                _menu.displayCurrent = _panel;
                            }
                        },
                        "click:delegate(x-menu > div[panel-resizer] > button[icon])": function ResizePanel(e) {
                            switch (this.getAttribute("icon")) {
                                case "minimize":
                                    this.parentNode.parentNode.parentNode.minimized = true;
                                    break;
                                case "normal":
                                    this.parentNode.parentNode.parentNode.normalized = true;
                                    break;
                                case "maximize":
                                    this.parentNode.parentNode.parentNode.maximized = true;
                                    break;
                            }
                        }
                    };
                }
            };

            // x-menu is compatible with template strings.
            elems.xMenu = class xMenu extends HTMLElement {
                constructor() {
                    super();
                    this.panel = this.parentNode.nodeName === "X-PANEL" ? this.parentNode : false;
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
                        "view-canvas": function ViewCanvas() {
                            return `
                                <x-canvas id="view-canvas" class="crafts-canvas" 
									menu-resizer="resize-menu" menu-position="top" 
									canvas-display="canvas-crafts"
									canvas-tools="basic"
									canvas-data="set-simple2D">
								    <menu class="resize-menu">
                                        <div panel-resizer="true">
									        <button icon="minimize" title="Minimize"></button>
									        <button icon="normal" title="Normal"></button>
									        <button icon="maximize" title="Full Screen"></button>
                                        </div>
								    </menu>
								    <div class="canvas-container" id="graph-viewer"></div>
							    </x-canvas>`;
                        },
                        "data-canvas": function DataCanvas() {
                            return `
                                <x-canvas id="data-canvas" class="crafts-canvas" 
									menu-resizer="resize-menu" menu-position="top" 
									canvas-display="canvas-crafts"
									canvas-tools="basic"
									canvas-data="set-simple2D">
								    <menu class="resize-menu">
                                        <div panel-resizer="true">
									        <button icon="minimize" title="Minimize"></button>
									        <button icon="normal" title="Normal"></button>
									        <button icon="maximize" title="Full Screen"></button>
                                        </div>
								    </menu>
								    <div class="canvas-container" id="data-viewer"></div>
							    </x-canvas>`;
                        },
                        "editor-canvas": function PatronsData(graphs) {
                            // let dynamic = graphs.isAnimated === true ? "" : "";

// Start Template String
let _template_ = `
                <x-canvas id="editor-canvas" class="graph-editor-container">
                    <x-json graph-data="true">
                        {
                            "id": "magi-salutations"
                        }
                    </x-json>
                    <div class="awaiting-graph">
                        <div class="progress-graphic">
                            
                        </div>
                        <strong>Awaiting</strong>
                    </div>
				</x-canvas>`;
// End Template String

                            return _template_;
                        }
                    };
                }
                static attributes() {
                    return {
                        "display-target": {
                            connected: true,
                            active: true,
                            get: function GetActiveDisplay() {
                                return this.getAttribute("display-target");
                            },
                            set: function SetActiveDisplay(val) {
                                if (document.getElementById(val)) {
                                    this.setAttribute("display-target", val);
                                    this.display = document.getElementById(val);
                                }
                            }
                        },
                        "display-items": {
                            connected: true,
                            active: true,
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
                                        }
                                    }
                                }
                            }
                        },
                        "display-current": {
                            connected: true,
                            active: true,
                            get: function GetCurrentDisplay() {
                                return this.getAttribute("display-current") || false;
                            },
                            set: function SetCurrentDisplay(val) {
                                this.setAttribute("display-current", val);
                                if (val !== this.current) {
                                    this.current = val;
                                    this.templateItems[this.currentIndex] === val ? true :
                                        this.currentIndex = xtag.queryArray(this.templateItems, val);
                                    this.display.innerHTML = this[val]({
                                        hasvalidationMap: true
                                    });
                                }
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
                                let stg = node ? node.innerHTML.replace(/\\/g, "") : this.innerHTML.replace(/\\/g, "");
                                node ? node.Json = JSON.parse(stg) : this.Json = JSON.parse(stg);
                                return node ? node.Json : this.Json;
                            }
                            catch (e) {
                                this.JsonError = e;
                                return e;
                            }
                        },
                        queryJson: function QueryJson(key, data) {
                            // 
                        }
                    };
                }
                static attributes() {
                    return {
                        "validation-map": {
                            active: true,
                            connected: true,
                            get: function GetValidationMap() { return this.hasAttribute("validation-map"); },
                            set: function SetValidationMap(value) {
                                this.validationMapping = value === true ? true : (this.removeAttribute("validation-map"), false);

                                if (this.parentNode.jsonArray && this.validationMap === true) {
                                    this.parentNode.jsonArray ? this.parentNode.jsonArray.push(this.Json ? this.Json : JSON.parse(this.innerHTML)) : (this.parentNode.jsonArray = [], this.parentNode.push(this.Json ? this.Json : JSON.parse(this.innerHTML)));
                                    this.validationUid = xtag.uid();
                                    this.setAttribute("id", this.parentNode.jsonArray[this.parentNode.jsonArray.length - 1].id || "json-" + this.validationUid);
                                }
                            }
                        }
                    };
                }
            };

            elems.xCanvas = class xCanvas extends HTMLElement {
                static attributes() {
                    return {
                        "current-drawing": {
                            active: false,
                            connected: true,
                            get: function GetCurrentDrawing() {
                                return this.getAttribute("current-drawing") || false;
                            },
                            set: function SetCurrentDrawing() {
                                /*  */
                            }
                        }
                    };
                }
            };

            elems.xDate = class xDate extends HTMLElement {
                constructor() {
                    super();
                }
            };

            elems.xForm = class xForm extends HTMLElement {
                connectedCallback() {
                    this.form = this.querySelector("form");
                    // Need to check status of query so defaults can be set.
                    this.cached = this.form.elements;
                    this.jsonArray = this.jsonArray ? this.jsonArray : JSON.parse('[]');
                }
                static methods() {
                    return (function () {
                        let obj = {
                            queryJson: function QueryJson(key, data) {
                                if (xtag.typeOf(data) === "object") {
                                    return data[key] || false;
                                }
                                else if (xtag.typeOf(data) === "array") {
                                    for (let i = 0; i < data.length; i++) {
                                        let keyId = key[0],
                                            objterm = null;

                                        if (keyId === "#") {
                                            objterm = "#"+data[i].id;
                                        }
                                        else if (keyId === ".") {
                                            objterm = "."+data[i].class;
                                        }
                                        else if (keyId === "-") {
                                            objterm = "-"+data[i].name;
                                        }
                                        else if(/^\w+/gi.test(keyId) === true){
                                            objterm = keyId;
                                        }
                                        console.log(objterm);
                                        if (objterm === key) {
                                            return data[i];
                                        }
                                    }
                                }
                                else if (xtag.typeOf(data) === "nodelist") {
                                    let objId = null;
                                    for (let i = 0; i < data.length; i++) {
                                        if (!data.id) {
                                            objId = JSON.parse(data[i].innerHTML).id;
                                        }
                                        else if (data.id) { obj = data[i].id; }

                                        if (key[0] === "#" && `#${objId}` === key) {
                                            return data[i];
                                        }
                                    }
                                }
                                else {
                                    return false;
                                }
                                return null;
                            },
                            makeJson: elems.xJson.methods().makeJson,
                            initResourceSelection: function InitResourceSelections(resource) {
                                //
                            },
                            initJsonArray: function InitJsonArray(update) {
                                let res = this.querySelector("select[name='resourceSelections']"),
                                    resOpts = res.options;

                                if (!update) {
                                    for (let i = 0; i < resOpts.length; i++) {
                                        let val = resOpts[i].value;
                                        let dmap = this.jsonArray.length === 0 ? this.querySelector("x-json") : this.jsonArray;
                                        console.log(this.queryJson(`#${val.toLowerCase()}-validation-map`, this.jsonArray));
                                        let jsn = this.initResourceSelection();
                                    }
                                }
                                else if (update) {
                                    //
                                }
                            },
                            updateValidationJson: function UpdateValidationJson(form, _data) {
                                let jsnstg = "";

                                if (!form && this.form) { form = this.form; }
                                else if (form && !this.form) { this.form = form; }
                                else if (!form && !this.form) { form = this.querySelector("form"); this.form = form; }
                                else if (form && this.form) { this.form = form; }
                                else { form = false; }

                                if (!_data && this.cached) { _data = this.cached; }
                                else if (_data && !this.cached) { this.cached = _data; }
                                else if (!_data && !this.cached) { _data = form.elements; this.cached = _data; }
                                else if (_data && this.cached) { this.cached = _data; }
                                else { _data = false; }

                                let x = 0;

                                let n = this.getAttribute("resource-selection").toLowerCase();
                                let j = this.queryJson(`#${n}-validation-map`, this.mappingArray||this.querySelectorAll("x-json"));
                                let jsn = j ? this.makeJson(j) : false;
                                let fv = this.formView;
                                    fv = /^editor/i.test(fv) === true ? "editor" : /^form/i.test(fv) === true ? "form" : false;
                                let FV = /^editor/i.test(fv) === true ? "editor-view" : /^form/i.test(fv) === true ? "form-view" : false;

                                // iterate through the form to update the
                                // inputs against the validation mapping.

                                    jsn = validater[`${fv}-${n}`].apply(this, [this.parentNode.parentNode, form, jsn]);

                                this.initJsonArray();

                                    /^editor/i.test(fv) === true ? jsn.current.status = "editor-view" : /^form/i.test(fv) === true ? jsn.current.status = "form-view" : jsn.current.status = false;
                                    this.activateView(document.getElementById(this.formView), false, jsn);

                                return jsn ? jsn : false;
                            },
                            activateResource: function ActivateResource(_view, data) {
                                let resource = document.querySelector('select[id="resource-selections"]'),
                                    fview = this.formView,
                                    val = resource.value,
                                    frag = null;

                                if (/^editor/i.test(fview) === true) {
                                    Dashing.write(_view, data, this[val]);
                                }
                                else if (/^form/i.test(fview) === true) {
                                    Dashing.write(_view, data, this[val]);
                                }
                                // Need to use an enhanced version of the Dashing.writer() method so that it will check shadow dom status of each custom element.

                            },
                            activateView: function ActivateView(_view, _old_view, validated) {
                                if (xtag.typeOf(_view) !== "string" && validated && _old_view === false) {
                                    if (/^editor-view/i.test(_view.id) === true) {
                                        this.activateResource(_view, validated);
                                    }
                                    else if (/^form-view/i.test(_view.id) === true) {
                                        this.activateResource(_view, validated);
                                    }
                                    else {
                                        return false;
                                    }
                                    return true;
                                }
                                else if (xtag.typeOf(_view) === "string" && !validated && xtag.typeOf(_old_view) === "string") {
                                    let _old = document.getElementById(_old_view),
                                        _new = xtag.createFragment(this[_view]());
                                    if (_view !== "Editor-View") {
                                        this.activateResource(_new.firstElementChild);
                                    }
                                    else if (_view === "Form-View") {
                                        // 
                                    }
                                    this.firstElementChild.replaceChild(_new.firstElementChild, _old);
                                }
                            }
                        };
                        xtag.merge(obj, FormViews);
                        xtag.merge(obj, DataForms);
                        return obj;
                    })()
                }
                static events() {
                    return {
                        'change:delegate(input[type="file"])': function TapFileInput(e) {
                            let _f = this.files[0],
                                _fr = new FileReader(),
                                _this = this,
                                _xform = document.querySelector("x-form");
                            _fr.onload = function (e) {
                                // The file's text will be printed here 
                                if (/json$/.test(_this.value) === true) {
                                    document.getElementById("Editor-View").value = e.target.result;
                                    if (document.getElementById("TypeErrorDoc") !== null) {
                                        _this.parentNode.removeChild(
                                            document.getElementById("TypeErrorDoc")
                                        );
                                    }
                                }
                                else {
                                    let _TypeErrDoc = document.createElement("div");
                                    _TypeErrDoc.id = "TypeErrorDoc";
                                    _TypeErrDoc.className = "TypeErrorDoc";
                                    _TypeErrDoc.innerHTML = "File Type Not Excepted.";
                                    _this.parentNode.appendChild(_TypeErrDoc);
                                    _this.value = "";
                                    window.setTimeout(function FadeTypeErrorDoc() {
                                        _TypeErrDoc.innerHTML = "";
                                        _TypeErrDoc.outerHTML = "";
                                    }, 5000);
                                }
                            };
                            _fr.readAsText(_f);
                        },
                        'change:delegate(select[name="resourceSelections"])': function ChangeRSel(e) {
                            let _xform = this.parentNode.parentNode.parentNode,
                                val = this.value,
                                _validation_stg = val.toLowerCase().replace(/\-/, ""),
                                rSel = document.querySelector('select[name="formView"]'),
                                rSelVal = rSel.value; 
                            _xform.resourceSelection = _validation_stg;
                            _xform.setAttribute("validations",
                                _validation_stg + "-validation");
                        },
                        'change:delegate(select[name="formView"])': function ChangeFormView(e) {
                            let _xform = this.parentNode.parentNode.parentNode,
                                val = this.value,
                                _old_val = _xform.formView;
                            if (_xform.formView !== val) {
                                _xform.formView = val;
                                _xform.updateValidationJson(_xform.form, _xform.cached);
                                _xform.activateView(val, _old_val);
                            }
                            // Enhancement: Cache form data and notepad
                            // data for all views and data selections
                        },
                        'click:delegate(form > label >input[type="submit"])': function SubmitForm(e) {
                            e.preventDefault();
                            let _xform = this.parentNode.parentNode.parentNode;

                                _xform.validations = _xform.validations;
                                // Submit form after validation state is ready
                        }
                    };
                }
                static attributes() {
                    return {
                        "form-view": {
                            connected: true,
                            active: true,
                            get: function GetFormView() {
                                return this.getAttribute("form-view") || false;
                            },
                            set: function SetFormView(val) {
                                if (xtag.typeOf(val) === "string") {
                                    this.setAttribute("form-view", val);
                                }
                            }
                        },
                        "validation-mapping": {
                            active: true,
                            connected: true,
                            get: function getValidationMap() { return this.hasAttribute("validation-map"); },
                            set: function setValidationMap(value) {
                                if (value === true || value === "true") {
                                    this.setAttribute("validation-mapping", value);
                                    this.form = this.form ? this.form : this.querySelector("form");
                                    this.cached = this.cached ? this.cached : this.form.elements;
                                    this.isCached = true;
                                    this.mappingArray = this.querySelectorAll("x-json[validation-map]");
                                    this.updateValidationJson(this.form, this.cached);
                                }
                                else if (value === false) {
                                    this.removeAttribute("validation-mapping");
                                    this.mappingArray = false;
                                    this.isCached = false;
                                }
                            }
                        },
                        "resource-selection": {
                            connected: true,
                            active: true,
                            get: function GetResourceSelection() {
                                return this.getAttribute("resource-selection") || false;
                            },
                            set: function SetResourceSelection(val) {
                                if (xtag.typeOf(val) === "string") {
                                    this.setAttribute("resource-selection", val);
                                    let jsn = this.updateValidationJson(this.form, this.cached);
                                    this.activateView(this.formView);
                                    if (jsn) { /**/ }
                                }
                            }
                        },
                        validations: {
                            connected: false,
                            active: true,
                            get: function GetValidations() {
                                return this.getAttribute("validations") || false;
                            },
                            set: function SetValidations(val) {
                                if (xtag.typeOf(val) === "string") {
                                    if (xtag.typeOf(this.resourceSelection) === "string") {
                                        let m = val.match(/^\w+/gi);
                                        this.resourceSelection = m[0];
                                        this.updateValidationJson(this.form, this.cached);
                                        console.log(this[val]);
                                    }
                                    else {
                                        throw "Validation Error: Check your resource-selection.";
                                    }
                                }
                                else {
                                    throw "Validation Error: Check your validations.";
                                }
                            }
                        }
                    };
                }
            };

            // Object returned must be in the same order that 
            // they are presented in the namespace array.
            return {
                xDate: elems.xDate,
                xMenu: elems.xMenu,
                xPanel: elems.xPanel,
                xForm: elems.xForm,
                xCanvas: elems.xCanvas,
                xPress: elems.xPress,
                xJson: elems.xJson
            };
        }
    });

})();
