/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let qpromise = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
        qpromise.then(function SchemaDemoQuery(val) {
            Dashing.MainDisplay.bookMenu = "left";
            Dashing.MainDisplay.bookResizer = "x-menu";

            return val;
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
            console.log(Dashing.MainDisplay.iconography);

            Dashing.MainDisplay.iconography = {
                name: "resizer",
                snippets: ["minimize", "normal", "maximize"],
                insertAt: "afterbegin",
                overwrite: true,
                type: "svg",
                drawer: function UploadBookMenuIcons(icons, css) {
                    console.log(icons);
                }
            };

            // Set Builder Panel Icons
            Dashing.MainMenu.querySelector("#builder-panel").iconography = {
                insertAt: "afterbegin",
                type: "svg",
                name: "*",
                drawer: function BuilderPanelDrawIconography(icons, css) {
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