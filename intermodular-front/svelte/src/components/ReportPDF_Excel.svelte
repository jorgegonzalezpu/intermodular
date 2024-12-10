<script>
  import jsPDF from 'jspdf'; // Para generar PDFs
  import * as XLSX from 'xlsx'; // Para generar Excel
  import { writable } from 'svelte/store';

  // Store local para manejar los pedidos en este componente
  const orders = writable([]);
  let ordersList = []; // Variable para almacenar los pedidos obtenidos

  // Función para obtener pedidos desde la API
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders'); // Reemplaza con tu endpoint correcto
      if (!response.ok) throw new Error('Error al obtener los pedidos');

      // Procesar los datos recibidos
      const data = await response.json();
      ordersList = data.map(order => ({
        ...order,
        products: JSON.parse(order.products), // Deserializar la columna `products`
        total: parseFloat(order.total), // Asegurar que el total sea un número
      }));
      orders.set(ordersList); // Actualizar el store
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  };

  // Llama a la función para cargar los pedidos al cargar el componente
  fetchOrders();

  // Función para generar un archivo PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte de Pedidos Registrados', 10, 10);

    // Encabezados de la tabla
    let startY = 20;
    doc.setFontSize(12);
    doc.text('Cliente', 10, startY);
    doc.text('Productos', 60, startY);
    doc.text('Total', 160, startY);

    // Datos de los pedidos
    ordersList.forEach((order) => {
      startY += 10;
      doc.text(order.customer, 10, startY);
      doc.text(order.products.map(p => p.name).join(', '), 60, startY); // Ahora es un array válido
      doc.text(`${order.total.toFixed(2)}€`, 160, startY);
    });

    // Descargar el PDF
    doc.save('reporte_pedidos.pdf');
  };

  // Función para generar un archivo Excel
  const generateExcel = () => {
    // Convertir los datos de los pedidos a formato Excel
    const worksheet = XLSX.utils.json_to_sheet(
      ordersList.map(order => ({
        Cliente: order.customer,
        Productos: order.products.map(p => p.name).join(', '),
        Total: order.total.toFixed(2)
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, 'reporte_pedidos.xlsx');
  };
</script>

<h2>Generar Reportes</h2>

<button on:click={generatePDF}>Generar PDF</button>
<button on:click={generateExcel}>Generar Excel</button>

<style>
  button {
    margin: 1rem 0.5rem;
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

  h2 {
    margin-bottom: 1rem;
  }
</style>
