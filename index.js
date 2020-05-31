const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const path = require("path");

const importsAPIV1 = require(path.join(__dirname,"./src/back/importsAPI/v1"));
const importsAPIV2 = require(path.join(__dirname,"./src/back/importsAPI/v2"));
const foodsImports = require(path.join(__dirname,"./src/back/foodsImports/v2"));
const foodsImports1 = require(path.join(__dirname,"./src/back/foodsImports/v3"));
const fertilizerImportsExportsAPI = require(path.join(__dirname,"./src/back/fertilizerImportsExportsAPI"));
const port = process.env.PORT || 9999;

var app = express();

app.use(cors());

app.use(bodyParser.json());

importsAPIV1(app);
importsAPIV2(app);
foodsImports(app);
foodsImports1(app);
fertilizerImportsExportsAPI(app);

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");
