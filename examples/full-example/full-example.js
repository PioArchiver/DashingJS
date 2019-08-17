/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-json-demo",
        template: function XTableDemo() {
            return `<x-form><form><textarea><x-table></x-table></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-extension-demo",
        template: function XFormDemo() {
            return `<x-form><form><textarea><x-extension></x-extension></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-book-demo",
        template: function XMenuDemo() {
            return `<x-form><form><textarea><x-book></x-book></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-panel-demo",
        template: function XTableDemo() {
            return `<x-form><form><textarea><x-panel></x-panel></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-page-demo",
        template: function XFormDemo() {
            return `<x-form><form><textarea><x-page></x-page></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-table-demo",
        template: function XTableDemo() {
            return `<x-form><form><textarea><x-table></x-table></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-header-demo",
        template: function XFormDemo() {
            return `<x-form><form><textarea><x-header></x-header></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    Dashing.querySelector("#dashingjs-builder-menu").template = {
        id: "x-footer-demo",
        template: function XMenuDemo() {
            return `<x-form><form><textarea><x-footer></x-footer></textarea></form>
                            <button>Preview</button><x-form>`;
        }
    };

    let qpromise = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
        qpromise.then(function SchemaDemoQuery(val) {

            // Use the writer.stampPattern setter to create a X-MODAL
            Dashing.writer.stampPattern = {
                name: `start-modal`,
                snippet: `<x-modal toggle="startup-toggle" overlay="true"></x-modal>`
            };
            let w = Dashing.MainDisplay.writer.stamp.call(Dashing.MainDisplay, "start-modal", {
                width: "95%",
                height: "92%"
            });
            w.then(function ResolveMainDisplay(node) {
                node.active = "true";
                node.innerHTML += `<div>
                        <h1>About: ${val.meta.name}</h1>
                        <p>${val.meta.description}</p>
                        <p>Version: ${val.version}</p>
                        <ol>
                         <li>Website: <a href="${val.meta.website}">DashingJS Site</a></li>
                         <li>GitHub: <a href="${val.meta.github}">DashingJS Repo</a></li>
                         <li>Issues: <a href="${val.meta.issues}">DashingJS Issues</a></li>
                         <li>E-Mail: ${val.meta.email}</li>
                        </ol>
                    </div>`;
            });
            w.catch(function RejectMainDsiplay(name, opts) { });

            // Create and insert a Toggle button for the X-MODAL just created above.
            let n = document.createElement("button");
                n.innerHTML = "|O|";
                n.setAttribute("toggler", "project-info");
                n.addEventListener("click", function ToggleProjectInfo(e) { let m = Dashing.querySelector("x-modal"); m === null ? false : m.active = m.active === null ? true : false; });
            Dashing.MainDisplay.xMenu.insertAdjacentElement("afterbegin", n);

        });
        qpromise.catch(function CatchSchemaDemoQuery(val) { console.log(val); });

    // Set Callback function for icons
    Dashing.icons.uploader = {
        id: "icos",
        uploader: function addPanelIcons(icons) {

            let icos = icons.firstElementChild.getElementsByTagName("symbol");
            for (let i = 0; i < icos.length; i++) {
                Dashing.icons.add(icos[i].id, icos[i].outerHTML);
            }

            Dashing.MainDisplay.bookMenu = "left";
            Dashing.MainDisplay.bookResizer = "x-menu";
            Dashing.MainDisplay.bookControls = "[control-menu]";

            // Use the Dashing.icons.insertIcons to display title page icon for doc examples
            Dashing.icons.insertIcon(Dashing.MainDisplay.querySelector(`[book-icon="title-documentation"]`), {
                snippet: "title-documentation",
                insertAt: "afterbegin",
                overwrite: true,
                type: "svg",
                drawer: function UploadBookTitle(icons) {
                    //
                }
            });

            // Use the Dashing.icons.insertIcons to display title page icon for doc examples
            Dashing.icons.insertIcon(Dashing.MainDisplay.querySelector(`[book-icon="documentation-examples"]`), {
                snippet: "documentation-examples",
                insertAt: "afterbegin",
                overwrite: true,
                type: "svg",
                drawer: function UploadBookTitle(icons) {
                    //
                }
            });

            // Use the Dashing.icons.insertIcons to display title page icon for web app docs 
            Dashing.icons.insertIcon(Dashing.MainDisplay.querySelector(`[book-icon="application-documentation"]`), {
                snippet: "application-documentation",
                insertAt: "afterbegin",
                overwrite: true,
                type: "svg",
                drawer: function UploadBookTitle(icons) {
                    //
                }
            });

            Dashing.MainDisplay.iconography = {
                name: "resizer",
                snippets: ["minimize", "normal", "maximize"],
                insertAt: "afterbegin",
                overwrite: true,
                type: "svg",
                drawer: function UploadBookMenuIcons(icons) {
                    //
                }
            };

            // Set Builder Panel Icons
            Dashing.MainMenu.querySelector("#builder-panel").iconography = {
                insertAt: "afterbegin",
                type: "svg",
                name: "*",
                drawer: function BuilderPanelDrawIconography(icons) {
                    //
                }
            };

            // Set Demo Panel Icons
            Dashing.MainMenu.querySelector("#demo-panel").iconography = {
                insertAt: "afterbegin",
                type: "svg",
                name: "logo",
                snippets: "logo",
                overwrite: false,
                drawer: function BeforeInitDraw(icons) {
                    // 
                }

            };
            Dashing.MainMenu.querySelector("#demo-panel").iconography = {
                insertAt: "afterbegin",
                type: "svg",
                name: "resizer",
                snippets: ["minimize", "normal", "maximize"],
                overwrite: true,
                drawer: function BeforeInitDraw(icons) {
                    // 
                }
            };
            Dashing.MainMenu.querySelector("#demo-panel").iconography = {
                insertAt: "afterbegin",
                type: "svg",
                name: "content",
                snippets: Dashing.MainMenu.querySelector("#demo-panel").xMenu.templateItems,
                overwrite: true,
                drawer: function BeforeInitDraw(icons) {
                    // 
                }

            };
        }
    };


});

})();