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
			{country:"Canada",year:2000,shortTonExport:1509998,dollarExport:0,shortTonImport:14581187,dollarImport:1330002283},
			{country:"Canada",year:2001,shortTonExport:1371783,dollarExport:0,shortTonImport:12949183,dollarImport:1182314090},
			{country:"Canada",year:2002,shortTonExport:1302091,dollarExport:0,shortTonImport:13842832,dollarImport:1256992477},
			{country:"Canada",year:2003,shortTonExport:1442687,dollarExport:0,shortTonImport:14424586,dollarImport:1386448730},
			{country:"Canada",year:2004,shortTonExport:1252950,dollarExport:0,shortTonImport:15795757,dollarImport:1741135261},
			{country:"Canada",year:2005,shortTonExport:1199036,dollarExport:0,shortTonImport:16323256,dollarImport:2458666923},
			{country:"Canada",year:2006,shortTonExport:1284143,dollarExport:0,shortTonImport:14787492,dollarImport:2404943752},
			{country:"Canada",year:2007,shortTonExport:16888527,dollarExport:0,shortTonImport:16949858,dollarImport:2913310436},
			{country:"Canada",year:2008,shortTonExport:2421810,dollarExport:564300315,shortTonImport:16488407,dollarImport:5492009662},
			{country:"Canada",year:2009,shortTonExport:1164160,dollarExport:383746793,shortTonImport:9470872,dollarImport:3210448544},
			{country:"Canada",year:2010,shortTonExport:1268485,dollarExport:451149618,shortTonImport:15839693,dollarImport:4364652584},
			{country:"Canada",year:2011,shortTonExport:1849461,dollarExport:894912275,shortTonImport:16463442,dollarImport:5572093735},
			{country:"Canada",year:2012,shortTonExport:2052233,dollarExport:961766774,shortTonImport:14422137,dollarImport:5299603023},
			{country:"Spain",year:2000,shortTonExport:12187,dollarExport:0,shortTonImport:44762,dollarImport:4770843},
			{country:"Spain",year:2001,shortTonExport:4468,dollarExport:0,shortTonImport:115287,dollarImport:11333874},
			{country:"Spain",year:2002,shortTonExport:4968,dollarExport:0,shortTonImport:99327,dollarImport:7896991},
			{country:"Spain",year:2003,shortTonExport:2194,dollarExport:0,shortTonImport:113922,dollarImport:6871252},
			{country:"Spain",year:2004,shortTonExport:4254,dollarExport:0,shortTonImport:16406,dollarImport:3402407},
			{country:"Spain",year:2005,shortTonExport:1533,dollarExport:0,shortTonImport:1536,dollarImport:372616},
			{country:"Spain",year:2006,shortTonExport:1768,dollarExport:0,shortTonImport:18444,dollarImport:4023786},
			{country:"Spain",year:2007,shortTonExport:4629,dollarExport:0,shortTonImport:905,dollarImport:109490},
			{country:"Spain",year:2008,shortTonExport:1149,dollarExport:804540,shortTonImport:504,dollarImport:116848},
			{country:"Spain",year:2009,shortTonExport:424,dollarExport:593117,shortTonImport:763,dollarImport:256645},
			{country:"Spain",year:2010,shortTonExport:639,dollarExport:829290,shortTonImport:2323,dollarImport:668142},
			{country:"Spain",year:2011,shortTonExport:11749,dollarExport:1211835,shortTonImport:5464,dollarImport:1227306},
			{country:"Spain",year:2012,shortTonExport:1189,dollarExport:1282962,shortTonImport:2857,dollarImport:528735},
			{country:"United Kingdom",year:2000,shortTonExport:6034,dollarExport:0,shortTonImport:7222,dollarImport:3569992},
			{country:"United Kingdom",year:2001,shortTonExport:4145,dollarExport:0,shortTonImport:5047,dollarImport:2472185},
			{country:"United Kingdom",year:2002,shortTonExport:6485,dollarExport:0,shortTonImport:4309,dollarImport:1710241},
			{country:"United Kingdom",year:2003,shortTonExport:12443,dollarExport:0,shortTonImport:3124,dollarImport:1797693},
			{country:"United Kingdom",year:2004,shortTonExport:8887,dollarExport:0,shortTonImport:3411,dollarImport:2265992},
			{country:"United Kingdom",year:2005,shortTonExport:6980,dollarExport:0,shortTonImport:4234,dollarImport:1968358},
			{country:"United Kingdom",year:2006,shortTonExport:5486,dollarExport:0,shortTonImport:6081,dollarImport:1629831},
			{country:"United Kingdom",year:2007,shortTonExport:7193,dollarExport:0,shortTonImport:23152,dollarImport:5334265},
			{country:"United Kingdom",year:2008,shortTonExport:7513,dollarExport:3610691,shortTonImport:4063,dollarImport:704384},
			{country:"United Kingdom",year:2009,shortTonExport:32200,dollarExport:7864302,shortTonImport:5223,dollarImport:1294679},
			{country:"United Kingdom",year:2010,shortTonExport:5612,dollarExport:7393982,shortTonImport:4953,dollarImport:1381751},
			{country:"United Kingdom",year:2011,shortTonExport:9040,dollarExport:11817678,shortTonImport:42043,dollarImport:13297917},
			{country:"United Kingdom",year:2012,shortTonExport:7150,dollarExport:6097404,shortTonImport:24916,dollarImport:2340425},
			{country:"Mexico",year:2000,shortTonExport:1079403,dollarExport:0,shortTonImport:719401,dollarImport:46596774},
			{country:"Mexico",year:2001,shortTonExport:1143940,dollarExport:0,shortTonImport:424295,dollarImport:16767149},
			{country:"Mexico",year:2002,shortTonExport:1376773,dollarExport:0,shortTonImport:619018,dollarImport:27757545},
			{country:"Mexico",year:2003,shortTonExport:1380479,dollarExport:0,shortTonImport:626159,dollarImport:37254618},
			{country:"Mexico",year:2004,shortTonExport:1505804,dollarExport:0,shortTonImport:531529,dollarImport:50388987},
			{country:"Mexico",year:2005,shortTonExport:1353062,dollarExport:0,shortTonImport:493847,dollarImport:33454203},
			{country:"Mexico",year:2006,shortTonExport:1600771,dollarExport:0,shortTonImport:570667,dollarImport:36166323},
			{country:"Mexico",year:2007,shortTonExport:1208372,dollarExport:0,shortTonImport:575865,dollarImport:54698854},
			{country:"Mexico",year:2008,shortTonExport:1001090,dollarExport:405073923,shortTonImport:530344,dollarImport:225553281},
			{country:"Mexico",year:2009,shortTonExport:829700,dollarExport:255533985,shortTonImport:168451,dollarImport:17360355},
			{country:"Mexico",year:2010,shortTonExport:869579,dollarExport:279430866,shortTonImport:543944,dollarImport:91914653},
			{country:"Mexico",year:2011,shortTonExport:1029995,dollarExport:378532305,shortTonImport:435130,dollarImport:114001275},
			{country:"Mexico",year:2012,shortTonExport:1205982,dollarExport:390498463,shortTonImport:580720,dollarImport:163808780},
			{country:"Russian Federation",year:2000,shortTonExport:582,dollarExport:0,shortTonImport:1168252,dollarImport:129494250},
			{country:"Russian Federation",year:2001,shortTonExport:1278,dollarExport:0,shortTonImport:2608892,dollarImport:233338644},
			{country:"Russian Federation",year:2002,shortTonExport:408,dollarExport:0,shortTonImport:1943499,dollarImport:171776929},
			{country:"Russian Federation",year:2003,shortTonExport:0,dollarExport:0,shortTonImport:2426007,dollarImport:335547641},
			{country:"Russian Federation",year:2004,shortTonExport:200,dollarExport:0,shortTonImport:1947563,dollarImport:304015361},
			{country:"Russian Federation",year:2005,shortTonExport:3873,dollarExport:0,shortTonImport:1733337,dollarImport:312973776},
			{country:"Russian Federation",year:2006,shortTonExport:1501,dollarExport:0,shortTonImport:1861626,dollarImport:382490502},
			{country:"Russian Federation",year:2007,shortTonExport:1563,dollarExport:0,shortTonImport:2690130,dollarImport:647876861},
			{country:"Russian Federation",year:2008,shortTonExport:227,dollarExport:72000,shortTonImport:3745699,dollarImport:1820268071},
			{country:"Russian Federation",year:2009,shortTonExport:722,dollarExport:163920,shortTonImport:1364076,dollarImport:313838759},
			{country:"Russian Federation",year:2010,shortTonExport:4484,dollarExport:808006,shortTonImport:2501311,dollarImport:721917204},
			{country:"Russian Federation",year:2011,shortTonExport:161,dollarExport:50000,shortTonImport:3333356,dollarImport:1413049938},
			{country:"Russian Federation",year:2012,shortTonExport:23,dollarExport:39066,shortTonImport:2546515,dollarImport:1016171158}
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
