
<script>

import { Button } from "sveltestrap";
// base css
let columnitas=[["pepe",1,2,3,4],["pepe1",5,6,7,8,9],["pepe2",10,11,12,13],["pepe3",14,15,16,17],["pepe4",18,19,20,21]];
let lista1=[];
let lista2=[];
let lista3=[];
let lista4=[];
let lista5=[];
let lista=[];
import bb from "billboard.js/dist/billboard.pkgd";
 
//Introducción de Datos
async function cargaColumnas(){
  //Inicializamos las 5 listas
  lista1.push("VEGETALES Y PREPARADOS");
  lista2.push("ZUMO DE FRUTAS");
  lista3.push("DULCES Y CARAMELOS");
  lista4.push("ANIMALES VIVOS");
  lista5.push("FILETES DE PESCADO Y DESMEDUZADO");
  //Sacamos todos los datos
  const resData= await fetch("/api/v2/foodsImports")
  const datos =  await resData.json();
  

  datos.forEach(e => {
      if(lista1.length>50){
      }else{
        lista1.push(e.TVegANDPrep);
        lista2.push(e.fruitJuice);
        lista3.push(e.TSweANDCndy);
        lista4.push(e.TLiveAnimal);
        lista5.push(e.FishFilletANDMince);

      }
      
      
  });
  lista.push(lista1);
  lista.push(lista2);
  lista.push(lista3);
  lista.push(lista4);
  lista.push(lista5);
  console.log(lista);
  
  return lista;


 }
 cargaColumnas()


var chart1 = bb.generate({
  data: {
    columns: [
	["Cargando...", 30],
	["Cargando...", 120]
    ],
    type: "donut",
    onclick: function(d, i) {
	console.log("onclick", d, i);
   },
    onover: function(d, i) {
	console.log("onover", d, i);
   },
    onout: function(d, i) {
	console.log("onout", d, i);
   }
  },
  donut: {
    title: "Importaciones a EEUU"
  },
  bindto: "#donutChart"
});

setTimeout(function() {
	chart1.load({
		columns:lista});
}, 1500);

setTimeout(function() {
	chart1.unload({
		ids: "Cargando..."
	});
	chart1.unload({
		ids: "Cargando.."
	});
}, 2500);

</script>




<svelte:head>
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="./theme/billboard.js"></script>
<link rel="stylesheet" href="./theme/billboard.css">
<link rel="stylesheet" href="billboard.js/dist/theme/insight.css">
</svelte:head>


<main>
<Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports';">Inicio</Button>
<div id='donutChart'></div>
<h4>Grafica realizada con billboard sobre el porcentaje total de importaciones a Estados Unidos</h4>
<h6>Esta gráfica se replica por todas las paginas después de hacer uso de ella, para solucionarlo hay que recargar la página en la que estés, no he encontrado solución al problema en ningún lado.</h6>
</main>