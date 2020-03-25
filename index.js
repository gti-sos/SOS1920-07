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

app.post(BASE_API_URL+"/imports/:country/:year",(req,res) =>{
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



/*--------------------------------------------------------------Juan Antonio-----------------------------------------------------*/

//Variable
var foodsImports;

//Creador de Inicial
app.get(BASE_API_URL+"/foodsImports/loadInitialData", (req,res) =>{
	
	 foodsImports = [
	{ 
		name: "CANADA",
		year: 2000,	
		TVegANDPrep: 946.048,
		fruitJuice: 21.884,
		TSweANDCndy:322.924,
		TLiveAnimal:714667,
		FishFilletANDMince:298.344
	},
	{ 
		name: "MEXICO",
		year: 2017,	
		TVegANDPrep: 6.312,
		fruitJuice: 483.8,
		TSweANDCndy:1295.5,
		TLiveAnimal:584.6,
		FishFilletANDMince:287.0
	},
	{ 
		name: "CHINA",
		year: 2000,	
		TVegANDPrep: 97.4,
		fruitJuice: 39.3,
		TSweANDCndy:61.1,
		TLiveAnimal:1228.1,
		FishFilletANDMince:255.2
	}
];
	res.send(JSON.stringify(foodsImports,null,2));
	console.log("Data sent:"+JSON.stringify(foodsImports,null,2));
});

// GET FOOD IMPORTS

app.get(BASE_API_URL+"/foodsImports", (req,res) =>{
	res.send(JSON.stringify(foodsImports,null,2));
	console.log("Data sent:"+JSON.stringify(foodsImports,null,2));
});


// POST FOOD IMPORTS

app.post(BASE_API_URL+"/foodsImports",(req,res) =>{
	
	var newfoodsImports = req.body;
	
	if((newfoodsImports == "") || (newfoodsImports.name == null)){
		res.sendStatus(400,"BAD REQUEST");
	} else {
		foodsImports.push(newfoodsImports); 	
		res.sendStatus(201,"CREATED");
	}
});

// DELETE FOOD IMPORTS
app.delete(BASE_API_URL+"/foodsImports",(req,res) =>{
	foodsImports="Fue Eliminado";
	res.sendStatus(200,"OK")
	
});

// GET FOOD IMPORTS/XXX

app.get(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
	
	var name = req.params.name;
	var year = req.params.year;
	var filteredFoodsImports= foodsImports.filter((c)=>{
		return (c.name == name && c.year == year);
	});
	
	if (filteredFoodsImports.length >= 1){
		res.send(filteredFoodsImports[0]);
	}else{
		res.sendStatus(404,"Country not Found")
		
	}
	
});


//POST FOOD IMPORTS/XXX(NO PERMITIDO)

app.post(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{	
	
	res.sendStatus(405,"METHOD NOT ALLOWED");
});

//PUT FOOD IMPORTS(NO PERMITIDO)
app.put(BASE_API_URL+"/foodsImports",(req,res) =>{	
	res.sendStatus(405,"METHOD NOT ALLOWED");
});

// PUT FOOD IMPORTS/XXX

app.put(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
	
	var name = req.params.name;
	var year = req.params.year;
	var aux=[{}];
	aux.push(req.body)
	var cont=0;
	
	for (i in foodsImports){
		if(foodsImports[i].name == aux[1].name && foodsImports[i].year == aux[1].year){
			if(foodsImports[i].TVegANDPrep != aux[1].TVegANDPrep){
				cont++;
				foodsImports[i].TVegANDPrep = aux[1].TVegANDPrep;
			}
			if(foodsImports[i].fruitJuice != aux[1].fruitJuice){
				cont++;
				foodsImports[i].fruitJuice = aux[1].fruitJuice;
			}
			if(foodsImports[i].TSweANDCndy != aux[1].TSweANDCndy){
				cont++;
				foodsImports[i].TSweANDCndy = aux[1].TSweANDCndy;
			}
			if(foodsImports[i].TLiveAnimal != aux[1].TLiveAnimal){
				cont++;
				foodsImports[i].TLiveAnimal = aux[1].TLiveAnimal;
			}
			if(foodsImports[i].FishFilletANDMince != aux[1].FishFilletANDMince){
				cont++;
				foodsImports[i].FishFilletANDMince = aux[1].FishFilletANDMince;
			}
		}
	};
	
	if (cont==0){
		res.sendStatus(404,"Resource not Found")
	}else{
		res.sendStatus(200,"OK")
	}
});

// DELETE FOOD IMPORTS/XXX
app.delete(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
	
	var name = req.params.name;
	var year= req.params.year;
	var filteredFoodsImports= foodsImports.filter((c)=>{
		return (c.name != name && c.year != year);
	});
	
	if (filteredFoodsImports.length < foodsImports.length){
		foodsImports=filteredFoodsImports;
		res.sendStatus(200,"OK")
		res.send(filteredFoodsImports[0]);
	}else{
		res.sendStatus(404,"Country Not Found")
		
	}
});
/*-------------------------------------------------------------------------------------------------------------------------------*/
