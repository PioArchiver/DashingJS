/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let promise = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
    promise.then(function SchemaDemoQuery(val) {
        console.log(val);
        return val;
    });
    promise.catch(function CatchSchemaDemoQuery(val) { console.log(val); });

});

})();