<!-- Creamos un div con el identificador con el que nombraremos al gráfico que vamos a crear -->

<div id = "myGraph2"></div>

<script>

// Importaciones de svelte

import {pop} from "svelte-spa-router";
import Button from "sveltestrap/src/Button.svelte";


// Carga del gráfico similar a la primera

async function loadGraph2(){

  let MyData = [];
  let shortTonExport = [];
  let dollarExport = [];
  let shortTonImport = [];
  let dollarImport = [];
  let listyear = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012'];


  const resData = await fetch("/api/v1/fertilizerImportsExports");
  MyData = await resData.json();

  MyData.forEach(element => {

    shortTonExport.push(element.shortTonExport);
    dollarExport.push(element.dollarExport);
    shortTonImport.push(element.shortTonImport);
    dollarImport.push(element.dollarImport);

  });


  // Forma de crear el gráfico con la libreria plotly.
  // En este caso le pasamos su identificador y una función

  Plotly.plot('myGraph2', ['shortTonExport', 'dollarExport', 
              'shortTonImport', 'dollarImport'].map(dataGraph2), {
    
  });


  // Esta funcion tiene como objetivo añadir los datos correspondientes a la gráfica
  // Para ello lo haré con ifs, aunque se podría hacer con cases
  // Dentro de cada caso, se añadirán un dato distinto junto a su año

  
  function dataGraph2(graphCase) {

    if (graphCase == 'shortTonExport') {
      return {
        x: listyear,
        y: shortTonExport,
        text: ' toneladas exportadas',
        name: ' toneladas exportadas',
        line: { 
          color: 'orange'
        },
      };


    } else if (graphCase == 'dollarExport') {
      return {
        x: listyear,
        y: dollarExport,
        text: ' dolares exportados',
        name: ' dolares exportados',
        line: {
          color: 'purple'
        },
      };


    } else if (graphCase == 'shortTonImport') {
      return {
        x: listyear,
        y: shortTonImport,
        text: ' toneladas importadas',
        name: ' toneladas importadas',
        line: { 
          color: 'red'
        },
      };


    } else if (graphCase == 'dollarImport') {
      return {
        x: listyear,
        y: dollarImport,
        text: ' dolares importados',
        name: ' dolares importados',
        line: { 
          color: 'green'
        },
      };


    }          
  }
}

</script>


<!-- Enlace de la libreria usada -->

<svelte:head>
  <script src="https://cdn.plot.ly/plotly-latest.min.js" on:load="{loadGraph2}"></script>
</svelte:head>


  <main>
      <div style='margin-bottom:25px;'><h6>Gráfica realizada con la librería Plotly</h6></div>
    <p>
      <Button outline size="lg" color="danger" onclick="location.href='/#/Integrations';">Volver</Button>
    </p>
  </main>
      
