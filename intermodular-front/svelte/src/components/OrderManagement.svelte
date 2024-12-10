<script>
  // @ts-nocheck
  
    import { orders, products } from '../store/store.js';
  
    let newOrder = { customer: '', products: [], total: 0 };
    let selectedProduct = null; // Producto seleccionado
    let quantity = 1; // Cantidad de producto seleccionada
    let showOrderModal = false; // Modal para registrar pedido
    let showQuantityModal = false; // Modal para cantidad
    let showSuccessModal = false; // Modal de éxito
    let editingProduct = null; // Producto que está siendo editado
  
    // Obtener productos desde la API
    const fetchProducts = async () => {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      products.set(data);
    };
  
    // Abrir modal para registrar pedido
    const openOrderModal = () => {
      newOrder = { customer: '', products: [], total: 0 }; // Reinicia el pedido
      showOrderModal = true;
    };
  
    // Seleccionar producto
    const selectProduct = (product) => {
      if (!product) return;
      selectedProduct = product;
      quantity = 1;
      showQuantityModal = true;
    };
  
    // Confirmar producto con cantidad
    const confirmProduct = () => {
      if (quantity > selectedProduct.stock) {
        alert('No puedes añadir más cantidad de la disponible en el stock.');
        return;
      }
  
      const existingProduct = newOrder.products.find(p => p.id === selectedProduct.id);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        newOrder.products.push({ ...selectedProduct, quantity });
      }
      newOrder.total += selectedProduct.price * quantity;
      showQuantityModal = false; // Ocultar modal de cantidad
    };
  
    // Editar cantidad de un producto en el pedido
    const editProduct = (product) => {
      editingProduct = product;
      quantity = product.quantity;
      showQuantityModal = true;
    };
  
    // Confirmar actualización de cantidad
    const updateQuantity = () => {
      if (quantity > editingProduct.stock) {
        alert('No puedes añadir más cantidad de la disponible en el stock.');
        return;
      }
  
      const productInOrder = newOrder.products.find(p => p.id === editingProduct.id);
      if (productInOrder) {
        newOrder.total -= productInOrder.price * productInOrder.quantity; // Resta el total anterior
        productInOrder.quantity = quantity; // Actualiza la cantidad
        newOrder.total += productInOrder.price * productInOrder.quantity; // Suma el nuevo total
      }
      showQuantityModal = false; // Ocultar modal de cantidad
    };
  
    // Registrar pedido
    const addOrder = async () => {
      if (newOrder.customer && newOrder.products.length > 0) {
        try {
          const orderPayload = {
            customer: newOrder.customer,
            products: newOrder.products.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              quantity: p.quantity,
            })),
            total: newOrder.total,
          };
  
          // Guardar el pedido en la API
          const response = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
          });
  
          if (!response.ok) throw new Error('Error al registrar el pedido');
  
          // Actualizar el stock de los productos
          await updateStock(orderPayload.products);
  
          // Mostrar modal de éxito
          showSuccessModal = true;
  
          // Cerrar modal y reiniciar el pedido
          showOrderModal = false;
          fetchProducts(); // Recargar productos
        } catch (error) {
          console.error('Error al registrar el pedido:', error);
        }
      } else {
        alert('Por favor, completa todos los campos antes de registrar el pedido.');
      }
    };
  
    // Actualizar stock de productos en la API
    const updateStock = async (products) => {
      try {
        const response = await fetch('http://localhost:3000/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products }),
        });
  
        if (!response.ok) throw new Error('Error al actualizar el stock');
      } catch (error) {
        console.error('Error al actualizar el stock:', error);
      }
    };
  
    fetchProducts();
  </script>
  
  <h2>Gestión de Pedidos</h2>
  
  <!-- Botón para registrar pedido -->
  <button class="button add" on:click={openOrderModal}>Registrar Nuevo Pedido</button>
  
  <!-- Modal para registrar pedido -->
  {#if showOrderModal}
    <div class="modal">
      <div class="modal-content">
        <h3>Registrar Nuevo Pedido</h3>
  
        <!-- Input para el nombre del cliente -->
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label>Nombre del Cliente</label>
        <input type="text" bind:value={newOrder.customer} placeholder="Ingrese el nombre del cliente" class="input-field" />
  
        <!-- Select para elegir un producto -->
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label>Seleccionar Producto</label>
        <select 
          on:change={(e) => selectProduct($products.find(p => p.id == e.target.value))}
          class="input-field"
        >
          <option value="" selected disabled>Seleccione un producto</option>
          {#each $products as product}
            <option value={product.id}>{product.name} - {product.price}€ ({product.stock} disponibles)</option>
          {/each}
        </select>
  
        <!-- Productos añadidos al pedido -->
        <h4>Productos en el Pedido</h4>
        <ul>
          {#each newOrder.products as product}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li on:click={() => editProduct(product)}>
              {product.name} - {product.quantity} unidades
            </li>
          {/each}
        </ul>
  
        <div class="modal-actions">
          <button class="button add" on:click={addOrder}>Registrar Pedido</button>
          <button class="button cancel" on:click={() => (showOrderModal = false)}>Cancelar</button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Modal para cantidad -->
  {#if showQuantityModal}
    <div class="modal">
      <div class="modal-content">
        <h3>{editingProduct ? `Actualizar ${editingProduct.name}` : `Añadir ${selectedProduct.name}`}</h3>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label>Cantidad:</label>
        <input type="number" min="1" max={editingProduct ? editingProduct.stock : selectedProduct.stock} bind:value={quantity} class="input-field" />
        <div class="modal-actions">
          {#if editingProduct}
            <button class="button add" on:click={updateQuantity}>Actualizar</button>
          {:else}
            <button class="button add" on:click={confirmProduct}>Confirmar</button>
          {/if}
          <button class="button cancel" on:click={() => (showQuantityModal = false)}>Cancelar</button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Modal de éxito -->
  {#if showSuccessModal}
    <div class="modal">
      <div class="modal-content">
        <h3>Pedido registrado correctamente</h3>
        <button class="button close" on:click={() => (showSuccessModal = false)}>Cerrar</button>
      </div>
    </div>
  {/if}
  

<style>
  /* Estilos de botones */
  .button {
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px;
  }

  .button.add {
    background-color: #4caf50;
    color: white;
  }

  .button.cancel {
    background-color: #f44336;
    color: white;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    width: 300px;
  }

  .input-field {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
  }



  ul {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }

  li {
    cursor: pointer;
    padding: 5px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
    text-align: left;
  }

  li:hover {
    background-color: #eaeaea;
  }
</style>
