<script>
	import {
		onMount
	} from "svelte";

	import Table from "sveltestrap/src/Table.svelte";
	import Button from "sveltestrap/src/Button.svelte";

	let fertilizers = [];
	let newFertilizer = {
		country: "",
		year: 0,
		shortTonExport: 0,
		dollarExport: 0,
		shortTonImport: 0,
		dollarImport: 0
	};
	let errorMsg = "";
	let successfulMsg = "";
	let limit = 10;
	let offset = 0;

	onMount(getFertilizers);

	async function loadInitialDataFertilizers() {
		
		console.log("Loading fertilizers...");

		const res = await fetch("/api/v1/fertilizerImportsExports/loadInitialData").then(function (res) {
			getFertilizers();
		});

		successfulMsg = "Los datos iniciales ha sido cargados.";
	}

	async function getFertilizers() {

		console.log("Fetching fertilizers...");
		const res = await fetch("/api/v1/fertilizerImportsExports?limit=" + limit + "&offset=" + offset);

		if (res.ok) {
			console.log("Ok:");
			const json = await res.json();
			fertilizers = json;
			console.log("Received " + fertilizers.length + " fertilizers.");
		} else {
			console.log("ERROR!");
		}
	}

	async function insertFertilizer() {

		console.log("Inserting fertilizer..." + JSON.stringify(newFertilizer));

		// newFertilizer.year = parseInt(newImport.year);
		// newFertilizer.shortTonExport = parseInt(newImport.shortTonExport);
		// newFertilizer.dollarExport = parseInt(newImport.dollarExport);
		// newFertilizer.shortTonImport = parseInt(newImport.shortTonImport);
		// newFertilizer.dollarImport = parseInt(newImport.dollarImport);

		const res = await fetch("/api/v1/fertilizerImportsExports", {
			method: "POST",
			body: JSON.stringify(newFertilizer),
			headers: {
				"Content-Type": "application/json"
			}
		}).then(function (res) {
			if(res.ok){
				getFertilizers();
				successfulMsg = "Los datos han sido insertados."
			}else{
				errorMsg = "Error al insertar el dato."
			}
		});
		

	}

	async function deleteFertilizer(country, year) {
		const res = await fetch("/api/v1/fertilizerImportsExports/" + country + "/" + year, {
			method: "DELETE"
		}).then(function (res) {
			getFertilizers();
		});
		successfulMsg = "Los datos correspondientes a " + country + " y " + year + " han sido eliminados."
	}

	async function deleteAllFertilizer() {
		const res = await fetch("/api/v1/fertilizerImportsExports", {
			method: "DELETE"
		}).then(function (res) {
			getFertilizers();
		});
		successfulMsg = "Todos los datos han sido eliminados."
	}

	async function searchFertilizer(){
		
		let search = "";

		if(newFertilizer.country != ""){
			search = search + "&country="+newFertilizer.country
		};
		if(newFertilizer.year != 0){
			search = search + "&year="+newFertilizer.year
		};
		if(newFertilizer.shortTonExport != 0){
			search = search + "&shortTonExport="+newFertilizer.shortTonExport
		};
		if(newFertilizer.dollarExport != 0){
			search = search + "&dollarExport="+newFertilizer.dollarExport
		};
		if(newFertilizer.shortTonImport != 0){
			search = search + "&shortTonImport="+newFertilizer.shortTonImport
		};
		if(newFertilizer.dollarImport != 0){
			search = search + "&dollarImport="+newFertilizer.dollarImport
		};

		const res = await fetch("/api/v1/fertilizerImportsExports?limit=" + limit + "&offset=" + offset + search);

		if(res.ok){
			console.log("Ok:");
			const json = await res.json();
			fertilizers = json;
			if(fertilizers.length > 0){
				successfulMsg = "Búsqueda completada con éxito."
			}else{
				errorMsg = "Búsqueda finalizada sin resultados."
			}
		}else{
			errorMsg = "Error al realizar la búsqueda."
			console.log("ERROR!");
		}

	}

	async function previousPage(){
		if (offset - limit >= 0){
			offset = offset - limit;
			getFertilizers();
		}
	}

	async function nextPage(){
		const res = await fetch("/api/v1/fertilizerImportsExports");
		const json = await res.json();
		if(offset < json.length - limit){
			offset = offset + limit;
			getFertilizers();
		}
	}


</script>

<main>

	{#await fertilizers}
		Cargando fertilizante...
	{:then fertilizers}
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
					<td><input bind:value="{newFertilizer.country}"></td>
					<td><input bind:value="{newFertilizer.year}"></td>
					<td><input bind:value="{newFertilizer.shortTonExport}"></td>
					<td><input bind:value="{newFertilizer.dollarExport}"></td>
					<td><input bind:value="{newFertilizer.shortTonImport}"></td>
					<td><input bind:value="{newFertilizer.dollarImport}"></td>
					<td> <Button outline  color="primary" on:click={insertFertilizer}>Insertar</Button>
					<Button outline  color="primary" on:click={searchFertilizer}>Buscar</Button> </td>
				</tr>

				{#each fertilizers as fertilizer}
					<tr>
						<td>
							<a href="#/fertilizerImportsExports/{fertilizer.country}/{fertilizer.year}">{fertilizer.country}</a>
						</td>
						<td>{fertilizer.year}</td>
						<td>{fertilizer.shortTonExport}</td>
						<td>{fertilizer.dollarExport}</td>
						<td>{fertilizer.shortTonImport}</td>
						<td>{fertilizer.dollarImport}</td>
						<td><Button outline color="danger" on:click="{deleteFertilizer(fertilizer.country,fertilizer.year)}">Eliminar</Button></td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/await}
	{#if errorMsg}
		<p style="color: red">ERROR: {errorMsg}</p>
	{/if}
	{#if successfulMsg}
		<p style="color: green">{successfulMsg}</p>
	{/if}
	<Button outline color="success" on:click="{loadInitialDataFertilizers}">Cargar los datos iniciales</Button>
	<Button outline color="danger" on:click="{deleteAllFertilizer}">Borrar todos los datos</Button>
	<Button outline color="secondary" on:click="{previousPage}">Atrás</Button>
	<Button outline color="secondary" on:click="{nextPage}">Siguiente</Button>
</main>
