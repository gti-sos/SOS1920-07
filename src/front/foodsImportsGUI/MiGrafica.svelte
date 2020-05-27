<script>
import {onMount} from "svelte";
import { FormGroup, CustomInput, Label } from 'sveltestrap';
import { Button } from "sveltestrap";
Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});
let inputValue;
onMount(CargaGrafica);
let años=["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017"];
let mySet = new Set();
let mySet_aux=[];
let pais_aux;
console.log("Paisss"+pais_aux)
function datosAnual(lista,año,valor){
    let lista_aux=[]
    if (lista.length==0){
        for (var i=0; i<18;i++){
            lista_aux.push(0);
        } 
    }else{
        lista_aux=lista;
    }
    
    
    let dic={"2000":0,"2001":1, "2002":2, "2003":3, "2004":4, "2005":5, "2006":6, "2007":7, "2008":8, "2009":9, "2010":10, "2011":11, "2012":12, "2013":13, "2014":14, "2015":15, "2016":16, "2017":17};
    lista_aux.splice(dic[año], 1, valor+lista_aux[dic[año]]);
    return lista_aux;
}
async function CargaSet(){
    const resData= await fetch("/api/v2/foodsImports")
    const datos =  await resData.json();
    let lista=[];
    datos.forEach(e => {
        lista.push(e.name);
    });
    let newLista=lista.unique();
    console.log("newLista: "+newLista)
    return newLista;
}
function CargaGrafica_aux(aux){
        console.log("ayuda: "+aux);
        CargaGrafica()
    }
async function CargaGrafica(){
    const resData= await fetch("/api/v2/foodsImports/"+pais_aux)
    const datos =  await resData.json();
    mySet_aux= await CargaSet();
    console.log(pais_aux);
    if (pais_aux==undefined){
    }else{
        let data= [];
    let name= "";
    let name1= "";
    let name2= "";
    let name3= "";
    let name4= "";
    let name5= "";
    let lista=[];
    let lista1=[];
    let lista2=[];
    let lista3=[];
    let lista4=[];
    if(pais_aux==undefined){
    }else{
        console.log("Paisss: "+pais_aux.dataTransfer);
    }
    
    
    datos.forEach(e => {
        lista= datosAnual(lista,e.year,e.TVegANDPrep);
        name = "VEGETALES Y PREPARADOS";
    });
    
    data.push({name:name,data:lista});
    datos.forEach(e => {
        lista1=datosAnual(lista1,e.year,e.fruitJuice);
        name1 = "ZUMO DE FRUTAS";
    });
    data.push({name:name1,data:lista1});
    datos.forEach(e => {
        lista2=datosAnual(lista2,e.year,e.TSweANDCndy);
        name2 = "DULCES Y CARAMELOS";
    });
    data.push({name:name2,data:lista2});
    datos.forEach(e => {
        lista3=datosAnual(lista3,e.year,e.TLiveAnimal);
        name3 = "ANIMALES VIVOS";
    });
    data.push({name:name3,data:lista3});
    datos.forEach(e => {
        lista4=datosAnual(lista4,e.year,e.FishFilletANDMince);
        name4 = "FILETES DE PESCADO Y DESMEDUZADO";
    });
    data.push({name:name4,data:lista4})
    console.log(data);
    if (pais_aux==""){
        Highcharts.chart('container', {
    chart: {
        type: 'line'
    },
    title: {
        text: "Importaciones de Todo el Mundo(Suma) a Estados Unidos"
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: {
        categories: ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017']
    },
    yAxis: {
        title: {
        text: 'Toneladas'
        }
    },
    plotOptions: {
        line: {
        dataLabels: {
            enabled: false
        },
        enableMouseTracking: false
        }
    },
    series:data
    });
    }else{
        Highcharts.chart('container', {
    chart: {
        type: 'line'
    },
    title: {
        text: "Importaciones de "+pais_aux+" a Estados Unidos"
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: {
        categories: ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017']
    },
    yAxis: {
        title: {
        text: 'Toneladas'
        }
    },
    plotOptions: {
        line: {
        dataLabels: {
            enabled: false
        },
        enableMouseTracking: false
        }
    },
    series:data
    });
    }
    
    
        
    }
}
</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js" ></script>
</svelte:head>


<main>
<Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports';">Inicio</Button>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            Esta gráfica muestra como varían las exportaciones hacia EEUU desde Todo el mundo.
        </p>
    </figure>
    {#await mySet_aux}
    {:then mySet_aux}
    <FormGroup>
        <Label>Elige un País (Elige la casilla en blanco para ver el Total de todos los Países)</Label>
        <CustomInput
            type="select"
            bind:value={pais_aux}
        >
            <option></option>
            {#each mySet_aux as sett}
            <option value={sett}>{sett}</option>
            {/each}
        </CustomInput>
        <Button  on:click={() =>CargaGrafica_aux(pais_aux)}>Buscar por país</Button>
    </FormGroup>
    
    {/await}
</main>