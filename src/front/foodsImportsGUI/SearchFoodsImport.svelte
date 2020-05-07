<script>
    let foodsImports={};

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import {onMount} from "svelte";
    //Parametros de búsqueda 
    let busName="";
    let busYear="";
    //Introducción y creación de tablas con un único elemento
    let searchedFoodsImportsName="";
    let searchedFoodsImportsYear="";
    let searchedFoodsImportsTVegANDPrep="";
    let searchedFoodsImportsfruitJuice="";
    let searchedFoodsImportsTSweANDCndy="";
    let searchedFoodsImportsTLiveAnimal="";
    let searchedFoodsImportsFishFilletANDMince="";
    //Mensaje de Error
    let errorMsg="";
    //Varios elementos para generar varias filas y no solo una
    let varios=false;
    //Se ha realizado una busqueda? ON=si 
    let on=false;
    //Tipo de Búsqueda, null=0,año=1, país=2 o ambas=3;
    let tipo=0;

    async function getFoodsImport_aux1(){
        varios=false;
        if((busName==""||busName==undefined) && (busYear!=undefined && busYear!="")){
            getFoodsImportYear();
        }
        if((busName!="" && busName!=undefined) && (busYear==undefined || busYear=="")){
            getFoodsImportName();
        }
        if((busName!="" && busName!=undefined) && (busYear!=undefined && busYear!="")){
            getFoodsImportAll();
        }
    }
    async function getFoodsImportYear(){
        tipo=1;
        const res= await fetch("/api/v2/foodsImports/"+busYear);
        getFoodsImport(res);
    }
    async function getFoodsImportName(){
        tipo=2;
        const res= await fetch("/api/v2/foodsImports/"+busName);
        getFoodsImport(res);
    }
    async function getFoodsImportAll(){
        tipo=3;
        const res = await fetch("/api/v2/foodsImports/"+busName+"/"+busYear);
        getFoodsImport(res);
    }

    async function getFoodsImport(res){
        console.log("Fetching Food...");
        console.log("Name:"+busName+" Year:"+busYear);
        
        
        console.log("RES: "+res.ok);
        if (res.ok){
            on=true;
            console.log("Ok:");
            errorMsg="";
            const json =await res.json();
            foodsImports= json;
            if(foodsImports.length>1){
                varios=true;
            }else{
                if(foodsImports.length==undefined){

                }else{
                    foodsImports=foodsImports[0];
                }
                
            }
            console.log("Datitoss: "+foodsImports.name);
            searchedFoodsImportsName= foodsImports.name;
            searchedFoodsImportsYear= foodsImports.year;
            searchedFoodsImportsTVegANDPrep= foodsImports.TVegANDPrep;
            searchedFoodsImportsfruitJuice= foodsImports.fruitJuice;
            searchedFoodsImportsTSweANDCndy= foodsImports.TSweANDCndy;
            searchedFoodsImportsTLiveAnimal= foodsImports.TLiveAnimal;
            searchedFoodsImportsFishFilletANDMince= foodsImports.FishFilletANDMince;
            console.log("Received food");
        }else{
            searchedFoodsImportsTVegANDPrep=undefined;
            searchedFoodsImportsfruitJuice=undefined;
            searchedFoodsImportsTSweANDCndy=undefined;
            searchedFoodsImportsTLiveAnimal=undefined;
            searchedFoodsImportsFishFilletANDMince=undefined;
            errorMsg = res.status + ": " + res.statusText;
            console.log("Error"+ errorMsg);
        }
    }

    async function deleteFoodsImports(name,year){
        console.log("Queremos eliminar: "+name+" "+year+"/api/v2/foodsImports/"+name+"/"+year);
        const res = await fetch("/api/v2/foodsImports/"+name+"/"+year,{
            method:"DELETE"
        }).then(function(res){
                getFoodsImports(offset,offset_aux);
            });
    }
</script>

<main>
    
    <Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports';">Inicio</Button>
    
        
    
    <Table bordered>
        <thead>
            <tr>
                <th colspan="4">PAÍS</th>
                <th colspan="4">AÑO</th>
                
            </tr>
        </thead>
        <tbody>

            <tr>
                <td colspan="4"><input bind:value="{busName}"></td>
                <td colspan="4"><input bind:value="{busYear}"></td>
                <td><Button outline color="primary" on:click={getFoodsImport_aux1} >Buscar</Button></td>
            </tr>
        </tbody>
    </Table>
    {#if tipo==1}
    <h1>Estás Buscando en el año: {busYear} </h1>
    {/if}
    {#if tipo==2}
    <h1>Estás Buscando en el país: {busName} </h1>
    {/if}
    {#if tipo==3}
    <h1>Estás Buscando en el país:{busName} y año: {busYear} </h1>
    {/if}
    
    <Table bordered>
        <thead>
            <tr>
                <th>PAÍS</th>
                <th>AÑO</th>
                <th>VEGETALES Y PREPARADOS</th>
                <th>ZUMO DE FRUTAS</th>
                <th>DULCES Y CARAMELOS</th>
                <th>ANIMALES VIVOS</th>
                <th>FILETES DE PESCADO Y DESMEDUZADO</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#if on}    
                {#if varios}
                    {#await foodsImports}
                    {:then foodsImports}
                        {#each foodsImports as food}
                            <tr>
                                <td><a href="#/foodsImports/{food.name}/{food.year}">{food.name}</a></td>
                                <td>{food.year}</td>
                                <td>{food.TVegANDPrep}</td>
                                <td>{food.fruitJuice}</td>
                                <td>{food.TSweANDCndy}</td>
                                <td>{food.TLiveAnimal}</td>
                                <td>{food.FishFilletANDMince}</td>
                                <td><Button outline color="danger" on:click={() => deleteFoodsImports(food.Name,food.Year)}>Borrar</Button></td>
                            </tr>
                        {/each}
                    {/await}
                {:else}
                    {#await foodsImports}
                    {:then foodsImports}
                        {#if searchedFoodsImportsTSweANDCndy!=undefined}
                        <tr>
                            
                            <td>
                                    <a href="#/foodsImports/{foodsImports.name}/{foodsImports.year}">{searchedFoodsImportsName}</a>                             
                            </td>
                            <td>{searchedFoodsImportsYear}</td>
                            <td>{searchedFoodsImportsTVegANDPrep}</td>
                            <td>{searchedFoodsImportsfruitJuice}</td>
                            <td>{searchedFoodsImportsTSweANDCndy}</td>
                            <td>{searchedFoodsImportsTLiveAnimal}</td>
                            <td>{searchedFoodsImportsFishFilletANDMince}</td>
                            <td><Button outline color="danger" on:click={() => deleteFoodsImports(foodsImports.name,foodsImports.year)}>Borrar</Button></td>
                        </tr>
                        {/if}
                    {/await}
                {/if}
            {:else}
            {/if}    
        </tbody>
        
    </Table>
    {#if errorMsg}
    <p style="color:red;">ERROR: {errorMsg}. No se ha logrado encontrar su/s registro/s, inténtelo de nuevo con otros parámetros</p>
    {/if}
</main>
