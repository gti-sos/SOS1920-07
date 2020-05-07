<script>
    import {
        onMount
    } from "svelte";

    import {
        pop
    } from "svelte-spa-router";


    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";

    export let params = {};
    let fertilizer = {};
    let updatedCountry = "XXXX";
    let updatedYear = "XXXX";
    let updatedShortTonExport = 100;
    let updatedDollarExport = 100;
    let updatedShortTonImport = 100;
    let updatedDollarImport = 100;
    let errorMsg = "";
    let successfulMsg = "";

    onMount(getFertilizer);

    async function getFertilizer() {

        console.log("Fetching fertilizer...");
        const res = await fetch("/api/v1/fertilizerImportsExports/" + params.fertilizerCountry + params.fertilizerYear);

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            fertilizer = json;
            updatedCountry = params.fertilizerCountry;
            updatedYear = params.fertilizerYear;
            updatedShortTonExport = fertilizer.shortTonExport;
            updatedDollarExport = fertilizer.dollarExport;
            updatedShortTonImport = fertilizer.shortTonImport;
            updatedDollarImport = fertilizer.dollarImport;
            successfulMsg = "Datos del fertilizante recibidos."
            console.log("Received fertilizer.");
        } else {
            errorMsg = "Error al obtener los datos.";
            console.log("ERROR!");
        }
    }


    async function updateFertilizer() {

        console.log("Updating fertilizer..." + JSON.stringify(params.fertilizerCountry) + JSON.stringify(params.fertilizerYear));

        const res = await fetch("/api/v1/fertilizerImportsExports/" + params.fertilizerCountry + "/" + params.fertilizerYear, {
            method: "PUT",
            body: JSON.stringify({
                country: params.fertilizerCountry,
                year: parseInt(params.fertilizerYear),
                shortTonExport: parseInt(updatedShortTonExport),
                dollarExport: parseInt(updatedDollarExport),
                shortTonImport: parseInt(updatedShortTonImport),
                dollarImport: parseInt(updatedDollarImport)
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            if(res.ok){
				getFertilizer();
				successfulMsg = "Los datos han sido actualizados."
			}else{
				errorMsg = "Error al actualizar el dato."
			}
        });
    }
</script>
<main>
    <h3>Edita los datos del fertilizante con <strong>{params.fertilizerCountry}, {params.fertilizerYear}</strong></h3>
    {#await fertilizer}
        Cargando fertilizantes...
    {:then fertilizer}
        <Table bordered>
            <thead>
                <tr>
                    <th>País</th>
					<th>Año</th>
					<th>Toneladas exportadas</th>
					<th>Dólares exportados</th>
					<th>Toneladas importadas</th>
                    <th>Dólares importados</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{updatedCountry}</td>
                    <td>{updatedYear}</td>
                    <td><input bind:value="{updatedShortTonExport}"></td>
                    <td><input bind:value="{updatedDollarExport}"></td>
                    <td><input bind:value="{updatedShortTonImport}"></td>
                    <td><input bind:value="{updatedDollarImport}"></td>
                    <td> <Button outline  color="primary" on:click={updateFertilizer}>Actualizar</Button> </td>
                </tr>
        </tbody>
        </Table>
    {/await}
    {#if errorMsg}
        <p style="color: red">ERROR: {errorMsg}</p>
    {/if}
    {#if successfulMsg}
        <p style="color: green">{successfulMsg}</p>
    {/if}
    <Button outline color="secondary" on:click="{pop}">Atrás</Button>
</main>
