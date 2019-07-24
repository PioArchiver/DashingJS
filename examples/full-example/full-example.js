/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    Dashing.queryJson("full-example", Dashing.jsonSchema, "#").then(function SchemaDemoQuery(val) {
        console.log(val);
        return val;
    }).catch(function CatchSchemaDemoQuery(val) { console.log(val); });

});


})();