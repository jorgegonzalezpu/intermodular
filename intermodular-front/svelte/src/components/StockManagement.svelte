<script>
  let stockList = []; // Lista completa de productos
  let currentPage = 1; // Página actual
  const itemsPerPage = 8; // Máximo de productos por página

  // Base URL del servidor
  const baseURL = 'http://localhost:3000';

  // Función para obtener productos desde la API
  const fetchStock = async () => {
    try {
      const response = await fetch(`${baseURL}/products`);
      if (!response.ok) throw new Error('Error al obtener los productos');
      stockList = await response.json(); // Asigna los datos obtenidos
    } catch (error) {
      console.error('Error al cargar el inventario:', error);
    }
  };

  // Obtener productos para la página actual
  $: paginatedProducts = stockList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Total de páginas
  $: totalPages = Math.ceil(stockList.length / itemsPerPage);

  // Cambiar a una página específica
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  };

  fetchStock();
</script>

<h2>Gestión de Inventario</h2>

<h3>Productos en Inventario</h3>
<div class="product-grid">
  {#each paginatedProducts as product}
    <div class="product-card">
      <div class="image-container">
        <img 
          src={`${baseURL}${product.image_url}`} 
          alt={product.name} 
          class="product-image" 
        />
      </div>
      <h4>{product.name}</h4>
      <p>Precio: {product.price}€</p>
      <p>Stock: {product.stock} unidades</p>
    </div>
  {/each}
</div>

<!-- Controles de paginación -->
<div class="pagination">
  <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
    &laquo; Anterior
  </button>
  {#each Array(totalPages).fill(0).map((_, i) => i + 1) as page}
    <button 
      class="{page === currentPage ? 'active' : ''}" 
      on:click={() => goToPage(page)}>
      {page}
    </button>
  {/each}
  <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
    Siguiente &raquo;
  </button>
</div>

<style>
  /* Estilo para la cuadrícula de productos */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Siempre 4 columnas */
    gap: 20px;
    margin-top: 20px;
  }

  /* Tarjeta individual */
  .product-card {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  /* Contenedor para la imagen (uniforme) */
  .image-container {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  /* Imagen del producto */
  .product-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  /* Título del producto */
  .product-card h4 {
    margin: 10px 0;
    font-size: 18px;
    font-weight: bold;
  }

  /* Información adicional del producto */
  .product-card p {
    margin: 5px 0;
    color: #555;
  }

  /* Controles de paginación */
  .pagination {
    position: fixed; /* Mantener siempre visible */
    bottom: 0; /* Fijado en la parte inferior */
    left: 0;
    width: 100%;
    padding: 10px 0;
    background-color: #f8f8f8;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    gap: 10px;
    z-index: 1000; /* Asegurarse de que esté encima de otros elementos */
  }

  .pagination button {
    padding: 10px 15px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }


</style>
