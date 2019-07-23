/*
    Full Example Javascript file 
 */

(function ExampleFull() {
let Dashing = null;
window.addEventListener("load", function LoadExample() {
    Dashing = document.querySelector("x-extension");

    let jschema = Dashing.queryJson("#full-example", Dashing.jsonSchema);
    jschema.then(function JSchema(val) {
        console.log(val);
    });
        

    console.log(jschema);
});


})();