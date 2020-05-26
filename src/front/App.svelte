<script>
	import Router from 'svelte-spa-router';

	import ImportsTable from './ImportsGUI/ImportsTable.svelte';
	import EditImport from './ImportsGUI/EditImport.svelte';
	import HomeImport from './ImportsGUI/Home.svelte';
	import GraphImport from './ImportsGUI/Graph.svelte';
	import Graph2Import from './ImportsGUI/Graph2.svelte';

	import NotFound from './NotFound.svelte';
	
	import FoodImportsTable from './foodsImportsGUI/FoodImportsTable.svelte';
	import EditFoodsImports from './foodsImportsGUI/EditFoodsImports.svelte';
	import SearchFoodsImport from './foodsImportsGUI/SearchFoodsImport.svelte';
	import MiGrafica from "./foodsImportsGUI/MiGrafica.svelte";
	import MiGrafica2 from "./foodsImportsGUI/MiGrafica2.svelte";
	
	import FertilizersTable from './fertilizerGUI/FertilizersTable.svelte';
	import EditFertilizer from './fertilizerGUI/EditFertilizer.svelte';
	
	import Home from './Home.svelte';

	const routes = {
		"/": Home,
		"/import/:country/:year": EditImport,
		"/import-table":ImportsTable,
		"/imports-graph": GraphImport,
		"/imports-graph2": Graph2Import,
		"/imports": HomeImport,
		"/foodsImports": FoodImportsTable,
		"/foodsImports/:foodsName/:foodsYear":EditFoodsImports,
		"/foodsImports/SearchFoodsImport/":SearchFoodsImport,
		
		"/foodsImports/MiGrafica/":MiGrafica,
		"/foodsImports/MiGrafica2/":MiGrafica2,
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
