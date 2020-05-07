<script>
	import {
		onMount
	} from "svelte";

	import Table from "sveltestrap/src/Table.svelte";
	import Button from "sveltestrap/src/Button.svelte";

	let limit = 10;
	let offset = 0;
	let up = true;
	let imports = [];
	let newImport = {
		country: "",
		year:0,
		gdamalt:0.0,
		gdabarley:0.0,
		gdaoat:0.0,
		gdawaste:0.0,
		gdaethylalcohol:0.0
	};
	let errorMsg = "";
	let correctMsg = "";
	let search = false;

	onMount(getImports);

	async function getImports() {

		console.log("Fetching contacts...");
		const res = await fetch("/api/v2/imports?offset= "+offset+"&limit="+limit);

		if (res.ok) {
			console.log("Ok:");
			const json = await res.json();
			imports = json;
			search = false;
			if(imports.length < limit){up = false}
			else{up =true};
			console.log("Received " + imports.length + " contacts.");
		} else {
			errorMsg = "Su busqueda no es válida";
            console.log("ERROR!" + errorMsg);
		}
	}

	async function getsearch() {

		let busqueda = "";
		if(newImport.year !=0){busqueda = busqueda + "&year="+newImport.year}; 
		if(newImport.country !=""){busqueda = busqueda + "&country="+newImport.country};
		if(newImport.gdamalt !=0){busqueda = busqueda + "&gdamalt="+newImport.gdamalt};
		if(newImport.gdabarley !=0){busqueda = busqueda + "&gdabarley="+newImport.gdabarley};
		if(newImport.gdaoat !=0){busqueda = busqueda + "&gdaoat="+newImport.gdaoat};
		if(newImport.gdawaste !=0){busqueda = busqueda + "&year="+newImport.gdawaste};
		if(newImport.gdaethylalcohol !=0){busqueda = busqueda + "&year="+newImport.gdaethylalcohol};

		const res = await fetch("/api/v2/imports?offset= "+offset+"&limit="+limit+busqueda);

		if (res.ok) {
			console.log("Ok:");
			const json = await res.json();
			imports = json;
			search = true;
			if(imports.length < limit){up = false}
			else{up =true};
			console.log("Received " + imports.length + " contacts.");
			errorMsg = "";
			correctMsg = ""
		} else {
			errorMsg = "Su busqueda no es válida";
			correctMsg = ""
            console.log("ERROR!" + errorMsg);
		}
	}


	async function insertImport() {

		console.log("Inserting Import..." + JSON.stringify(newImport));
		newImport.year = parseInt(newImport.year);
		newImport.gdamalt= parseFloat(newImport.gdamalt),
        newImport.gdabarley=parseFloat(newImport.gdabarley),
        newImport.gdaoat=parseFloat(newImport.gdaoat),
        newImport.gdawaste=parseFloat(newImport.gdawaste),
		newImport.gdaethylalcohol=parseFloat(newImport.gdaethylalcohol)
		
		const res = await fetch("/api/v2/imports", {
			method: "POST",
			body: JSON.stringify(newImport),
			headers: {
				"Content-Type": "application/json"
			}
		}).then(function (res) {
			if (res.ok) {
				getImports();
				correctMsg = "Se ha insertado el elemento Correctamente";
				errorMsg = "";
			}else{
				errorMsg = "No se pudo insertar el elemento Correctamente";
				correctMsg = ""
			}
		});

	}
	async function deleteImport(country,year) {
		const res = await fetch("/api/v2/imports/" + country +"/"+ year, {
			method: "DELETE"
		}).then(function (res) {
			if (res.ok) {
				getImports();
				correctMsg = "Se ha eliminado la importación con país: "+ country+" y año: " +year ;
			}else{
				errorMsg = "No se pudo eliminar la importación con país: "+ country+" y año: " +year ;;
			}
		});
	}

	async function deleteAllImport() {
		const res = await fetch("/api/v2/imports", {
			method: "DELETE"
		}).then(function (res) {
			if (res.ok) {
				getImports();
				errorMsg = "";
				correctMsg = "Se han eliminado todos los elementos";
			}else{
				errorMsg = "No se pudieron eliminar todos los elementos";
			}
		});
	}

	function offsetUp() {
		offset = offset +limit;
		correctMsg ="";
		errorMsg = "";
		if(search == true){getsearch()}
		else{getImports()};
	}

	function offsetDown() {
		offset = offset -limit;
		errorMsg = "";
		correctMsg = "";
		if(search == true){getsearch()}
		else{getImports()};
	}


</script>

<main>

	{#await imports}
		Loading imports...
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
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><input bind:value="{newImport.country}"></td>
					<td><input bind:value="{newImport.year}"></td>
					<td><input bind:value="{newImport.gdamalt}"></td>
					<td><input bind:value="{newImport.gdabarley}"></td>
					<td><input bind:value="{newImport.gdaoat}"></td>
					<td><input bind:value="{newImport.gdawaste}"></td>
					<td><input bind:value="{newImport.gdaethylalcohol}"></td>
					<td> <Button outline  color="primary" on:click={insertImport}>Insertar</Button>
						<Button outline  color="success" on:click={getsearch}>Busqueda</Button>
					</td>
				</tr>

				{#each imports as imported}
					<tr>
						<td><a href="#/import/{imported.country}/{imported.year}">{imported.country}</a></td>
						<td>{imported.year}</td>
						<td>{imported.gdamalt}</td>
						<td>{imported.gdabarley}</td>
						<td>{imported.gdaoat}</td>
						<td>{imported.gdawaste}</td>
						<td>{imported.gdaethylalcohol}</td>
						<td><Button outline color="danger" on:click="{deleteImport(imported.country,imported.year)}">Borrar</Button></td>
					</tr>
				{/each}
				<tr>
					<td style="text-align: center;" colspan="4">
						{#if offset != 0}
						<Button color="secondary" on:click="{offsetDown}">&lt;</Button>
						{/if}
						{#if up == true}
						<Button color="secondary" on:click="{offsetUp}">&gt;</Button>
						{/if}
					</td>
					<td style="text-align: center;" colspan="2">
						<Button color="success" on:click="{getImports}">Buscar Todo</Button>
					</td>
					<td style="text-align: center;" colspan="2"><Button color="danger" on:click="{deleteAllImport}">Borrar Todo</Button></td>
				</tr>
			</tbody>
		</Table>
	{/await}
	{#if errorMsg}
	<p style="color: red">{errorMsg}</p>
	{/if}
	{#if correctMsg}
	<p style="color: green">{correctMsg}</p>
	{/if}

</main>