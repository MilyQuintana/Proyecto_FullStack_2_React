const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || body?.message || "No fue posible completar la solicitud.");
  return body;
}

function toProduct(product) {
  return {
    id: product.id,
    name: product.nombre,
    brand: product.marca || "",
    model: product.modelo || "",
    regularPrice: product.precio,
    stock: product.stock,
    categoryId: product.categoriaId,
    category: product.categoriaNombre,
    description: product.descripcion || "",
    image: product.imagen || "/img/productos/placeholder.png",
    images: product.imagen ? [product.imagen] : [],
  };
}

export const gamehubApi = {
  productos: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.set("categoriaId", filtros.categoriaId);
    if (filtros.marca) params.set("marca", filtros.marca);
    return request(`/productos${params.size ? `?${params}` : ""}`).then((items) => items.map(toProduct));
  },
  producto: (id) => request(`/productos/${id}`).then(toProduct),
  categorias: () => request("/categorias"),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  registro: (nombre, email, password, telefono, direccion) => request("/auth/register", { method: "POST", body: JSON.stringify({ nombre, email, password, telefono, direccion }) }),
  crearBoleta: (items, token, codigoCupon) => request("/boletas", { method: "POST", token, body: JSON.stringify({ items, codigoCupon: codigoCupon || null }) }),
  crearCupon: (cupon, token) => request("/cupones", { method: "POST", token, body: JSON.stringify(cupon) }),
  cupones: (token) => request("/cupones", { token }),
  validarCupon: (codigo, token) => request(`/cupones/validar?codigo=${encodeURIComponent(codigo)}`, { token }),
  cambiarEstadoCupon: (id, activo, token) => request(`/cupones/${id}/estado?activo=${activo}`, { method: "PATCH", token }),
  eliminarCupon: (id, token) => request(`/cupones/${id}`, { method: "DELETE", token }),
  misCompras: (token) => request("/boletas/mis-compras", { token }),
  boletas: (token) => request("/boletas", { token }),
  marcarEntregada: (id, token) => request(`/boletas/${id}/entregar`, { method: "POST", token }),
  crearProducto: (producto, token) => request("/productos", { method: "POST", token, body: JSON.stringify(producto) }),
  actualizarProducto: (id, producto, token) => request(`/productos/${id}`, { method: "PUT", token, body: JSON.stringify(producto) }),
  eliminarProducto: (id, token) => request(`/productos/${id}`, { method: "DELETE", token }),
};
