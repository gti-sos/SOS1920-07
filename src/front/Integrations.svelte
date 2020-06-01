<script>
    import Button from "sveltestrap/src/Button.svelte";
</script>
<div>
<h2> </h2>
<Button outline size="lg" color="primary" onclick="location.href='/#/foodsImports/Integrations/';">Integraciones de Juan Antonio</Button>
</div>
<div style='margin-top:50px;'>
    <h2>Integraciones de Jorge</h2>
    <Button outline size="lg" color="secondary" onclick="location.href='/#/imports-graph';" >Gráfica 1(Total)</Button>
    <Button outline size="lg" color="secondary" onclick="location.href='/#/imports-graph2';" >Gráfica 2</Button>
    <Button outline size="lg" color="secondary" onclick="location.href='/#/imports-integrations';" >Integración</Button>
    <Button outline size="lg" color="secondary" onclick="location.href='/#/import-table';" >Tabla Api</Button>
</div>
<div style='margin-top:50px;'>
    <h2>Integraciones de Pablo</h2>
    <Button outline size="lg" color="danger" onclick="location.href='/#/fertilizerImportsExports/MyGraph';" >Gráfica Highchart</Button>
    <Button outline size="lg" color="danger" onclick="location.href='/#/fertilizerImportsExports/MyGraph2';" >Gráfica 2</Button>
    <Button outline size="lg" color="danger" onclick="location.href='/#/fertilizerImportsExports/Integrations';" >Integraciones</Button>
</div>
