module.exports = function (app) {
    console.log("Registering imports API...");



    const BASE_API_URL = "/api/v3";
    const dataStore = require("nedb");
    const path = require("path");
    const request = require("request");
    const dbFileName = path.join(__dirname,"foodsImports.db")

    const db = new dataStore({
      filename : dbFileName,
      autoload : true
    });
    //Proxy de grupo 28

    const paht1 = "/api/v1/gce";
    var apiServerHost = 'https://sos1920-28.herokuapp.com';

    app.use(paht1, function(req, res) {
        var url = apiServerHost + req.baseUrl + req.url;
        console.log('piped: '+req.baseUrl + req.url);
        req.pipe(request(url)).pipe(res);
      });
}