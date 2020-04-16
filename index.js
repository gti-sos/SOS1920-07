const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const importsAPI = require(path.join(__dirname,"importsAPI"));
const foodsImports = require(path.join(__dirname,"foodsImports"));
const fertilizerImportsExportsAPI = require(path.join(__dirname,"fertilizerImportsExports"));
const port = process.env.PORT || 80;

console.log("Running module...");

// INICIALIZAR SERVIDOR

const app = express();
app.use(bodyParser.json());

importsAPI(app);
foodsImports(app);
fertilizerImportsExportsAPI(app);

app.listen(port, () => {
	console.log("Server ready");
});

console.log("Starting server...");


