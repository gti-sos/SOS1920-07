<script>
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import {onMount} from "svelte";
    
    

    
    let offset=0;
    let limit=10;
    let offset_aux=0;
    let borrado=false;
    let creado=false;
    let borrado_reg=false;

    let foodsImports = [];
    let newfoodsImports={
        name:"",
        year:"",
        TVegANDPrep:"",
        fruitJuice:"",
        TSweANDCndy:"",
        TLiveAnimal:"",
        FishFilletANDMince:""

    };
    let lenfoodsImports= 10;
    let errNotEmpty=false;
    let errRepe=false;
    

    onMount(getFoodsImports);

    async function initFoods(){
        const res_aux= await fetch("/api/v2/foodsImports");
        const json_aux =await res_aux.json();
        let foodsImports_aux= json_aux;
        lenfoodsImports=foodsImports_aux.length;
    }

    async function loadInitialFoodsImports(){
        borrado=false;
        const res_aux= await fetch("/api/v2/foodsImports/loadInitialData");
        getFoodsImports();
    }

    async function getFoodsImports(off,off_aux){
        creado=false;
        borrado_reg=false;
        errNotEmpty=false;
        errRepe=false;
        newfoodsImports={
        name:"",
        year:"",
        TVegANDPrep:"",
        fruitJuice:"",
        TSweANDCndy:"",
        TLiveAnimal:"",
        FishFilletANDMince:""

    };
        initFoods();
        if(off==undefined){
            offset=0;
            offset_aux=0;
        }else{
            offset=off;
            offset_aux=off_aux;
        }
        
        console.log("Fetching Foods...");
        const res= await fetch("/api/v2/foodsImports?offset="+offset+"&limit="+limit);
        if (res.ok){
            console.log("Ok:");
            const json =await res.json();
            foodsImports= json;
            console.log("Received "+foodsImports.length+" foods");
        }else{
            console.log("Error");
        }
    }

    async function insertFoodsImports_aux(){
        errNotEmpty=false;
        errRepe=false;
        if(newfoodsImports.name=="" ||
        newfoodsImports.year=="" ||
        newfoodsImports.TVegANDPrep=="" ||
        newfoodsImports.fruitJuice=="" ||
        newfoodsImports.TSweANDCndy=="" ||
        newfoodsImports.TLiveAnimal=="" ||
        newfoodsImports.FishFilletANDMince=="" ){
            errNotEmpty=true;
        }else{
            const res= await fetch("/api/v2/foodsImports");
            const json =await res.json();
            foodsImports= json;
            foodsImports.forEach(i => {
                if(i.name==newfoodsImports.name && i.year==newfoodsImports.year){
                    errRepe=true;
                }
            });
            if(errRepe==false){
                insertFoodsImports();
            }

        }

        

        
    }

    async function insertFoodsImports(){
        console.log("Insertando Importaciones de Comida...."+JSON.stringify(newfoodsImports));
        const res = await fetch("/api/v2/foodsImports",{
            method:"POST",
            body: JSON.stringify(newfoodsImports),
            headers:{
                "Content-Type":"application/json"
            }}).then(function(res){
                getFoodsImports(offset,offset_aux);
                creado=true;
            });
    };

    async function deleteAllFoodsImports(){
        
        console.log("Queremos eliminar:");
        const res = await fetch("/api/v2/foodsImports/",{
            method:"DELETE"
        }).then(function(res){
                getFoodsImports(offset,offset_aux);
                borrado=true;
            });
    }

    async function deleteFoodsImports(name,year){
        
        console.log("Queremos eliminar: "+name+" "+year+"/api/v2/foodsImports/"+name+"/"+year);
        const res = await fetch("/api/v2/foodsImports/"+name+"/"+year,{
            method:"DELETE"
        }).then(function(res){
                getFoodsImports(offset,offset_aux);
                borrado_reg=true;
            });
    }

    function aumoffset(){
        offset=offset+limit;
        offset_aux=offset_aux+1;
        console.log("Offset: "+offset);
        getFoodsImports(offset,offset_aux);
        
    }
    function disoffset(){
        if(offset>=1){
            offset=offset-limit;
            offset_aux=offset_aux-1;
            console.log("Offset: "+offset);
            getFoodsImports(offset,offset_aux);
        }
    }
</script>


<main>
    {#await foodsImports}
    {:then foodsImports}
    
    <p style="color:green;">Si no aparece ningún dato pulse borrar todo y podrá rellenar la tabla.</p>
    
    <label>
        <a>Elementos por página: <input type=number bind:value={limit} min=1 max={lenfoodsImports} on:click={() =>getFoodsImports(0,0)}></a>
    </label>
    
    {#if creado}
    <p style="color:green;">Registro Creado Correctamente.</p>
    {/if}
    {#if borrado_reg}
    <p style="color:red;">Registro Borrado Correctamente.</p>
    {/if}
    {#if errRepe}
    <p style="color:red;">Registro Ya está creado, si deséa actualizarlo búsquelo y haga click en el País.</p>
    {/if}
    {#if errNotEmpty}
    <p style="color:red;">Registro no valido, puede que tenga algún parámetro vacío.</p>
    {/if}
    
        
    
    <Table bordered>
        <thead>
            <tr>
                <th>PAÍS<h6>(Click en el nombre para editar)</h6></th>
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

            <tr>
                <td><input bind:value="{newfoodsImports.name}"></td>
                <td><input bind:value="{newfoodsImports.year}"></td>
                <td><input bind:value="{newfoodsImports.TVegANDPrep}"></td>
                <td><input bind:value="{newfoodsImports.fruitJuice}"></td>
                <td><input bind:value="{newfoodsImports.TSweANDCndy}"></td>
                <td><input bind:value="{newfoodsImports.TLiveAnimal}"></td>
                <td><input bind:value="{newfoodsImports.FishFilletANDMince}"></td>
                <td><Button outline color="primary" on:click={insertFoodsImports_aux}>Insertar</Button></td>
            </tr>

            {#each foodsImports as food}
                <tr>
                    <td><a href="#/foodsImports/{food.name}/{food.year}">{food.name}</a>                        
                    </td>
                    <td>{food.year}</td>
                    <td>{food.TVegANDPrep}</td>
                    <td>{food.fruitJuice}</td>
                    <td>{food.TSweANDCndy}</td>
                    <td>{food.TLiveAnimal}</td>
                    <td>{food.FishFilletANDMince}</td>
                    <td><Button outline color="danger" on:click={() => deleteFoodsImports(food.name,food.year)}>Borrar</Button></td>
                </tr>
            {/each}
            <tr>
                <td  style="text-align: center;" colspan="2" ><Button onclick="location.href='/#/foodsImports/SearchFoodsImport/';" type="submit" color="info" size="lg">Búsquedas</Button></td>
                <td  style="text-align: center;" colspan="1" ><Button onclick="location.href='/#/foodsImports/MiGrafica/';" type="submit" color="info" size="lg">Grafica HighChart</Button></td>
                {#if borrado==true}
                <td  style="text-align: center;" colspan="2" ><Button  type="submit" color="success" size="lg" on:click={() =>loadInitialFoodsImports()}>Se han borrado todos los datos, puede volver a cargar los valores iniciales</Button></td>
                {:else}
                <td colspan="2"></td>
                {/if}

                <td colspan="1"></td>
                <td style="text-align: center;" colspan="2" > <Button color="danger" size="lg" on:click={() => deleteAllFoodsImports()}>Borrar Todo</Button></td>
            </tr>
        </tbody>
    </Table>
    
    {#if offset>0}
    <Button on:click={() =>disoffset()}>Anterior</Button>
    {/if}
    {#if lenfoodsImports-limit*(offset_aux+1)>0}
    <Button on:click={() =>aumoffset()}>Siguiente</Button>
    {/if}
    {/await}
    

</main>

<style>
    table{
        border: 1px solid black;
    }
</style>
