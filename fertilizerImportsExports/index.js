module.exports = function (app) {
	console.log("Registering fertilizerImportsExports API....");
	
	const dataStore = require("nedb");
	const path = require("path");
	const dbFileName = path.join(__dirname,"fertilizerImportsExports.db");
	const BASE_API_URL = "/api/v1";

	const db = new dataStore({
					filename: dbFileName,
					autoload: true
	});
	
	
	app.get(BASE_API_URL+"/fertilizerImportsExports/loadInitialData", (req,res) =>{
		
		var initialFertilizerImportsExports = [
			{
				country: "Canada",
				year: 2008,
				shortTonExport: 2421810,
				dollarExport: 564300315,
				shortTonImport: 16488407,
				dollarImport: 5492009662
			},
			{
				country: "Mexico",
				year: 2009,
				shortTonExport: 829700,
				dollarExport: 255533985,
				shortTonImport: 168451,
				dollarImport: 17360355
			},
			{
				country: "Spain",
				year: 2010,
				shortTonExport: 639,
				dollarExport: 829290,
				shortTonImport: 2323,
				dollarImport: 668142
			},
			{
				country: "United Kingdom",
				year: 2011,
				shortTonExport: 9040,
				dollarExport: 11817678,
				shortTonImport: 42043,
				dollarImport: 13297917
			},
			{
				country: "Russian Federation",
				year: 2012,
				shortTonExport: 23,
				dollarExport: 39066,
				shortTonImport: 2546515,
				dollarImport: 1016171158
			}
		];
		db.insert(initialFertilizerImportsExports);
		res.sendStatus(201,"CREATED");
	});

	
	// CARGA DE DATOS
	
	app.get(BASE_API_URL+"/fertilizerImportsExports/loadInitialData", (req,res) =>{
		
		console.log("New GET .../loadInitialData");

		db.insert(initialFertilizerImportsExports);
		res.sendStatus(200);
		
		
		console.log("Initial data loaded:"+JSON.stringify(initialFertilizerImportsExports,null,2));
	});


	
	// GET FERTILIZER IMPORTS EXPORTS

	app.get(BASE_API_URL+"/fertilizerImportsExports", (req,res) =>{
	
		console.log("New GET .../fertilizerImportsExports");
		
		
		var country = req.query.country;
		var year = parseInt(req.query.year);
		var shortTonExport = parseInt(req.query.shortTonExport);
		var dollarExport = parseInt(req.query.dollarExport);
		var shortTonImport = parseInt(req.query.shortTonImport);
		var dollarImport = parseInt(req.query.dollarImport);
		
	  	var offset = req.query.offset;
      	var limit = req.query.limit;
		
		db.find({}).skip(offset).limit(limit).exec((err, fertilizerImportsExports) =>{
			fertilizerImportsExports.forEach((f) => {
				delete f._id;
			});
			
			if(country){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.country==country;
				});
			};
			if(year){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.year==year;
				});
			};
			if(shortTonExport){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.shortTonExport==shortTonExport;
				});
			};
			if(dollarExport){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.dollarExport==dollarExport;
				});
			};
			if(shortTonImport){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.shortTonImport==shortTonImport;
				});
			};
			if(dollarImport){
				fertilizerImportsExports = fertilizerImportsExports.filter((fertilizerImportsExports) =>{
 					return fertilizerImportsExports.dollarImport==dollarImport;
				});
			};
		
		
		res.send(JSON.stringify(fertilizerImportsExports,null,2));
		console.log("Data sent:"+JSON.stringify(fertilizerImportsExports,null,2));
		
		});
	});
	
	
	
	// POST FERTILIZER IMPORTS EXPORTS

	app.post(BASE_API_URL+"/fertilizerImportsExports",(req,res) =>{
		
		console.log("New POST .../fertilizerImportsExports");
		
		var newFertilizerImportsExports = req.body;
		
		if((newFertilizerImportsExports == "") || 
			(newFertilizerImportsExports.country == null) || 
			(newFertilizerImportsExports.year == null) ||
			(newFertilizerImportsExports.shortTonExport == null) || 
			(newFertilizerImportsExports.dollarExport == null) || 
			(newFertilizerImportsExports.shortTonImport == null) || 
			(newFertilizerImportsExports.dollarImport == null) ){
			res.sendStatus(400,"BAD REQUEST");
		} else {
			db.insert(newFertilizerImportsExports); 	
			res.sendStatus(201,"CREATED");
		}
	});



	// GET FERTILIZER IMPORTS EXPORTS/XXX

	app.get(BASE_API_URL+"/fertilizerImportsExports/:country/:year", (req,res)=>{
		
		console.log("New GET .../fertilizerImportsExports/XXX");
		
		var country = req.params.country;
		var yearP = parseInt(req.params.year);
		
		
		db.find({country:country, year:yearP}, (err, fertilizerImportsExports) =>{
            fertilizerImportsExports.forEach( (f) =>{
                delete f._id;
            });

            
            if(fertilizerImportsExports.length >= 1){
                res.send(JSON.stringify(fertilizerImportsExports[0],null,2));
            }else{
                res.sendStatus(404,"NOT FOUND");
            }

        });		
	});



	// DELETE FERTILIZER IMPORTS EXPORTS/XXX

	app.delete(BASE_API_URL+"/fertilizerImportsExports/:country/:year", (req,res)=>{
		
		console.log("New DELETE .../fertilizerImportsExports/XXX");
		
		var country = req.params.country;
		var yearP = parseInt(req.params.year);
		
		
		db.remove({country:country, year:yearP}, {}, (err, fremove)=>{
            if(fremove >= 1){
                res.sendStatus(200,"OK");
            }else{
                res.sendStatus(404,"NOT FOUND");
            }
        });	
	});



	// PUT FERTILIZER IMPORTS EXPORTS/XXX

	app.put(BASE_API_URL+"/fertilizerImportsExports/:country/:year",(req,res) =>{
		
		console.log("New PUT .../fertilizerImportsExports/XXX");
		
		var newFertilizerImportsExports = req.body;
		
		var country = req.params.country;
		var yearP = parseInt(req.params.year);
				
		
		if((newFertilizerImportsExports == "") || 
			(newFertilizerImportsExports.country == null) || 
			(newFertilizerImportsExports.year == null) ||
			(newFertilizerImportsExports.shortTonExport == null) || 
			(newFertilizerImportsExports.dollarExport == null) || 
			(newFertilizerImportsExports.shortTonImport == null) || 
			(newFertilizerImportsExports.dollarImport == null) ) {
			res.sendStatus(400,"BAD REQUEST");
		} else {
			db.remove({country:country, year:yearP}, newFertilizerImportsExports, (err, fremove)=>{
            db.insert(newFertilizerImportsExports);
            res.sendStatus(201,"CREATED");
                
            });
		}
	});



	// POST FERTILIZER IMPORTS EXPORTS/XXX (ERROR 405)

	app.post(BASE_API_URL+"/fertilizerImportsExports/:country/:year",(req,res) =>{
			res.sendStatus(405,"METHOD NOT ALLOWED");
	});



	// PUT FERTILIZER IMPORTS EXPORTS (ERROR 405)

	app.put(BASE_API_URL+"/fertilizerImportsExports",(req,res) =>{
			res.sendStatus(405,"METHOD NOT ALLOWED");
	});



	// DELETE FERTILIZER IMPORTS EXPORTS

	app.delete(BASE_API_URL+"/fertilizerImportsExports", (req,res) =>{
		
		console.log("New DELETE .../fertilizerImportsExports");
		
		db.remove({},{multi: true});
		res.sendStatus(200,"OK");
	});
	
	
		console.log("Ok.");
};
