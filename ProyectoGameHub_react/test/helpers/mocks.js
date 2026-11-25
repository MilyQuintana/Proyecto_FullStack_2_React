import { PRODUCTS } from "../../src/data/catalog";

/** Mock de localStorage en memoria (aísla cada prueba del almacenamiento real). */
export function mockLocalStorage(initial = {}) {
  const store = { ...initial };
  spyOn(Storage.prototype, "getItem").and.callFake((key) => (key in store ? store[key] : null));
  spyOn(Storage.prototype, "setItem").and.callFake((key, value) => {
    store[key] = String(value);
  });
  spyOn(Storage.prototype, "removeItem").and.callFake((key) => {
    delete store[key];
  });
  return store;
}

export const firstProduct = PRODUCTS.find((product) => product.stock > 1);

export const guestCartKey = "gamehub_carrito_invitado";
export const customer = { id: 42, token: "token-cliente", rol: "CLIENTE" };
export const customerCartKey = `gamehub_carrito_usuario_${customer.id}`;
export const testCoupon = { codigo: "GAMER10", porcentaje: 10, tope: 50000 };

export function makeOrder(overrides = {}) {
  return {
    id: 123,
    fecha: "2026-11-24T12:00:00",
    estado: "PAGADA",
    total: 1000,
    usuarioNombre: "Ana Pérez",
    usuarioEmail: "ana@example.test",
    detalles: [{
      id: 1,
      productoId: firstProduct.id,
      productoNombre: firstProduct.name,
      cantidad: 1,
      subtotal: 1000,
    }],
    ...overrides,
  };
}
