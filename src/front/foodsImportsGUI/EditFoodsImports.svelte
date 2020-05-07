<script>
    export let params={};
    let foodsImports={};

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import {onMount} from "svelte";

    let updateFoodsImportsName="";
    let updateFoodsImportsYear="";
    let updateFoodsImportsTVegANDPrep="";
    let updateFoodsImportsfruitJuice="";
    let updateFoodsImportsTSweANDCndy="";
    let updateFoodsImportsTLiveAnimal="";
    let updateFoodsImportsFishFilletANDMince="";
    let errorMsg="";

    async function updateFoodsImports(){
        console.log("Actualizando Importaciones de Comida...."+params.foodsName+" "+params.foodsYear);
        const res = await fetch("/api/v2/foodsImports/"+params.foodsName+"/"+params.foodsYear,{
            method:"PUT",
            body: JSON.stringify({
                name:params.foodsName,
                year:params.foodsYear,
                TVegANDPrep:updateFoodsImportsTVegANDPrep,
                fruitJuice:updateFoodsImportsfruitJuice,
                TSweANDCndy:updateFoodsImportsTSweANDCndy,
                TLiveAnimal:updateFoodsImportsTLiveAnimal,
                FishFilletANDMince:updateFoodsImportsFishFilletANDMince
            }),
            headers:{
                "Content-Type":"application/json"
            }}).then(function(res){
                getFoodsImport();
            });

    }

    onMount(getFoodsImport);

    async function getFoodsImport(){
        console.log("Fetching Food...");
        const res= await fetch("/api/v2/foodsImports/"+params.foodsName+"/"+params.foodsYear);
    
        if (res.ok){
            console.log("Ok:");
            const json =await res.json();
            foodsImports= json;
            console.log("Datos: "+foodsImports.name);
            updateFoodsImportsName= foodsImports.name;
            updateFoodsImportsYear= foodsImports.year;
            updateFoodsImportsTVegANDPrep= foodsImports.TVegANDPrep;
            updateFoodsImportsfruitJuice= foodsImports.fruitJuice;
            updateFoodsImportsTSweANDCndy= foodsImports.TSweANDCndy;
            updateFoodsImportsTLiveAnimal= foodsImports.TLiveAnimal;
            updateFoodsImportsFishFilletANDMince= foodsImports.FishFilletANDMince;
            console.log("Received food");
        }else{
            errorMsg = res.status + ": " + res.statusText;
            console.log("Error"+ errorMsg);
        }
    }


</script>


<main>
    <h3>Estas editando las importaciones a <strong>{params.foodsName}</strong> en <strong>{params.foodsYear}</strong></h3> 
    {#await foodsImports[0]}
    {:then foodsImports}
        
    
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

            <tr>
                <td>{updateFoodsImportsName}</td>
                <td>{updateFoodsImportsYear}</td>
                <td><input bind:value="{updateFoodsImportsTVegANDPrep}"></td>
                <td><input bind:value="{updateFoodsImportsfruitJuice}"></td>
                <td><input bind:value="{updateFoodsImportsTSweANDCndy}"></td>
                <td><input bind:value="{updateFoodsImportsTLiveAnimal}"></td>
                <td><input bind:value="{updateFoodsImportsFishFilletANDMince}"></td>
                <td><Button outline color="primary" on:click={updateFoodsImports}>Actualizar</Button></td>
            </tr>

        </tbody>
    </Table>
    {/await}
    {#if errorMsg}
    <p style="color:red;">ERROR: {errorMsg}</p>
    {/if}
</main>