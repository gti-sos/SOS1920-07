const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const importsAPI = require(path.join(__dirname,"./src/back/importsAPI"));
var app = express();

app.use(bodyParser.json());

importsAPI(app);

var port = process.env.PORT || 12345;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");