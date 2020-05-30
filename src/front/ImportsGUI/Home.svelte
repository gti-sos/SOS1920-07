<script>
    import Button from "sveltestrap/src/Button.svelte";
    import {
        pop
    } from "svelte-spa-router";
</script>

<h2 style="margin-top:10px;"><a href="#/import-table">Tabla importaciones (Jorge)</a></h2>
<Button outline color="secondary" on:click="{pop}"> <i class="fas fa-arrow-circle-left"></i> Atrás </Button>
