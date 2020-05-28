const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const path = require("path");

const importsAPIV1 = require(path.join(__dirname,"./src/back/importsAPI/v1"));
const importsAPIV2 = require(path.join(__dirname,"./src/back/importsAPI/v2"));
const importsAPIV3 = require(path.join(__dirname,"./src/back/importsAPI/v3"));
const foodsImports = require(path.join(__dirname,"./src/back/foodsImports"));
const fertilizerImportsExportsAPI = require(path.join(__dirname,"./src/back/fertilizerImportsExportsAPI"));
const port = process.env.PORT || 3000;

var app = express();

app.use(cors());

app.use(bodyParser.json());

importsAPIV1(app);
importsAPIV2(app);
importsAPIV3(app);
foodsImports(app);
fertilizerImportsExportsAPI(app);

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");
