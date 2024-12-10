<script>
  // @ts-nocheck
  
    import { products } from '../store/store.js';
  
    let newProduct = { name: '', price: 0, stock: 0, image_url: '' };
    let editProduct = null;
    let showModal = false;
    let showSuccessModal = false; // Modal de éxito
    let isEditing = false;
    let selectedFile = null; // Archivo seleccionado
  
    $: currentProduct = isEditing ? editProduct : newProduct;
  
    const fetchProducts = async () => {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      products.set(data);
    };
  
    const openEditModal = (product) => {
      editProduct = { ...product };
      isEditing = true;
      showModal = true;
    };
  
    const openAddModal = () => {
      newProduct = { name: '', price: 0, stock: 0, image_url: '' };
      isEditing = false;
      showModal = true;
    };
  
    const uploadImage = async () => {
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Error al subir la imagen');
      const data = await response.json();
      return data.imageUrl; // Devuelve la URL de la imagen
    };
  
    const addProduct = async () => {
      if (newProduct.name && newProduct.price > 0 && newProduct.stock >= 0) {
        try {
          if (selectedFile) {
            newProduct.image_url = await uploadImage();
          }
          const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
          });
          const addedProduct = await response.json();
          products.update(current => [...current, addedProduct]);
          showModal = false;
  
          // Mostrar modal de éxito
          showSuccessModal = true;
        } catch (error) {
          console.error('Error al registrar el producto:', error);
        }
      }
    };
  
    const updateProduct = async () => {
      if (selectedFile) {
        editProduct.image_url = await uploadImage();
      }
      const response = await fetch(`http://localhost:3000/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (response.ok) {
        products.update(current =>
          current.map(p => (p.id === editProduct.id ? editProduct : p))
        );
        showModal = false;
        editProduct = null;
      }
    };
  
    const deleteProduct = async (id) => {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        products.update(current => current.filter(p => p.id !== id));
      }
    };
  
    fetchProducts();
  </script>
  
  <h2>Gestión de Productos</h2>
  
  <!-- Botón para añadir producto -->
  <button class="button add" on:click={openAddModal}>Añadir Producto</button>
  
  <!-- Lista de productos en 4 columnas -->
  <h3>Lista de Productos</h3>
  <div class="product-grid">
    {#each $products as product (product.id)}
      <div class="product-card">
        <h4>{product.name}</h4>
        <p>Precio: {product.price}€</p>
        <p>Stock: {product.stock} unidades</p>
        <div class="actions">
          <button class="button edit" on:click={() => openEditModal(product)}>Editar</button>
          <button class="button delete" on:click={() => deleteProduct(product.id)}>Eliminar</button>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Modal para añadir o editar producto -->
  {#if showModal}
    <div class="modal">
      <div class="modal-content">
        <h3>{isEditing ? 'Editar Producto' : 'Añadir Producto'}</h3>
        <form>
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Nombre</label>
          <input bind:value={currentProduct.name} placeholder="Nombre" />
  
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Precio (€)</label>
          <input type="number" bind:value={currentProduct.price} placeholder="Precio" />
  
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Stock</label>
          <input type="number" bind:value={currentProduct.stock} placeholder="Stock" />
  
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Seleccionar Imagen</label>
          <input type="file" on:change={(e) => (selectedFile = e.target.files[0])} />
  
          <div class="modal-actions">
            {#if isEditing}
              <button type="button" class="button update" on:click={updateProduct}>Guardar Cambios</button>
            {:else}
              <button type="button" class="button add" on:click={addProduct}>Guardar</button>
            {/if}
            <button type="button" class="button cancel" on:click={() => (showModal = false)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
  <!-- Modal de éxito -->
  {#if showSuccessModal}
    <div class="modal">
      <div class="modal-content">
        <h3>Producto registrado correctamente</h3>
        <button class="button close" on:click={() => (showSuccessModal = false)}>Cerrar</button>
      </div>
    </div>
  {/if}
  

<style>
  /* Estilo para la cuadrícula de productos */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Siempre 4 columnas */
    gap: 20px;
    margin-top: 20px;
  }

  /* Tarjeta de producto */
  .product-card {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 250px;
  }

  .product-card h4 {
    margin: 10px 0;
    font-size: 18px;
    font-weight: bold;
  }

  .product-card p {
    margin: 5px 0;
    color: #555;
  }

  .actions {
    margin-top: 10px;
    display: flex;
    justify-content: space-around;
  }

  /* Botones */
  .button {
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.3s ease;
  }

  .button.add {
    background-color: #4caf50;
    color: white;
  }

  .button.edit {
    background-color: #ffa726;
    color: white;
  }

  .button.delete {
    background-color: #e53935;
    color: white;
  }

  .button.cancel {
    background-color: #f44336;
    color: white;
  }

  .button.update {
    background-color: #2196f3;
    color: white;
  }

  .button:hover {
    opacity: 0.8;
  }

  /* Modal */
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
    background: rgb(255, 255, 255);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    width: 300px;
  }

  .modal-content label {
    font-weight: bold;
    display: block;
    margin: 10px 0 5px;
  }

  .modal-content input {
    padding: 10px;
    font-size: 16px;
    width: 90%;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
  }
</style>
