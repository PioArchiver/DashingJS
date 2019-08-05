/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let qpromise = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
        qpromise.then(function SchemaDemoQuery(val) {
            console.log(val);
            return val;
        });
        qpromise.catch(function CatchSchemaDemoQuery(val) { console.log(val); });

    // Set Callback function for icons
    Dashing.icons.uploader = function addPanelIcons(icons) {
        let icos = icons.firstElementChild.getElementsByTagName("symbol");
        for (let i = 0; i < icos.length; i++) {
            Dashing.icons.add(icos[i].id, icos[i].innerHTML);
        }

        // Set Builder Panel Icons drawer callback
        Dashing.MainMenu.querySelector("#builder-panel").drawer = function BuilderPanelIconDrawer() {

        };
        // Set Builder Panel Icons
        Dashing.MainMenu.querySelector("#builder-panel").iconography = {
            insertAt: "afterbegin",
            type: "svg",
            name: "*"
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
    };

});

})();