<script>

    // Importaciones de svelte

    import {
        onMount
    } from "svelte";

    import {
        pop
    } from "svelte-spa-router";


    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";


    // Creamos las variables

    export let params = {};
    let fertilizer = {};
    let updatedCountry = params.country;
    let updatedYear = parseInt(params.year);
    let updatedShortTonExport = 100;
    let updatedDollarExport = 100;
    let updatedShortTonImport = 100;
    let updatedDollarImport = 100;
    let errorMsg = "";
    let successfulMsg = "";

    onMount(getFertilizer);


    // Función para obtener los datos de un país y año concreto

    async function getFertilizer() {

        console.log("Fetching fertilizer...");
        const res = await fetch("/api/v1/fertilizerImportsExports/" + params.country + params.year);

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            fertilizer = json;
            updatedCountry = params.country;
            updatedYear = params.year;
            updatedShortTonExport = fertilizer.shortTonExport;
            updatedDollarExport = fertilizer.dollarExport;
            updatedShortTonImport = fertilizer.shortTonImport;
            updatedDollarImport = fertilizer.dollarImport;
            successfulMsg = "Datos del fertilizante recibidos."
            console.log("Received fertilizer.");
        } else {
            errorMsg = "Error al obtener los datos correspondientes a " + updatedCountry + " y " + updatedYear;
            console.log("ERROR!");
        }
    }


    // Función para actualizar los datos de un país y año concreto

    async function updateFertilizer() {

        console.log("Updating fertilizer..." + JSON.stringify(params.country) + JSON.stringify(params.year));

        const res = await fetch("/api/v1/fertilizerImportsExports/" + params.country + "/" + params.year, {
            method: "PUT",
            body: JSON.stringify({
                country: params.country,
                year: parseInt(params.year),
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
                successfulMsg = "Los datos correspondientes a " + updatedCountry + " y " + updatedYear + " han sido actualizados."
                errorMsg = "";
			}else{
                errorMsg = "Error al actualizar el dato correspondiente a " + updatedCountry + " y " + updatedYear
                successfulMsg = "";
			}
        });
    }
</script>

<!-- Similar a lo visto anteriormente en FertilizersTable -->

<main>
    <h3>Edita los datos del fertilizante con <strong>{params.country}, {params.year}</strong></h3>
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
