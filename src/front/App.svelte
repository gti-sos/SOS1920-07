<script>
	import Router from 'svelte-spa-router';

	import ImportsTable from './ImportsGUI/ImportsTable.svelte';
	import EditImport from './ImportsGUI/EditImport.svelte';

	import NotFound from './NotFound.svelte';

	import Home from './Home.svelte';
	import GUIIMPORTS from './ImportsGUI/Home.svelte';

	const routes = {
		"/": Home,
		"/import/:country/:year": EditImport,
		"/import":ImportsTable,
		"/importsgui": GUIIMPORTS,
		"*": NotFound
	};
</script>

<main>
	<h1>Apis del Grupo 7 SOS</h1>
	<Router {routes} />
</main>
