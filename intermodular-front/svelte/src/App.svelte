<script>
    import './app.css'; /* Importamos los estilos globales */

  import ProductManagement from './components/ProductManagement.svelte';
  import OrderManagement from './components/OrderManagement.svelte';
  import SalesReport from './components/SalesReport.svelte';
  import StockManagement from './components/StockManagement.svelte';
  import ReportPdfExcel from './components/ReportPDF_Excel.svelte';
  import Grafica from './components/Grafica.svelte';

  let activeSection = 'productos'; // Por defecto, la sección activa es 'productos'
</script>

<!-- Barra de navegación -->
<nav>
  <a href="#productos" on:click={() => activeSection = 'productos'}>Productos</a>
  <a href="#pedidos" on:click={() => activeSection = 'pedidos'}>Pedidos</a>
  <a href="#informes" on:click={() => activeSection = 'informes'}>Informes</a>
  <a href="#inventario" on:click={() => activeSection = 'inventario'}>Inventario</a>
  <a href="#pdf" on:click={() => activeSection = 'pdfExcel'}>Generar PDF</a>
  <a href="#Grafica" on:click={() => activeSection = 'Grafica'}>Grafica</a>
</nav>

<main>
  

  <!-- Sección de productos -->
  {#if activeSection === 'productos'}
    <ProductManagement />
  {/if}

  <!-- Sección de pedidos -->
  {#if activeSection === 'pedidos'}
    <OrderManagement />
  {/if}

  <!-- Sección de informes -->
  {#if activeSection === 'informes'}
    <SalesReport />
  {/if}

  <!-- Sección de inventario -->
  {#if activeSection === 'inventario'}
    <StockManagement />
  {/if}

  <!-- Sección para generar PDF -->
  {#if activeSection === 'pdfExcel'}
    <ReportPdfExcel />
  {/if}

    <!-- Sección para Grafica -->
    {#if activeSection === 'Grafica'}
    <Grafica />
  {/if}
</main>
