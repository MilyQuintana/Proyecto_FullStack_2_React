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

export const gamehubApi = {
  productos: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.set("categoriaId", filtros.categoriaId);
    if (filtros.marca) params.set("marca", filtros.marca);
    return request(`/productos${params.size ? `?${params}` : ""}`);
  },
  producto: (id) => request(`/productos/${id}`),
  categorias: () => request("/categorias"),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  registro: (nombre, email, password, telefono, direccion) => request("/auth/register", { method: "POST", body: JSON.stringify({ nombre, email, password, telefono, direccion }) }),
  crearBoleta: (items, token) => request("/boletas", { method: "POST", token, body: JSON.stringify({ items }) }),
  misCompras: (token) => request("/boletas/mis-compras", { token }),
};
