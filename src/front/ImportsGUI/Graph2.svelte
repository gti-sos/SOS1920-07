<script>

import {
        pop
    } from "svelte-spa-router";

    
    import Button from "sveltestrap/src/Button.svelte";

function sortJSON(data, key, orden) {
    return data.sort(function (a, b) {
        var x = a[key],
        y = b[key];

        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}        
   

async function loadGraph(){
    var color = Chart.helpers.color;
    var ctx = document.getElementById('myChart');

    let MyData = [];


    let country = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011',
                            '2012','2013','2014','2015','2016','2017'];
    

    const resData = await fetch("/api/v2/imports"+"?country=total");
    MyData = await resData.json();

    
    sortJSON(MyData, 'year','asc');
    console.log(MyData);



            var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: [MyData[0].gdamalt,MyData[1].gdamalt,MyData[2].gdamalt,MyData[3].gdamalt,MyData[4].gdamalt,MyData[5].gdamalt,
                           MyData[6].gdamalt,MyData[7].gdamalt,MyData[8].gdamalt,MyData[9].gdamalt,MyData[10].gdamalt,MyData[11].gdamalt,
                           MyData[12].gdamalt,MyData[13].gdamalt,MyData[14].gdamalt,MyData[15].gdamalt,MyData[16].gdamalt,MyData[17].gdamalt,
                         ],
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: [MyData[0].gdabarley,MyData[1].gdabarley,MyData[2].gdabarley,MyData[3].gdabarley,MyData[4].gdabarley,MyData[5].gdabarley,
                           MyData[6].gdabarley,MyData[7].gdabarley,MyData[8].gdabarley,MyData[9].gdabarley,MyData[10].gdabarley,MyData[11].gdabarley,
                           MyData[12].gdabarley,MyData[13].gdabarley,MyData[14].gdabarley,MyData[15].gdabarley,MyData[16].gdabarley,MyData[17].gdabarley,
                         ],
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total',
                    data: [MyData[0].gdaoat,MyData[1].gdaoat,MyData[2].gdaoat,MyData[3].gdaoat,MyData[4].gdaoat,MyData[5].gdaoat,
                           MyData[6].gdaoat,MyData[7].gdaoat,MyData[8].gdaoat,MyData[9].gdaoat,MyData[10].gdaoat,MyData[11].gdaoat,
                           MyData[12].gdaoat,MyData[13].gdaoat,MyData[14].gdaoat,MyData[15].gdaoat,MyData[16].gdaoat,MyData[17].gdaoat,
                         ],
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: [MyData[0].gdawaste/10,MyData[1].gdawaste/10,MyData[2].gdawaste/10,MyData[3].gdawaste/10,MyData[4].gdawaste/10,MyData[5].gdawaste/10,
                           MyData[6].gdawaste/10,MyData[7].gdawaste/10,MyData[8].gdawaste/10,MyData[9].gdawaste/10,MyData[10].gdawaste/10,MyData[11].gdawaste/10,
                           MyData[12].gdawaste/10,MyData[13].gdawaste/10,MyData[14].gdawaste/10,MyData[15].gdawaste/10,MyData[16].gdawaste/10,MyData[17].gdawaste/10,
                         ],
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: [MyData[0].gdaethylalcohol/10,MyData[1].gdaethylalcohol/10,MyData[2].gdaethylalcohol/10,MyData[3].gdaethylalcohol/10,MyData[4].gdaethylalcohol/10,MyData[5].gdaethylalcohol/10,
                           MyData[6].gdaethylalcohol/10,MyData[7].gdaethylalcohol/10,MyData[8].gdaethylalcohol/10,MyData[9].gdaethylalcohol/10,MyData[10].gdaethylalcohol/10,MyData[11].gdaethylalcohol/10,
                           MyData[12].gdaethylalcohol/10,MyData[13].gdaethylalcohol/10,MyData[14].gdaethylalcohol/10,MyData[15].gdaethylalcohol/10,MyData[16].gdaethylalcohol/10,MyData[17].gdaethylalcohol/10,
                         ],
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                }]
            },
            
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
}

</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0" on:load="{loadGraph}"></script>
</svelte:head>


<main>
<canvas id="myChart" width="800" height="400"></canvas>
<Button outline color="secondary" on:click="{pop}"> <i class="fas fa-arrow-circle-left"></i> Atrás </Button>

</main>