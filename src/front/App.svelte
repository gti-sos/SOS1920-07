<script>
	import Router from 'svelte-spa-router';

	import ImportsTable from './ImportsGUI/ImportsTable.svelte';
	import EditImport from './ImportsGUI/EditImport.svelte';

	import NotFound from './NotFound.svelte';
	
	import FoodImportsTable from './foodsImportsGUI/FoodImportsTable.svelte';
	import EditFoodsImports from './foodsImportsGUI/EditFoodsImports.svelte';
	import SearchFoodsImport from './foodsImportsGUI/SearchFoodsImport.svelte';
	
	import FertilizersTable from './fertilizerGUI/FertilizersTable.svelte';
	import EditFertilizer from './fertilizerGUI/EditFertilizer.svelte';
	
	import Home from './Home.svelte';
	import GUIIMPORTS from './ImportsGUI/Home.svelte';

	const routes = {
		"/": Home,
		"/import/:country/:year": EditImport,
		"/import":ImportsTable,
		"/foodsImports": FoodImportsTable,
		"/foodsImports/:foodsName/:foodsYear":EditFoodsImports,
		"/foodsImports/SearchFoodsImport/":SearchFoodsImport,
		"/importsgui": GUIIMPORTS,
		"/fertilizerImportsExports": FertilizersTable,
		"/fertilizerImportsExports/:country/:year":EditFertilizer,
		"*": NotFound
	};
</script>

<main>
	<h1>Apis del Grupo 7 SOS</h1>
	<Router {routes} />
</main>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1.a {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
