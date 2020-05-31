<script>
    import Button from "sveltestrap/src/Button.svelte";
    import {
        pop
    } from "svelte-spa-router";

    // Function Sort

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


    // Data Imports

     let MyData = [];
     let gdamalt = [];  
     let gdabarley = [];
     let gdaoat = [];
     let gdawaste = [];
     let gdaethylalcohol = [];
        

    let country = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011',
                            '2012','2013','2014','2015','2016','2017'];  
        
    async function importsData(){
        const resData = await fetch("/api/v2/imports"+"?country=total");
        MyData = await resData.json();

        sortJSON(MyData, 'year','asc');

        gdamalt = [MyData[0].gdamalt,MyData[1].gdamalt,MyData[2].gdamalt,MyData[3].gdamalt,MyData[4].gdamalt,MyData[5].gdamalt,
                        MyData[6].gdamalt,MyData[7].gdamalt,MyData[8].gdamalt,MyData[9].gdamalt,MyData[10].gdamalt,MyData[11].gdamalt,
                        MyData[12].gdamalt,MyData[13].gdamalt,MyData[14].gdamalt,MyData[15].gdamalt,MyData[16].gdamalt,MyData[17].gdamalt,
                        ];

        gdabarley = [MyData[0].gdabarley,MyData[1].gdabarley,MyData[2].gdabarley,MyData[3].gdabarley,MyData[4].gdabarley,MyData[5].gdabarley,
                            MyData[6].gdabarley,MyData[7].gdabarley,MyData[8].gdabarley,MyData[9].gdabarley,MyData[10].gdabarley,MyData[11].gdabarley,
                            MyData[12].gdabarley,MyData[13].gdabarley,MyData[14].gdabarley,MyData[15].gdabarley,MyData[16].gdabarley,MyData[17].gdabarley,
                            ];
    
        gdaoat = [MyData[0].gdaoat/10,MyData[1].gdaoat/10,MyData[2].gdaoat/10,MyData[3].gdaoat/10,MyData[4].gdaoat/10,MyData[5].gdaoat/10,
                        MyData[6].gdaoat/10,MyData[7].gdaoat/10,MyData[8].gdaoat/10,MyData[9].gdaoat/10,MyData[10].gdaoat/10,MyData[11].gdaoat/10,
                        MyData[12].gdaoat/10,MyData[13].gdaoat/10,MyData[14].gdaoat/10,MyData[15].gdaoat/10,MyData[16].gdaoat/10,MyData[17].gdaoat/10,
                        ];

        gdawaste = [MyData[0].gdawaste/10,MyData[1].gdawaste/10,MyData[2].gdawaste/10,MyData[3].gdawaste/10,MyData[4].gdawaste/10,MyData[5].gdawaste/10,
                            MyData[6].gdawaste/10,MyData[7].gdawaste/10,MyData[8].gdawaste/10,MyData[9].gdawaste/10,MyData[10].gdawaste/10,MyData[11].gdawaste/10,
                            MyData[12].gdawaste/10,MyData[13].gdawaste/10,MyData[14].gdawaste/10,MyData[15].gdawaste/10,MyData[16].gdawaste/10,MyData[17].gdawaste/10,
                            ];
        
        gdaethylalcohol = [MyData[0].gdaethylalcohol/10,MyData[1].gdaethylalcohol/10,MyData[2].gdaethylalcohol/10,MyData[3].gdaethylalcohol/10,MyData[4].gdaethylalcohol/10,MyData[5].gdaethylalcohol/10,
                                MyData[6].gdaethylalcohol/10,MyData[7].gdaethylalcohol/10,MyData[8].gdaethylalcohol/10,MyData[9].gdaethylalcohol/10,MyData[10].gdaethylalcohol/10,MyData[11].gdaethylalcohol/10,
                                MyData[12].gdaethylalcohol/10,MyData[13].gdaethylalcohol/10,MyData[14].gdaethylalcohol/10,MyData[15].gdaethylalcohol/10,MyData[16].gdaethylalcohol/10,MyData[17].gdaethylalcohol/10,
                                ];

        loadapiextern1();
        loadapiextern2();
        loadapiextern3();
        loadapiInter1();
        loadapiInter2();
        loadapiInter3();
        loadapiInter4();
        loadapiInter5();
        loadapiInter6();
        loadapiInter7();
        loadapiInter8();
        loadapiInter9();
        
    };

    
    


// Externa 1
    async function loadapiextern1(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartExterOne');

        let MyDataExte = [];

        const resData2 = await fetch("http://servicios.ine.es/wstempus/js/es/DATOS_TABLA/2886?tip=AM");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte[0].Data.slice(2,20);  
        sortJSON(MyDataExte, 'Anyo','asc');   
        let population = []
        MyDataExte.forEach(e => {
            population.push(e.Valor);
        });

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Poblacion Cantabria',
                    data: population,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

// Externa 2
    async function loadapiextern2(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartExterTwo');

        let MyDataExte = [];

        const resData2 = await fetch("http://servicios.ine.es/wstempus/js/es/DATOS_TABLA/2855?tip=AM");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte[0].Data.slice(2,20);  
        sortJSON(MyDataExte, 'Anyo','asc');   
        let population = []
        MyDataExte.forEach(e => {
            population.push(e.Valor);
        });

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Poblacion Albatece',
                    data: population,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

// Externa 3
    async function loadapiextern3(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartExterThree');

        let MyDataExte = [];

        const resData2 = await fetch("http://servicios.ine.es/wstempus/js/es/DATOS_TABLA/20171?tip=AM");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte[0].Data.slice(2,20);  
        sortJSON(MyDataExte, 'Anyo','asc');   
        let population = []
        MyDataExte.forEach(e => {
            population.push(e.Valor*10);
        });

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Separación Divorcios España *10',
                    data: population,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };


    // Compañero 1
    async function loadapiInter1(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInterOne');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v3/plugin-vehicles-stats");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.country == "Spain"});
        sortJSON(MyDataExte, 'year','asc'); 
        let unic = MyDataExte[0]["pev-stock"] ;
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,unic*5]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Ventas Acumuladas Vehiculos España * 5',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };


    // Compañero 2
    async function loadapiInter2(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter2');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/evolution-of-cycling-routes");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.province == "sevilla"});
        sortJSON(MyDataExte, 'year','asc');
        
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0].metropolitan*5000,0,MyDataExte[1].metropolitan*5000]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'rutas ciclistas Metropolitano Sevilla * 5000',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 3
    async function loadapiInter3(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter3');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/fires-stats");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.community == "andalucia"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,MyDataExte[0]["total_fire"]*1000,MyDataExte[1]["total_fire"]*1000,0,0,0,0,0,0,0,0,0]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Total Incendios Andalucia * 1000',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 4
    async function loadapiInter4(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter4');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/not-hospitalized-stats");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.province == "Sevilla"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["total"]*100,0,0,0]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Victimas nos hospitalizadas en accidente Sevilla *100',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 5
    async function loadapiInter5(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter5');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/economic-freedom-indexes");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.country == "Panama"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["efiindex"]*10000,MyDataExte[1]["efiindex"]*10000]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Libertad por pais Indice Panama * 10000',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 6
    async function loadapiInter6(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter6');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v1/roads");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.province == "Cadiz"});
        sortJSON(MyDataExte, 'year','asc'); 
        console.log(MyDataExte); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["total"]*500]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Carreteras en cadiz por 500',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 7
    async function loadapiInter7(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter7');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/poverty-stats");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.country == "armenia"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["under_190"]*30000000]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Falta Nombre',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 8
    async function loadapiInter8(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter8');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v2/poverty-stat");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.country == "spain"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["poverty_prp"]*100,0,0,0,0,MyDataExte[1]["poverty_prp"]*100,0,MyDataExte[2]["poverty_prp"]*100]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Ingreso mínimo en españa * 100',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };

    // Compañero 9
    async function loadapiInter9(){
        var color = Chart.helpers.color;
        var ctx = document.getElementById('myChartInter9');

        let MyDataExte = [];

        const resData2 = await fetch("/api/v1/life_expectancies");
        MyDataExte = await resData2.json();
        MyDataExte = MyDataExte.filter(e => {return e.country == "mexico"});
        sortJSON(MyDataExte, 'year','asc'); 
        let dataExtern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,MyDataExte[0]["average_life_expectancy"]*10000,0,0]
        

        var myChartExterOne = new Chart(ctx, {
            type: 'line',
            data: {
                labels: country,
                datasets: [{
                    label: 'Importacion Malta Total',
                    data: gdamalt,
                    backgroundColor: 	["rgba(0,191,255,0.2)"],
                    borderColor: 	["rgba(0,191,255,0.2)"],
                    borderWidth: 1
                },
                {
                    label: 'Importacion Cebada Total',
                    data: gdabarley,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Importacion Avena Total/10',
                    data: gdaoat,
                    backgroundColor: "rgba(42, 187, 155, 0.1)",
                    borderColor: "rgba(42, 187, 155, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportación Residuos Total/10',
                    data: gdawaste,
                    backgroundColor: "rgba(253, 227, 167, 0.1)",
                    borderColor: "rgba(253, 227, 167, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Exportació Alcohol Total/10',
                    data: gdaethylalcohol,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1
                },
                {
                    label: 'Experanza de vida  * 10000',
                    data: dataExtern,
                    backgroundColor: "rgba(8, 255, 0, 0.1)",
                    borderColor: "rgba(8, 255, 0, 0.1)",
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
    };


    function loadGraph(){
        importsData();
    };




// Cambiar Api que se visualiza
    let api_active = 1;
    async function showgraph(){
        console.log(api_active);
        
        document.getElementById("api-1").className = 'panel';
        document.getElementById("api-2").className = 'panel';
        document.getElementById("api-3").className = 'panel';
        document.getElementById("api-4").className = 'panel';
        document.getElementById("api-5").className = 'panel';
        document.getElementById("api-6").className = 'panel';
        document.getElementById("api-7").className = 'panel';
        document.getElementById("api-8").className = 'panel';
        document.getElementById("api-9").className = 'panel';
        document.getElementById("api-10").className = 'panel';
        document.getElementById("api-11").className = 'panel';
        document.getElementById("api-12").className = 'panel';
        document.getElementById("api-13").className = 'panel';
        let id = "api-"+String(api_active);
        document.getElementById(id).className = 'panel active';
        console.log(id);
    };
   
</script>


<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0" on:load="{loadGraph}"></script>

</svelte:head>
    
<main>
    <style>
        .active {
            display: block;
        }
        .panel {
            display: none;
        }
    </style>

    <div class="row">
        <div class="col-4">
          <div class="list-group" id="list-tab" role="tablist">

            <button   on:click="{() => api_active = 1}" on:click="{showgraph}" >Integración Api Externa 1</button>
            <button   on:click="{() => api_active = 2}" on:click="{showgraph}">Integración Api Externa 2</button>
            <button   on:click="{() => api_active = 3}" on:click="{showgraph}">Integración Api Externa 3</button>
            <button   on:click="{() => api_active = 4}" on:click="{showgraph}">ntegración Api Externa 4</button>
            <button   on:click="{() => api_active = 5}" on:click="{showgraph}">Integración Api Interna 09</button>
            <button   on:click="{() => api_active = 6}" on:click="{showgraph}">Integración Api Interna 02</button>
            <button   on:click="{() => api_active = 7}" on:click="{showgraph}">Integración Api Interna 23</button>
            <button   on:click="{() => api_active = 8}" on:click="{showgraph}">Integración Api Interna 06</button>
            <button   on:click="{() => api_active = 9}" on:click="{showgraph}">Integración Api Interna 11</button>
            <button   on:click="{() => api_active = 10}" on:click="{showgraph}">Integración Api Interna 04</button>
            <button   on:click="{() => api_active = 11}" on:click="{showgraph}">Integración Api Interna 27</button>
            <button   on:click="{() => api_active = 12}" on:click="{showgraph}">Integración Api Interna 01</button>
            <button   on:click="{() => api_active = 13}" on:click="{showgraph}">Integración Api Interna 05</button>

        </div>
        </div>
        <div class="col-8">
          <div class="tab-content" id="nav-tabContent">
            <div class="panel active" id="api-1" >
                <canvas id="myChartExterOne" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-2" >
                <canvas id="myChartExterTwo" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-3" >
                <canvas id="myChartExterThree" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-4" >
                <canvas id="myChartExterThree" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-5" >
                <canvas id="myChartInterOne" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-6" >
                <canvas id="myChartInter2" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-7" >
                <canvas id="myChartInter3" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-8" >
                <canvas id="myChartInter4" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-9" >
                <canvas id="myChartInter5" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-10" >
                <canvas id="myChartInter6" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-11" >
                <canvas id="myChartInter7" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-12" >
                <canvas id="myChartInter8" width="800" height="400"></canvas>
            </div>
            <div class="panel" id="api-13" >
                <canvas id="myChartInter9" width="800" height="400"></canvas>
            </div>
           
          </div>
        </div>
    </div>

    <Button outline color="secondary" on:click="{pop}"> <i class="fas fa-arrow-circle-left"></i> Atrás </Button>
    
</main>