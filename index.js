const express = require("express");
const bodyParser = require("body-parser");


// INICIALIZAR SERVIDOR

var app = express();

app.use(bodyParser.json());

var port = process.env.PORT || 80;

const BASE_API_URL = "/api/v1";

app.listen(port, () => {
	console.log("Server ready");
});

console.log("Starting server...");


//VARIABLE API JORGE

var imports = [];

// LOAD INIT IMPORT


app.get(BASE_API_URL+"/imports/loadInitialData", (req,res) =>{
	

	imports = [
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
		}
	];
	
	res.sendStatus(201,"CREATED");
});


// GET IMPORT

app.get(BASE_API_URL+"/imports", (req,res) =>{
	res.send(JSON.stringify(imports,null,2));
});


// POST IMPORT

app.post(BASE_API_URL+"/imports",(req,res) =>{
	
	var newContact = req.body;
	
	if((newContact == "") || (newContact.country == null) || (newContact.year == null) ){
		res.sendStatus(400,"BAD REQUEST");
	} else {
		imports.push(newContact); 	
		res.sendStatus(201,"CREATED");
	}
});



// PU IMPORTS

app.put(BASE_API_URL+"/imports",(req,res) =>{
		res.sendStatus(405,"Method Not Allowed");
});


// DELETE IMPORTS

app.delete(BASE_API_URL+"/imports", (req,res) =>{
	imports = [];
	res.sendStatus(200,"OK");
});



// GET IMPORTS/XXX

app.get(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
	
	var country = req.params.country;
	var year = req.params.year;
	
	
	var filteredImports = imports.filter((c) => {
		return ((c.country == country ) & (c.year == year ));
	});
	
	console.log(filteredImports[0]);
	if(filteredImports.length >= 1){
		res.send(JSON.stringify(filteredImports[0],null,2));
	}else{
		res.sendStatus(404,"CONTACT NOT FOUND");
	}
});

// POST IMPORTS

app.put(BASE_API_URL+"/imports/:country/:year",(req,res) =>{
		res.sendStatus(405,"Method Not Allowed");
});



// PUT IMPORTS/XXX

app.put(BASE_API_URL+"/imports/:country/:year",(req,res) =>{
	
	var newContact = req.body;
	
	var country = req.params.country;
	var year = req.params.year;
	
	
	var posicion = imports.indexOf(imports.filter((c) => {
		return ((c.country == country ) & (c.year == year ));
	}));
	
	
	
	if((newContact == "") || (newContact.country == null) || (newContact.year == null) ){
		res.sendStatus(400,"BAD REQUEST");
	} else {
		imports[posicion] = newContact
		res.sendStatus(201,"CREATED");
	}
});



// DELETE IMPORTS/XXX

app.delete(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
	
	var country = req.params.country;
	var year = req.params.year;
	
	
	var filteredImports = imports.filter((c) => {
		return ((c.country != country ) | (c.year != year ));
	});
	
	
	if(filteredImports.length < imports.length){
		imports = filteredImports;
		res.sendStatus(200,"OK");
	}else{
		res.sendStatus(404,"CONTACT NOT FOUND");
	}
	
	
});