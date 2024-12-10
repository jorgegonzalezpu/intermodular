import { writable } from 'svelte/store';

// Stores para productos y pedidos
export const products = writable([]);
export const orders = writable([]);
