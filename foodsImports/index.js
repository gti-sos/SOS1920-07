module.exports = function (app) {
    console.log("Registering imports API...");

     

    const BASE_API_URL = "/api/v1";
    const dataStore = require("nedb");
    const path = require("path");
    var InitialfoodsImports;
    const dbFileName = path.join(__dirname,"foodsImports.db")

    const db = new dataStore({
      filename : dbFileName,
      autoload : true
    });


    initialfoodsImports = [
      { 
        name: "CANADA",
        year: "2000",	
        TVegANDPrep: 946.048,
        fruitJuice: 21.884,
        TSweANDCndy:322.924,
        TLiveAnimal:714667,
        FishFilletANDMince:298.344
      },
      { 
        name: "MEXICO",
        year: "2017",	
        TVegANDPrep: 6.312,
        fruitJuice: 483.8,
        TSweANDCndy:1295.5,
        TLiveAnimal:584.6,
        FishFilletANDMince:287.0
      },
      { 
        name: "CHINA",
        year: "2000",	
        TVegANDPrep: 97.4,
        fruitJuice: 39.3,
        TSweANDCndy:61.1,
        TLiveAnimal:1228.1,
        FishFilletANDMince:255.2
      },
      { 
        name: "REST OF WORLD",
        year: "2000",	
        TVegANDPrep: 544.5,
        fruitJuice: 262.956,
        TSweANDCndy:732.8,
        TLiveAnimal:0.1,
        FishFilletANDMince:765.1
      },
      { 
        name: "REST OF WORLD",
        year: "2008",	
        TVegANDPrep: 1111.9,
        fruitJuice: 267.803,
        TSweANDCndy:813.8,
        TLiveAnimal:0.1,
        FishFilletANDMince:817.038
      }
    ];






    //Creador de Inicial
    app.get(BASE_API_URL+"/foodsImports/loadInitialData", (req,res) =>{

      db.insert(initialfoodsImports);
      res.send(JSON.stringify(initialfoodsImports,null,2));
      console.log("Data sent:"+JSON.stringify(initialfoodsImports,null,2));

    });




    // GET FOOD IMPORTS

    app.get(BASE_API_URL+"/foodsImports", (req,res) =>{
      var peperoni=0;
      console.log("Get /foodsImports...");
      console.log("Nombre: "+req.query.name);
      console.log("Año: "+req.query.year);
      var offst=req.query.offset;
      var limit=req.query.limit;
      var flag=0;
      console.log("offset  : "+offst);
      console.log("limit   :"+ limit);


      //Comprobación de los parametros de entrada en una posible búsqueda
      if(req.query.name!=undefined){
        if(req.query.year!=undefined){
          peperoni=1;//?name and year
        }else{
          peperoni=2;//?name			
        }
      }else{
        if(req.query.year!=undefined){
          peperoni=3;//?year
        }
      }
      console.log("PEPERONI:   "+peperoni);

      switch(peperoni){

        case 0:
          db.find({}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));
          });
          break;

        case 1:
          var name= req.query.name;
          var year= req.query.year;
          db.find({ $and: [{name:name}, {year:year}] }, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
          });
          break;
        case 2:
          var name= req.query.name;
          db.find({name:name}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));});
          break;
        case 3: 
          var year= req.query.year;
          console.log("Año dentro: "+year);
          db.find({year:year}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));});
          break;

        default: break;


      }


    });


    // POST FOOD IMPORTS

    app.post(BASE_API_URL+"/foodsImports",(req,res) =>{

      var newfoodsImports = req.body;


      if((newfoodsImports == "") 
        || (newfoodsImports.name == null)
        || (newfoodsImports.year == null)
        || (newfoodsImports.TVegANDPrep == null)
        || (newfoodsImports.fruitJuice == null)
        || (newfoodsImports.TSweANDCndy == null)
        || (newfoodsImports.TLiveAnimal == null)
        || (newfoodsImports.FishFilletANDMince == null)
        || (newfoodsImports._id != null)){
        res.sendStatus(400,"BAD REQUEST");
      } else {
        db.insert(newfoodsImports, function (err, foodsImports) {}); 	
        res.sendStatus(201,"CREATED");
      }
    });

    // DELETE FOOD IMPORTS
    app.delete(BASE_API_URL+"/foodsImports",(req,res) =>{
      var elimin = "Fue eliminado";
      db.remove({}, { multi: true }, function (err, elimin) {});
      res.sendStatus(200,"OK")

    });

    // GET FOOD IMPORTS/XXX

    app.get(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{

      var name = req.params.name;
      var year = req.params.year;
      db.find({ $and: [{name:name}, {year:year}] },(err,foodsImports)=>{
        res.send(foodsImports);
        console.log("Data sent:"+JSON.stringify(foodsImports,null,2));});

    });


    //POST FOOD IMPORTS

    app.post(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{	

      res.sendStatus(405,"METHOD NOT ALLOWED");
    });

    app.put(BASE_API_URL+"/foodsImports",(req,res) =>{	
      res.sendStatus(405,"METHOD NOT ALLOWED");
    });

    // PUT FOOD IMPORTS/XXX


    app.put(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{

      var name = req.params.name;
      var year = req.params.year;
      var ident;

      db.remove({ name:name,year:year});

      var newfoodsImports = req.body;

      if((newfoodsImports == "") || (newfoodsImports.name == null)){
        res.sendStatus(400,"BAD REQUEST");
      } else {
        db.insert(newfoodsImports, function (err, foodsImports) {}); 	
        res.sendStatus(201,"UPDATED");
      }
    });

    // DELETE FOOD IMPORTS/XXX
    app.delete(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
      var name = req.params.name;
      var year= req.params.year;

      db.remove({ name:name,year:year});

      res.sendStatus(200,"OK")
    });
    console.log("OK.");
}
