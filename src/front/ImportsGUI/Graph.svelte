<script>

    import {
        pop
    } from "svelte-spa-router";

    
    import Button from "sveltestrap/src/Button.svelte";

    let params = "total";
    
    let selectCountry = [
        { id : 1, text: "canada" },
        { id : 2, text: "total" }
	];

	let selected ;

	let answer = '';

    

async function loadGraph(){

        console.log(params);
        console.log(answer);
        console.log(selected);

        let MyData = [];

        const resData = await fetch("/api/v2/imports"+"?country="+selected.text);
        MyData = await resData.json();

        let data = []; 

        MyData.forEach( e => {
            let list = [];
            list.push(e.gdamalt);
            list.push(e.gdabarley);
            list.push(e.gdaoat);
            list.push(e.gdawaste);
            list.push(e.gdaethylalcohol);
            let name = e.year.toString();
            data.push({name:name,data:list})
        });

        console.log(data);

        Highcharts.chart('container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Historic World Population by Region'
            },
            subtitle: {
                text: 'Source: <a href="https://en.wikipedia.org/wiki/World_population">Wikipedia.org</a>'
            },
            xAxis: {
                categories: ['gdamalt', 'gdabarley', 'gdaoat', 'gdawaste', 'gdaethylalcohol'],
                title: {
                text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                text: 'Population (millions)',
                align: 'high'
                },
                labels: {
                overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' millions'
            },
            plotOptions: {
                bar: {
                dataLabels: {
                    enabled: true
                }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: data
        });

}

</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/series-label.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraph}"></script>
</svelte:head>


<main>
<figure class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        Basic line chart showing trends in a dataset. This chart includes the
        <code>series-label</code> module, which adds a label to each line for
        enhanced readability.
    </p>

        <label for="cars">Elije un país:</label>
        <select bind:value={selected} on:change="{() => answer = selected.id}">
            {#each selectCountry as question}
                <option value={question}>
                    {question.text}
                </option>
            {/each}
        </select>
        <Button outline color="danger"  on:click={loadGraph}>Buscar</Button>
</figure>
</main>