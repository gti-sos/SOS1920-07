<script>
	import Router from 'svelte-spa-router';

	import ImportsTable from './ImportsGUI/ImportsTable.svelte';
	import EditImport from './ImportsGUI/EditImport.svelte';
	import HomeImport from './ImportsGUI/Home.svelte';
	import GraphImport from './ImportsGUI/Graph.svelte';
	import Graph2Import from './ImportsGUI/Graph2.svelte';
	import ImportsIntegrations from './ImportsGUI/Integrations.svelte';

	import NotFound from './NotFound.svelte';
	
	import FoodImportsTable from './foodsImportsGUI/FoodImportsTable.svelte';
	import EditFoodsImports from './foodsImportsGUI/EditFoodsImports.svelte';
	import SearchFoodsImport from './foodsImportsGUI/SearchFoodsImport.svelte';
	import MiGrafica from "./foodsImportsGUI/MiGrafica.svelte";
	import MiGrafica2 from "./foodsImportsGUI/MiGrafica2.svelte";
	import foodIntegrations from "./foodsImportsGUI/Integrations.svelte";
	import externalApis from "./foodsImportsGUI/externalapi.svelte";
	import externalApis1 from "./foodsImportsGUI/externalapi1.svelte";
	import about from "./about.svelte";
	

	import FertilizersTable from './fertilizerGUI/FertilizersTable.svelte';
	import EditFertilizer from './fertilizerGUI/EditFertilizer.svelte';
	import MyGraph from './fertilizerGUI/MyGraph.svelte';
	import MyGraph2 from './fertilizerGUI/MyGraph2.svelte';
	import FertilizerIntegrations from './fertilizerGUI/Integrations.svelte';
	import FertilizerIntegrations2 from './fertilizerGUI/Integrations2.svelte';
	import FertilizerIntegrations3 from './fertilizerGUI/Integrations3.svelte';
	import FertilizerIntegrations4 from './fertilizerGUI/Integrations4.svelte';
	import FertilizerIntegrations5 from './fertilizerGUI/Integrations5.svelte';
	import FertilizerIntegrations6 from './fertilizerGUI/Integrations6.svelte';
	import FertilizerIntegrations7 from './fertilizerGUI/Integrations7.svelte';
	import FertilizerIntegrations8 from './fertilizerGUI/Integrations8.svelte';
	import FertilizerIntegrations9 from './fertilizerGUI/Integrations9.svelte';
	import FertilizerIntegrations10 from './fertilizerGUI/Integrations10.svelte';
	
	import Home from './Home.svelte';
	import GUIIMPORTS from './ImportsGUI/Home.svelte';
	import graficagrupal from "./analitics.svelte";
	import Integrations from "./Integrations.svelte";

	const routes = {
		"/": Home,
		"/import/:country/:year": EditImport,
		"/import-table":ImportsTable,
		"/imports-graph": GraphImport,
		"/imports-graph2": Graph2Import,
		"/imports-integrations": ImportsIntegrations,
		"/imports": HomeImport,
		"/foodsImports": FoodImportsTable,
		"/foodsImports/:foodsName/:foodsYear":EditFoodsImports,
		"/foodsImports/SearchFoodsImport/":SearchFoodsImport,
		"/foodsImports/MiGrafica/":MiGrafica,
		"/foodsImports/MiGrafica2/":MiGrafica2,
		"/foodsImports/Integrations/":foodIntegrations,
		"/foodsImports/externalapi/":externalApis,
		"/foodsImports/externalapi1/":externalApis1,
		"/analitics":graficagrupal,
		"/Integrations":Integrations,
		"/about":about,
		
		
		"/importsgui": GUIIMPORTS,
		"/fertilizerImportsExports": FertilizersTable,
		"/fertilizerImportsExports/:country/:year":EditFertilizer,
		"/fertilizerImportsExports/MyGraph":MyGraph,
		"/fertilizerImportsExports/MyGraph2":MyGraph2,
		"/fertilizerImportsExports/Integrations":FertilizerIntegrations,
		"/fertilizerImportsExports/Integrations2":FertilizerIntegrations2,
		"/fertilizerImportsExports/Integrations3":FertilizerIntegrations3,
		"/fertilizerImportsExports/Integrations4":FertilizerIntegrations4,
		"/fertilizerImportsExports/Integrations5":FertilizerIntegrations5,
		"/fertilizerImportsExports/Integrations6":FertilizerIntegrations6,
		"/fertilizerImportsExports/Integrations7":FertilizerIntegrations7,
		"/fertilizerImportsExports/Integrations8":FertilizerIntegrations8,
		"/fertilizerImportsExports/Integrations9":FertilizerIntegrations9,
		"/fertilizerImportsExports/Integrations10":FertilizerIntegrations10,
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
