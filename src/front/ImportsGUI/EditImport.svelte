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
    let imports = {};
    let updatedCountry = params.country;
    let updatedyear = parseInt(params.year);
    let updatedgdamalt = 0;
    let updatedgdabarley = 0;
    let updatedgdaoat = 0;
    let updatedgdawaste = 0;
    let updatedgdaethylalcohol = 0;
    let errorMsg = "";

    onMount(getImport);

    async function getImport() {

        console.log("Fetching contact...");
        const res = await fetch("/api/v2/imports/" + params.country+"/"+params.year);
        console.log(params)
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            imports = json;
            updatedCountry = imports.country;
            updatedyear = imports.year;
            updatedgdamalt = imports.gdamalt;
            updatedgdabarley = imports.gdabarley;
            updatedgdaoat = imports.gdaoat;
            updatedgdawaste = imports.gdawaste;
            updatedgdaethylalcohol = imports.gdaethylalcohol;
            console.log("Received contact.");
        } else {
            errorMsg = res.status + ": " + res.statusText;
            console.log("ERROR!" + errorMsg);
        }
    }


    async function updateImport() {

        console.log("Updating contact..." + JSON.stringify(params.contactName));

        const res = await fetch("/api/v2/imports/" + params.country+"/"+params.year, {
            method: "PUT",
            body: JSON.stringify({
                country: params.country,
                year: parseInt(params.year),
                gdamalt: parseFloat(updatedgdamalt),
                gdabarley:parseFloat(updatedgdabarley),
                gdaoat:parseFloat(updatedgdaoat),
                gdawaste:parseFloat(updatedgdawaste),
                gdaethylalcohol:parseFloat(updatedgdaethylalcohol)
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            if (res.ok) {
				getImports();
				errorMsg = "";
			}else{
				errorMsg = res.status + ": " + res.statusText;
			}
        });



    }
</script>
<main>
    <h3>Edit Contact <strong>{params.country}-{params.year}</strong></h3>
    {#await imports}
        Loading contacts...
    {:then imports}
        <Table bordered>
            <thead>
                <tr>
                    <th>País</th>
					<th>Año</th>
					<th>Malta</th>
					<th>Cebada</th>
					<th>Avena</th>
					<th>Residuos</th>
                    <th>Alcohol</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{updatedCountry}</td>
                    <td>{updatedyear}</td>
                    <td><input bind:value="{updatedgdamalt}"></td>
                    <td><input bind:value="{updatedgdabarley}"></td>
                    <td><input bind:value="{updatedgdaoat}"></td>
                    <td><input bind:value="{updatedgdawaste}"></td>
                    <td><input bind:value="{updatedgdaethylalcohol}"></td>
                    <td> <Button outline  color="primary" on:click={updateImport}>Actualizar</Button> </td>
                </tr>
        </tbody>
        </Table>
    {/await}
    {#if errorMsg}
        <p style="color: red">ERROR: {errorMsg}</p>
    {/if}
    <Button outline color="secondary" on:click="{pop}">Atrás</Button>
</main>