

module.exports = function (app) {
    console.log("Registering imports API...");

     //CONSTANTES

    const path = require("path");
    const dataStore = require("nedb");
    const BASE_API_URL = "/api/v1";
    const dbFileName = path.join(__dirname,"imports.db");
    const db = new dataStore({
        filename: dbFileName,
        autoload:true
    });

    //VARIABLE API JORGE

    
    var importsInit = [];

    // LOAD INIT IMPORT


    app.get(BASE_API_URL+"/imports/loadInitialData", (req,res) =>{
        console.log("New GET .../loadInitialData")
        importsInit = [
            { 
                "country": "canada",
                "year": 2000,
                "gdamalt": 584620,
                "gdabarley":50979,
                "gdaoat":1466303,
                "gdawaste": 26325,
                "gdaethylalcohol":99284 
            },

            { 
                "country": "european-union-27",
                "year": 2000,
                "gdamalt": 581.02,
                "gdabarley":24803,
                "gdaoat":360042463,
                "gdawaste": 651417,
                "gdaethylalcohol":18233.24 
            },
            { 
                "country": "canada",
                "year": 2001,
                "gdamalt": 488461,
                "gdabarley":31907,
                "gdaoat":1138406,
                "gdawaste": 26864,
                "gdaethylalcohol":52767 
            },
            { 
                "country": "canada",
                "year": 2002,
                "gdamalt": 317164,
                "gdabarley":41789,
                "gdaoat":842972,
                "gdawaste": 32931,
                "gdaethylalcohol":79943 
            },
            { 
                "country": "european-union-27",
                "year": 2001,
                "gdamalt": 386,
                "gdabarley":21.104,
                "gdaoat":513463,
                "gdawaste": 725387,
                "gdaethylalcohol":4277
            }
        ];
        db.insert(importsInit);

        res.sendStatus(201,"CREATED");
    });


    // GET IMPORT

    app.get(BASE_API_URL+"/imports", (req,res) =>{

        var options = ['limit','offset','fields','country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.query){
            if(!options.includes(i)){
                valid = false;
            }
        }
        
        if (valid){
            var fields = String(req.query.fields).split(",");
            if(req.query.offset !=null){ var offset = parseInt(req.query.offset)};
            if(req.query.limit !=null){ var limit = parseInt(req.query.limit)}; 
            var busqueda = {};
            if(req.query.year !=null){ busqueda.year = parseInt(req.query.year)}; 
            if(req.query.country !=null){ busqueda.country = String(req.query.country)};
            if(req.query.gdamalt !=null){ busqueda.gdamalt = parseFloat(req.query.gdamalt)};
            if(req.query.gdabarley !=null){ busqueda.gdabarley = parseFloat(req.query.gdabarley)};
            if(req.query.gdaoat !=null){ busqueda.gdaoat = parseFloat(req.query.gdaoat)};
            if(req.query.gdawaste !=null){ busqueda.gdawaste = parseFloat(req.query.gdawaste)};
            if(req.query.gdaethylalcohol !=null){ busqueda.gdaethylalcohol = parseFloat(req.query.gdaethylalcohol)};
            
            console.log(busqueda);

            db.find( busqueda, (err,imports) =>{
                
                if(offset != null){
                    imports = imports.slice(offset,);
                }

                if(limit != null){
                    console.log("limit"+imports);
                    imports = imports.slice(0,limit);
                }
                
                
                if(imports[0] != null){
                    var attributes = Object.keys(imports[0]);
                }

                
                imports.forEach( (c) =>{
                    if(req.query.fields !=null){
                        attributes.forEach((d)=>{
                            if(fields.indexOf(d) == -1){
                                delete c[d];
                            }
                        });
                    }else{
                        delete c._id;
                    }    
                });


                res.send(JSON.stringify(imports,null,2));
                console.log("PRUEBA"+JSON.stringify(imports,null,2));
            });
        }else{
            res.sendStatus(400);
        }

        
    });


    // POST IMPORT

    app.post(BASE_API_URL+"/imports",(req,res) =>{

        var opciones = [ 'country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.body){
            if(!opciones.includes(i)){
                valid = false;
            }
        }
        
        var newContact = req.body;
                
        if((newContact == "") || (newContact.country == null) || (newContact.year == null) || (valid == false) ){
            res.sendStatus(400,"BAD REQUEST");
        } else {
            db.insert(newContact);	
            res.sendStatus(201,"CREATED");
        }
    });

    // PUT IMPORTS

    app.put(BASE_API_URL+"/imports",(req,res) =>{
        res.sendStatus(405,"Method Not Allowed");
    });


    // DELETE CONTACTS

    app.delete(BASE_API_URL+"/imports", (req,res) =>{
        console.log("DELETE .../imports");
        db.remove({},{ multi: true });
        res.sendStatus(200,"OK");
    });



    // GET IMPORTS/XXX

    app.get(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
        console.log("GET IMPORTS/XXX");
        var countryParam = req.params.country;
        var yearParam = req.params.year;

        db.find({country:countryParam, year:parseInt(yearParam)}, (err,imports) =>{
            imports.forEach( (c) =>{
                delete c._id;
            });

            
            if(imports.length >= 1){
                res.send(JSON.stringify(imports[0],null,2));
            }else{
                res.sendStatus(404,"CONTACT NOT FOUND");
            }

        });
        
        
        
    });


    // POST IMPORTS

    app.post(BASE_API_URL+"/imports/:country/:year",(req,res) =>{
        res.sendStatus(405,"Method Not Allowed");
    });



    // PUT CONTACT/XXX

    app.put(BASE_API_URL+"/imports/:country/:year",(req,res) =>{

        var opciones = [ 'country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.body){
            if(!opciones.includes(i)){
                valid = false;
            }  
        }

        var newContact = req.body;
        
        var countryParam = req.params.country;
        var yearParam = req.params.year;

        if((newContact == "") || (newContact.country == null) || (newContact.year == null) || (valid == false) ){
            res.sendStatus(400,"BAD REQUEST");
        } else {
            db.update({country:countryParam, year:parseInt(yearParam)},newContact,(err, numReplaced)=>{
                if(numReplaced >= 1){
                    res.sendStatus(201,"CREATED");
                }
            });    
        }
    });



    // DELETE CONTACT/XXX

    app.delete(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
        
        var countryParam = req.params.country;
        var yearParam = req.params.year;
        
        db.remove({country:countryParam, year:parseInt(yearParam)},{},(err, numRemoved)=>{
            console.log(numRemoved);
            if(numRemoved >= 1){
                res.sendStatus(200,"OK");
            }else{
                res.sendStatus(404,"CONTACT NOT FOUND");
            }
        });
  
    });

    console.log("OK.");
}