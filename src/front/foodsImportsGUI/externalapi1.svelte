<script>
	import {
            pop
	} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    import {onMount} from "svelte";

    onMount(cargagrafica);

	async function cargagrafica() {
        const resDatamio= await fetch("/api/v2/foodsImports/")
        const datosmio =  await resDatamio.json();
        let lista_22=[];
        datosmio.forEach(e => {
        if(e.year==2017){
            lista_22.push({name:e["name"],value:e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince})
        }
        });


		let datos;//cargamos el promise
        let datosfinal;//cargamoos el json final
        let lista_2=[];
        let data=[];
        let seriess;
        fetch("https://restcountries-v1.p.rapidapi.com/all", {
        	"method": "GET",
	        "headers": {
	        	"x-rapidapi-host": "restcountries-v1.p.rapidapi.com",
		        "x-rapidapi-key": "e9457b4852msh28855afa9b653a6p17e389jsn4490c02919a1"
        	}
        })
        .then(response => {
            datos =  response.json();
            
            datos.then((value) => {
                console.log(value)
                value.forEach(e => {
                    if(e["languages"].length>3){
                         lista_2.push({name:e["name"],value:e["languages"].length})  
                    }
                    
                    
                });
                    seriess=[{name:"Lenguas Oficialles",data:lista_2},{name:"Importaciones a EEUU",data:lista_22}]
                    Highcharts.chart('container', {
                        chart: {
                            type: 'packedbubble',
                            height: '100%'
                        },
                        title: {
                            text: 'Países con más de 3 lenguas Oficiales/Importaciones a EEUU'
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


                });
        })
        .catch(err => {
            console.log(err);
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
<Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports';">Inicio</Button>

	<figure class="highcharts-figure">
		<div id="container"></div>
		<p class="highcharts-description">
			Gráfica de Api externa que muestra los paises con más de 3 lenguas oficiales.
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




