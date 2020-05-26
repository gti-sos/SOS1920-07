const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const importsAPI = require(path.join(__dirname,"./src/back/importsAPI"));
const foodsImports = require(path.join(__dirname,"./src/back/foodsImports"));
var app = express();
const fertilizerImportsExportsAPI = require(path.join(__dirname,"./src/back/fertilizerImportsExportsAPI"));
const port = process.env.PORT || 80;

app.use(bodyParser.json());

importsAPI(app);
foodsImports(app);
fertilizerImportsExportsAPI(app);

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");
