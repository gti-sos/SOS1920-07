<script>

    // Importamos funciones necesarias de svelte

    import {pop} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    

    // Creamos algunas de las variables que necesitaremos, entre ellas un diccionario

    let dicountry = 
        [{key: 1, value: "Canada"},{key: 2, value: "Spain"},{key: 3, value: "United Kingdom"},
            {key: 4, value: "Mexico"},{key: 5, value: "Russian Federation"}];
	let choosed ;
	let ch ;


    // Funcion para cargar nuestro gráfico. En ella buscaremos en nuestra api por país que luego
    // podremos seleccionar para consultar los datos.

    async function loadGraph(){
        
            let MyData = [];

            const resData = await fetch("/api/v1/fertilizerImportsExports"+ "?country=" + choosed.value);
            MyData = await resData.json();

            let data = []; 

            MyData.forEach(element => {
                
                let list = [];
                let ey = element.year;

                list.push(element.shortTonExport);
                list.push(element.dollarExport);
                list.push(element.shortTonImport);
                list.push(element.dollarImport);
                
                data.push({name:ey,data:list})
            });
    

    
            // Carga de la gráfica highchart

            Highcharts.chart('container', {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Gráfica Highchart'
                },
                subtitle: {
                    text: 'Esta gráfica representa la cantidad de toneladas de fertilizante y los dólares generados en diferentes países tras su importación y exportación con los Estados Unidos.'
                },
                xAxis: {
                    allowDecimals: false,
                    categories: ['Toneladas Exportadas', 'Dólares Exportados', 'Toneladas Importadas', 'Dólares Importados'],
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
                series: data
            });
    
    }
    
    </script>
    

    <!-- Añadimos enlaces de todo lo necesario para el correcto funcionamiento de la gráfica  -->
    
    <svelte:head>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/modules/exporting.js"></script>
        <script src="https://code.highcharts.com/modules/export-data.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraph}"></script> 
    </svelte:head>
    
    
    <main>
        <figure class="highcharts-figure">
            <div id="container"></div>
            <p class="highcharts-description"></p>

            <label>Por favor, seleccione el país que desee consultar: </label>

            <!-- Este select está relacionado con lo visto anteriormente y sirve para poder escoger
            que país ver de forma individual en la gráfica -->

            <select bind:value={choosed} on:change="{() => ch = choosed.key}">
                {#each dicountry as chcountry}
                    <option value={chcountry}>
                        {chcountry.value}
                    </option>
                {/each}
            </select>
            
            <Button outline color="primary" on:click={loadGraph}>Consultar</Button>
        </figure>
        <Button outline size="lg" color="danger" onclick="location.href='/#/Integrations';">Volver</Button>
    </main>
