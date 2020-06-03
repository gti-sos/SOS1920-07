<script>
import {onMount} from "svelte";
import { FormGroup, CustomInput, Label } from 'sveltestrap';
import { Button } from "sveltestrap";


let inputValue;

onMount(CargaGrafica);

let mySet_aux=["Integracion G2 Turismo Rural","Integracion G9 Energías Renovables","Integracion G1 Migración",
    "Integracion G30 Azucar consumida","Integracion G4 Accidentes de Tráfico","Integracion G23 Venta de Cigarros",
    "Integracion G28 Venta de Vehículos eléctricos(Mediante Proxy)","Integracion G8 MotoGP","Integracion G5 Sanidad Publica",
    "Integracion G22 Formula1"];
let pais_aux;
let integ=0;//Para saber si hemos elegido ya o no la gráfica
let seriess;//Aquí cargamos los datos de las apis
let categoriass;//Aquí cargamos el eje x de la gráfica
let textt;//Aquí cargamos el texto de arriba
let textt1="% del total en esos años";//Aquí se carga la descripción del eje y
let textt2="%";//Aquí se carga las unidades
let exter=0;//Para saber si hemos elegido una de las apis externas
let chatr;

function CargaGrafica_aux(integracio){
    console.log("Paso")
    console.log("Esto es lo que pasa"+integracio)
    switch(integracio){
        case "":
            integ=0;
            break;

        case "Integracion G2 Turismo Rural":
            exter=0;
            integ=1;
            CargaDatos2();
            break;
        case "Integracion G9 Energías Renovables":
            exter=0;
            integ=1;
            CargaDatos9()
            break;
        case "Integracion G1 Migración":
            exter=0;
            integ=1;
            CargaDatos1()
            break;
        case "Integracion G30 Azucar consumida":
            exter=0;
            integ=1;
            CargaDatos30()
            break;
        case "Integracion G4 Accidentes de Tráfico":
            exter=0;
            integ=1;
            CargaDatos4()
            break;
        case "Integracion G23 Venta de Cigarros":
            exter=0;
            integ=1;
            CargaDatos23()
            break;
        case "Integracion G28 Venta de Vehículos eléctricos(Mediante Proxy)":
            exter=0;
            integ=1;
            CargaDatos28()
            break;
        case "Integracion G8 MotoGP":
            exter=0;
            integ=1;
            CargaDatos8()
            break;
        case "Integracion G5 Sanidad Publica":
            exter=0;
            integ=1;
            CargaDatos5();
            break;
        case "Integracion G22 Formula1":
            exter=0;
            integ=1;
            CargaDatos22();
            break;

    }
    
}
async function CargaDatos28(){
    categoriass=['2010','2012','2014'];
    textt="Integración con Grupo 28 Comparación entre Porcentaje de Producción de Coches Eléctricos y Total de Importaciones a EEUU"
    const resData2= await fetch("/api/v1/gce")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0,0];
    var name2="% de Producción de Coches Eléctricos";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2010){
            lista_2[0]=lista_2[0]+e["gce_cars"]
        }
        if(e.year==2012){
            lista_2[1]=lista_2[1]+e["gce_cars"]
        }
        if(e.year==2014){
            lista_2[2]=lista_2[2]+e["gce_cars"]
        }
    });
    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();

}
//------------------------------------Integración Grupo 22----------------------------------------
async function CargaDatos22(){
    categoriass=['España'];
    textt="Integración con Grupo 22 Comparación entre Puntos de Españoles en Formula1 y Importaciones de Vegetales desde España a EEUU"
    const resData2= await fetch("https://sos1920-22.herokuapp.com/api/v2/formula-stats")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0];
    var name2="Puntos de Españoles en Formula1";
    var total=0;
    textt1="Valores"
    textt2="puntos/toneladas"

    console.log(datos2)
    datos2.forEach(e => {
        if(e.country=="spain"){
            lista_2[0]=lista_2[0]+e["totalpointnumber"]
        }
    });

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0];
    var name1="Importaciones de Vegetales desde España";
    datos.forEach(e => {
        if(e.name=="SPAIN"){
            lista_2[0]=lista_2[0]+e.TVegANDPrep
        }
    });
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
}
//------------------------------------Integración Grupo 5----------------------------------------
async function CargaDatos5(){
    categoriass=['2015','2016','2017'];
    textt="Integración con Grupo 5 Comparación entre Porcentaje de Gasto en Salud Plública y Total de Importaciones a EEUU"
    const resData2= await fetch("https://sos1920-05.herokuapp.com/api/v1/health_public")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0,0];
    var name2="% de Gasto en Salud Plública";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e["total_spending"]
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e["total_spending"]
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e["total_spending"]
        }
    });
    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
}

//------------------------------------Integración Grupo 8----------------------------------------
async function CargaDatos8(){
    categoriass=['España'];
    textt="Integración con Grupo 8 Comparación entre Vistorias de Españoles en MotoGP y Importaciones de Vegetales desde España a EEUU"
    const resData2= await fetch("https://sos1920-08.herokuapp.com/api/v1/motogp-statistics")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0];
    var name2="Vistorias de Españoles en MotoGP";
    var total=0;
    textt1="Valores"
    textt2="victorias|toneladas"

    datos2.forEach(e => {
        if(e.country=="Spain"){
            lista_2[0]=lista_2[0]+e["victory"]
        }
    });

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0];
    var name1="Importaciones de Vegetales desde España";
    datos.forEach(e => {
        if(e.name=="SPAIN"){
            lista_2[0]=lista_2[0]+e.TVegANDPrep
        }
    });
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
}


//------------------------------------Integración Grupo 23----------------------------------------
async function CargaDatos23(){
    categoriass=['2007','2009'];
    textt="Integración con Grupo 9 Comparación entre Compras de Paquetes de Tabaco y Importaciones de Vegetales y Preparados a EEUU"
    const resData2= await fetch("https://sos1920-23.herokuapp.com/api/v2/cigarretes-sales")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0];
    var name2="% de Compras de Paquetes de Tabaco";
    var total=0;
    textt1="Valores"
    textt2="paquetes|toneladas"

    datos2.forEach(e => {
        if(e.year==2007){
            lista_2[0]=lista_2[0]+e["cigarrete_sale"]
        }
        if(e.year==2009){
            lista_2[1]=lista_2[1]+e["cigarrete_sale"]
        }
    });
    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2007){
            lista_2[0]=lista_2[0]+e.TVegANDPrep
        }
        if(e.year==2009){
            lista_2[1]=lista_2[1]+e.TVegANDPrep
        }
    });

    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();

}

//------------------------------------Integración Grupo 4----------------------------------------
async function CargaDatos4(){
    categoriass=['2015','2016','2017'];
    textt="Integración con Grupo 9 Comparación entre Porcentaje de Muertes por Accidentes y Total de Importaciones a EEUU"
    const resData2= await fetch("https://sos1920-04.herokuapp.com/api/v1/traffic_accidents/")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0,0];
    var name2="% de Muertes por Accidentes";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e["death"]
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e["death"]
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e["death"]
        }
    });
    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
}

//------------------------------------Integración Grupo 30----------------------------------------
async function CargaDatos30(){
    categoriass=['2015','2016','2017'];
    textt="Integración con Grupo 9 Comparación entre Porcentaje de Consumición de Azucar total y Total de Importaciones a EEUU"
    const resData2= await fetch("https://sos1920-30.herokuapp.com/api/v3/sugarconsume")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0,0];
    var name2="% de Consumición de Azucar total";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e["sugarconsume"]
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e["sugarconsume"]
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e["sugarconsume"]
        }
    });
    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    console.log((lista_2[2]/total)*100)
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
}
//------------------------------------Integración Grupo 1----------------------------------------

async function CargaDatos1(){
    categoriass=['2010','2015','2017'];
    textt="Integración con Grupo 9 Comparación entre Porcentaje de Emigrantes totales y Total de Importaciones a EEUU"
    const resData2= await fetch("https://sos1920-01.herokuapp.com/api/v2/emigrants-stats")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0,0];
    var name2="% de Emigrantes totales";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2010){
            lista_2[0]=lista_2[0]+e["em_totals"]
        }
        if(e.year==2015){
            lista_2[1]=lista_2[1]+e["em_totals"]
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e["em_totals"]
        }
    });
    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2016){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2015){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[2]=lista_2[2]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]+lista_2[2]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    lista_2[2]=(lista_2[2]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();

}
//------------------------------------Integración Grupo 9----------------------------------------
async function CargaDatos9(){
    categoriass=['2016','2017'];
    textt="Integración con Grupo 9 Comparación entre Porcentaje de Uso de Energías Renovables y Total de Importaciones a EEUU"
    const resData2= await fetch("https://sos1920-09.herokuapp.com/api/v2/renewable-sources-stats")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0];
    var name2="% de uso de Energías Renovables";
    var total=0;
    textt1="% del total en esos años";
    textt2="%";

    datos2.forEach(e => {
        if(e.year==2016){
            lista_2[0]=lista_2[0]+e["percentage-re-total"]
        }
        if(e.year==2017){
            lista_2[1]=lista_2[1]+e["percentage-re-total"]
        }
    });
    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0];
    var name1="% del total de Importaciones";
    datos.forEach(e => {
        if(e.year==2016){
            lista_2[0]=lista_2[0]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
        if(e.year==2017){
            lista_2[1]=lista_2[1]+e.fruitJuice+e.TVegANDPrep+e.TSweANDCndy+e.TLiveAnimal+e.FishFilletANDMince
        }
    });

    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();

}

//------------------------------------Integración Grupo 2----------------------------------------
async function CargaDatos2(){
    categoriass=['2015','2016'];
    textt="Integración con Grupo 2 Comparación entre Viajantes y Zumos de Frutas Importados a EEUU"
    const resData2= await fetch("https://sos1920-02.herokuapp.com/api/v2/rural-tourism-stats")
    const datos2 =  await resData2.json();
    var data=[];
    var lista_2=[0,0];
    var name2="Viajantes";
    var total=0;
    textt1="Valores"
    textt2="viajantes|toneladas"

    datos2.forEach(e => {
        if(parseInt(e.year)==2015){
            lista_2[0]=lista_2[0]+e.traveller
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.traveller
        }
    });
    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100

    data.push({name:name2,data:lista_2});
    const resData= await fetch("/api/v2/foodsImports/")
    const datos =  await resData.json();
    
    lista_2=[0,0];
    var name1="Zumo de Frutas";
    datos.forEach(e => {
        if(e.year==2015){
            lista_2[0]=lista_2[0]+e.fruitJuice
        }
        if(e.year==2016){
            lista_2[1]=lista_2[1]+e.fruitJuice
        }
    });

    total=lista_2[0]+lista_2[1]
    lista_2[0]=(lista_2[0]/total).toFixed(5)*100
    lista_2[1]=(lista_2[1]/total).toFixed(5)*100
    data.push({name:name1,data:lista_2});
    console.log(data)
    seriess=data;
    CargaGrafica();
    

}


//---------------------------------------Carga de Gráfica-----------------------------------------
function CargaGrafica(){    

    if(integ==1){
    chatr=Highcharts.chart('container', {
    
    chart: {
        type: 'column'
    },
    title: {
        text: textt
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: categoriass,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: textt1
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} '+textt2+'</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: seriess
});

    }
    
    }
</script>

<svelte:head>
<script src="https://code.highcharts.com/highcharts-more.js"></script>
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js"></script>
<script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>


<main>
<Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports';">Inicio</Button>
    {#if integ==1}
        <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
        </p>
        </figure>
    {/if}
    {#if integ==0 & exter==0}
        <h2>↓Elige un grupo de Integración Abajo↓</h2>
    {/if}
    {#if exter==1}
        <figure class="highcharts-figure">
		<div id="container"></div>
		<p class="highcharts-description">
			Gráfica común a las tres APIs. Muestra los millones de toneladas de petróleo, los porcentajes del uso energías renovables y las ventas coches eléctricos por cada 1000.
		</p>
	</figure>
    {/if}
    <FormGroup>
        <Label>Integraciones </Label>
        <CustomInput
            type="select"
            bind:value={pais_aux}
        >
            <option></option>
            {#each mySet_aux as sett}
            <option value={sett}>{sett}</option>
            {/each}
        </CustomInput>
        <Button  on:click={() =>CargaGrafica_aux(pais_aux)}>Buscar por Integracion</Button>
    </FormGroup>


</main>

