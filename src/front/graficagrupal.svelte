<script>
	import {
            pop
	} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    import {onMount} from "svelte";

    onMount(cargagrafica);

	async function cargagrafica() {
        let seriess=[];
        let lista_aux=[];
        const resData2= await fetch("https://sos1920-07.herokuapp.com/api/v2/Imports")
        const datos2 =  await resData2.json();
        console.log(datos2)
        datos2.forEach(e => {
            if(e.year==2010||e.year==2011||e.year==2012){
                if(lista_aux.length<10){
                    lista_aux.push({name:e["country"],value:e["gdaethylalcohol"]})
                }
            }
        });

        seriess.push({name:"Importaciones de Alcohol",data:lista_aux})
        const resData1=await fetch("https://sos1920-07.herokuapp.com/api/v1/fertilizerImportsExports")
        const datos1 =  await resData1.json();
        datos1.forEach(e => {
            if(e.year=="2010"||e.year=="2011"||e.year=="2012"){
                if(lista_aux.length<10){
                    lista_aux.push({name:e["country"],value:e["dollarImport"]/1000})
                }
            }
        });

        seriess.push({name:"Importaciones de Dolares",data:lista_aux})



        const resData= await fetch("/api/v2/foodsImports/")
        const datos =  await resData.json();
        datos.forEach(e => {
            if(e.year=="2010"||e.year=="2011"||e.year=="2012"){
                if(lista_aux.length<10){
                    lista_aux.push({name:e["name"],value:e["TSweANDCndy"]})
                }
            }
        });

        seriess.push({name:"Importaciones de Caramelos y Dulces",data:lista_aux})

        
        


        
        Highcharts.chart('container', {
                        chart: {
                            type: 'packedbubble',
                            height: '100%'
                        },
                        title: {
                            text: 'Gráfica Grupal'
                        },
                        tooltip: {
                            useHTML: true,
                            pointFormat: '<b>{point.name}:</b> {point.value}'
                        },
                        plotOptions: {
                            packedbubble: {
                                minSize: '30%',
                                maxSize: '120%',
                                zMin: 0,
                                zMax: 1000,
                                layoutAlgorithm: {
                                    splitSeries: false,
                                    gravitationalConstant: 0.02
                                },
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    filter: {
                                        property: 'y',
                                        operator: '>',
                                        value: 250
                                    },
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: seriess
                    });
    }
    
</script>

<svelte:head>
	<script src="https://code.highcharts.com/highcharts.js" ></script>
	<script src="https://code.highcharts.com/highcharts-more.js" ></script>
	<script src="https://code.highcharts.com/modules/exporting.js" ></script>
	<script src="https://code.highcharts.com/modules/accessibility.js" ></script>
</svelte:head>

<main>
<Button outline size="lg" color="primary" onclick="location.href='/#/';">Inicio</Button>

	<figure class="highcharts-figure">
		<div id="container"></div>
		<p class="highcharts-description">
			Gráfica Grupal de comparación entre Importaciones de Alcohol, Dulces y Dolares a EEUU.
		</p>
	</figure>
</main>

<style>
.highcharts-figure, .highcharts-data-table table {
    min-width: 320px; 
    max-width: 800px;
    margin: 1em auto;
}

.highcharts-data-table table {
	font-family: Verdana, sans-serif;
	border-collapse: collapse;
	border: 1px solid #EBEBEB;
	margin: 10px auto;
	text-align: center;
	width: 100%;
	max-width: 500px;
}
.highcharts-data-table caption {
    padding: 1em 0;
    font-size: 1.2em;
    color: #555;
}
.highcharts-data-table th {
	font-weight: 600;
    padding: 0.5em;
}
.highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
    padding: 0.5em;
}
.highcharts-data-table thead tr, .highcharts-data-table tr:nth-child(even) {
    background: #f8f8f8;
}
.highcharts-data-table tr:hover {
    background: #f1f7ff;
}

</style>