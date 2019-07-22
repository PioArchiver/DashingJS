/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let jschema = Dashing.queryJson("#full-example", Dashing.jsonSchema);

    console.log(jschema);
});


})();