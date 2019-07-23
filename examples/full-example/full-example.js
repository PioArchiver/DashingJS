/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let jschema = Dashing.queryJson("full-example", Dashing.jsonSchema, "#");
    jschema.then(function (val) {
        console.log(val);
    });
    jschema.catch(function (val) { console.log(val); });
        

    console.log(jschema);
});


})();