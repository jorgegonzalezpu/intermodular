<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { products } from '../store/store.js';
  
    let productData = []; // Datos de productos
    let chart; // Referencia al gráfico
    let chartContainer; // Contenedor del gráfico
  
    // Obtener productos desde la API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        productData = data.map((product) => ({
          name: product.name,
          price: product.price,
          stock: product.stock,
        }));
        createChart(); // Crear el gráfico después de obtener los datos
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
  
    // Crear el gráfico
    const createChart = () => {
      if (chart) {
        chart.destroy(); // Destruye el gráfico anterior si existe
      }
  
      chart = new Chart(chartContainer, {
        type: 'bar',
        data: {
          labels: productData.map((p) => p.name), // Nombres de los productos
          datasets: [
            {
              label: 'Precio (€)',
              data: productData.map((p) => p.price),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
              label: 'Stock',
              data: productData.map((p) => p.stock),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    };
  
    // Cargar datos al montar el componente
    onMount(() => {
      fetchProducts();
    });
  </script>
  
  <div class="chart-container">
    <canvas bind:this={chartContainer}></canvas>
  </div>
  
  <style>
    .chart-container {
      width: 900px;
      height: 400px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
  