<!-- Integración con api externa 1 -->

<script>

    // Importaciones de svelte
    
    import {pop} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    
    
    async function loadGraph2(){
    
    
            // Creamos las variables necesarias
            
            let MyData = [];
            let dataG2 = [];
            let ourData = [];
     
    
            // Realizamos la busqueda a las dos apis
    
            const resData = await fetch("/api/v1/fertilizerImportsExports");
            MyData = await resData.json();
    
    
            const resDataG2 = await fetch("https://servicios.ine.es/wstempus/js/es/DATOS_TABLA//t26/p067/p01/serie/l0/01005.px?tip=AM");
            if (resDataG2.ok) {
                const json = await resDataG2.json();
                dataG2 = json;
            }
    
    
            // Obtenemos los datos de cada api y las unimos en una lista común
            
            MyData.forEach(element => {
                ourData.push({
                    name: [element.country, element.year],
                    data: [element.shortTonExport, element.dollarExport, element.shortTonImport, 
                            element.dollarImport, null]
                });
            });
    

            dataG2 = dataG2[1].Data;

            dataG2.forEach(elementG2 => {
                    ourData.push({
                        name: ['Agua en ' + elementG2.NombrePeriodo], 
                        data: [null, null, null, null, elementG2.Valor]
                    });
            });
    
    
            // Creación de la gráfica highcharts
    
            Highcharts.chart('container', {
                    chart: {
                        type: 'area'
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        allowDecimals: false,
                        categories: ['Toneladas Exportadas', 'Dólares Exportados', 'Toneladas Importadas', 'Dólares Importados', 'Volumen total de agua reutilizada'],
                        title: {
                            text: 'Datos'
                        },
                    },
                    yAxis: {
                        title: {
                            text: 'Cantidad'
                        },
                        labels: {
                            formatter: function () {
                                return this.value / 1000 + 'k';
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y:,.0f}</b><br/>'
                    },
                    plotOptions: {
                        area: {
                            marker: {
                                enabled: false,
                                symbol: 'circle',
                                radius: 2,
                                states: {
                                    hover: {
                                        enabled: true
                                    }
                                }
                            }
                        }
                    },
                    series: ourData
                });
    }
    
    </script>
    
    
    <!-- Enlaces necesarios para cargar la gráfica -->
    
    <svelte:head>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/modules/exporting.js"></script>
        <script src="https://code.highcharts.com/modules/export-data.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraph2}"></script> 
    </svelte:head>
    
    
    
      <main>
        <figure class="highcharts-figure">
            <div id="container"></div>
            <p class="highcharts-description">Gráfica integrada con api externa 5</p>
        </figure>
        <p>
          <Button outline size="lg" color="danger" onclick="location.href='/#/Integrations';">Volver</Button>
        </p>
      </main>
          