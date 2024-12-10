<script>
  let showOrders = false; // Controla si mostramos los pedidos
  let ordersList = []; // Lista de pedidos obtenidos de la API

  // Función para obtener pedidos desde la API
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders'); // Reemplaza con tu endpoint correcto
      if (!response.ok) throw new Error('Error al obtener los pedidos');

      // Procesamos los datos obtenidos
      const data = await response.json();
      ordersList = data.map(order => ({
        ...order,
        products: JSON.parse(order.products), // Deserializar la columna `products`
        total: parseFloat(order.total), // Convertir `total` a número
      }));
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  };

  // Función para mostrar los pedidos
  const displayOrders = async () => {
    await fetchOrders(); // Obtiene los datos desde la API
    showOrders = true; // Cambia el estado para mostrar la tabla
  };
</script>

<h2>Informes de Ventas</h2>

<button on:click={displayOrders}>Mostrar Pedidos Registrados</button>

{#if showOrders}
  <h3>Lista de Pedidos</h3>
  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Productos</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {#each ordersList as order}
        <tr>
          <td>{order.customer}</td>
          <td>{order.products.map(p => p.name).join(', ')}</td>
          <td>{order.total.toFixed(2)}€</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  /* Estilo para la tabla */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  th, td {
    padding: 0.8rem;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #3498db;
    color: white;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #ecf0f1;
  }

  button {
    margin-top: 1rem;
    background-color: #4caf50;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #2980b9;
  }
</style>
