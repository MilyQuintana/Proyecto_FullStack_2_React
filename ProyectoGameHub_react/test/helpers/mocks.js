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

export function makeOrder(overrides = {}) {
  return {
    numero: "GH-00000001",
    fecha: new Date().toISOString().slice(0, 10),
    estado: "Pagada",
    total: 1000,
    subtotal: 1000,
    descuento: 0,
    pago: { metodo: "tarjeta-credito", estado: "Aprobado" },
    despacho: { estado: "En preparación", nombre: "Ana", correo: "a@a.cl", telefono: "+56912345678", region: "valparaiso", comuna: "Viña", direccion: "Calle 1" },
    productos: [{ id: firstProduct.id, nombre: firstProduct.name, cantidad: 1, subtotal: 1000, resenada: false }],
    ...overrides,
  };
}
