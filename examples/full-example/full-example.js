/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let qpromise = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
        qpromise.then(function SchemaDemoQuery(val) {
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
                         <li>Website: ${val.meta.website}</li>
                         <li>GitHub: ${val.meta.github}</li>
                         <li>Issues: ${val.meta.issues}</li>
                         <li>E-Mail: ${val.meta.email}</li>
                        </ol>
                    </div>`;
            });
            w.catch(function RejectMainDsiplay(name, opts) { });

            let n = document.createElement("button");
                n.innerHTML = "|O|";
                n.setAttribute("toggler", "project-info");
                n.addEventListener("click", function ToggleProjectInfo(e) { let m = this.querySelector("x-modal"); console.log(m); m === null ? false : m.active = m.active === true ? true : false; });
            Dashing.MainMenu.insertAdjacentElement("afterbegin", n);

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