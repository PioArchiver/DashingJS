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

});

})();