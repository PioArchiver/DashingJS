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

    Dashing.icons.uploader = function addPanelIcons(icons) {
        let icos = icons.firstElementChild.getElementsByTagName("symbol");
        for (let i = 0; i < icos.length; i++) {
            Dashing.icons.add(icos[i].id, icos[i]);
        }

        Dashing.MainMenu.iconography = true;
    };

});

})();