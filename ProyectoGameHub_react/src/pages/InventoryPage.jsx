import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { gamehubApi } from "../services/gamehubApi";
import { formatCLP } from "../utils/format";

const emptyProduct = { nombre: "", marca: "", modelo: "", precio: "", stock: "", categoriaId: "", descripcion: "", imagen: "", estado: true };
const emptyCoupon = { codigo: "", porcentaje: "", tope: "", expiraEn: "" };

export default function InventoryPage() {
  const { token } = useAuth();
  const { products, categories, refresh } = useCatalog();
  const [form, setForm] = useState(emptyProduct);
  const [coupon, setCoupon] = useState(emptyCoupon);
  const [editing, setEditing] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCoupons = async () => {
    try { setCoupons(await gamehubApi.cupones(token)); }
    catch (cause) { setError(cause.message || "No fue posible cargar los cupones."); }
  };
  useEffect(() => { loadCoupons(); }, [token]);
  const changeProduct = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }));
  const changeCoupon = (field) => (event) => setCoupon((value) => ({ ...value, [field]: event.target.value }));
  const saveProduct = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock), categoriaId: Number(form.categoriaId), estado: true };
    try {
      if (editing) await gamehubApi.actualizarProducto(editing, payload, token); else await gamehubApi.crearProducto(payload, token);
      await refresh(); setForm(emptyProduct); setEditing(null); setMessage(editing ? "Producto actualizado." : "Producto creado.");
    } catch (cause) { setError(cause.message || "No fue posible guardar el producto."); }
  };
  const editProduct = (product) => {
    setEditing(product.id);
    setForm({ nombre: product.name, marca: product.brand, modelo: product.model, precio: product.regularPrice, stock: product.stock, categoriaId: String(product.categoryId), descripcion: product.description, imagen: product.image, estado: true });
    window.scrollTo(0, 0);
  };
  const createCoupon = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    try {
      await gamehubApi.crearCupon({ ...coupon, codigo: coupon.codigo.trim().toUpperCase(), porcentaje: Number(coupon.porcentaje), tope: coupon.tope ? Number(coupon.tope) : null, activo: true, expiraEn: `${coupon.expiraEn}:00` }, token);
      setCoupon(emptyCoupon); await loadCoupons(); setMessage("Cupón creado correctamente.");
    } catch (cause) { setError(cause.message || "No fue posible crear el cupón."); }
  };
  const toggleCoupon = async (item) => {
    setError(""); setMessage("");
    try { await gamehubApi.cambiarEstadoCupon(item.id, !item.activo, token); await loadCoupons(); setMessage(`Cupón ${item.activo ? "desactivado" : "activado"}.`); }
    catch (cause) { setError(cause.message || "No fue posible cambiar el estado del cupón."); }
  };
  const deleteCoupon = async (item) => {
    if (!window.confirm(`¿Desactivar el cupón ${item.codigo}? Podrás activarlo nuevamente después.`)) return;
    try { await gamehubApi.eliminarCupon(item.id, token); await loadCoupons(); setMessage("Cupón desactivado."); }
    catch (cause) { setError(cause.message || "No fue posible desactivar el cupón."); }
  };
  const deleteProduct = async (product) => {
    if (!window.confirm(`¿Quitar ${product.name} del catálogo? No se borrará de compras históricas.`)) return;
    try { await gamehubApi.eliminarProducto(product.id, token); await refresh(); setMessage("Producto desactivado y quitado del catálogo."); }
    catch (cause) { setError(cause.message || "No fue posible desactivar el producto."); }
  };
  return <section className="container py-4"><h1 className="h2">Inventario</h1>
    {error && <p className="alert alert-danger">{error}</p>}{message && <p className="alert alert-success">{message}</p>}
    <form className="card card-body mb-4" onSubmit={saveProduct}><h2 className="h5">{editing ? "Editar producto" : "Nuevo producto"}</h2><div className="row g-2">{[["nombre", "Nombre"], ["marca", "Marca"], ["modelo", "Modelo"], ["precio", "Precio"], ["stock", "Stock"], ["imagen", "Ruta de imagen"]].map(([field, label]) => <div className="col-md-4" key={field}><label className="form-label">{label}</label><input required={field !== "imagen"} type={field === "precio" || field === "stock" ? "number" : "text"} min="0" className="form-control" value={form[field]} onChange={changeProduct(field)} /></div>)}<div className="col-md-4"><label className="form-label">Categoría</label><select required className="form-select" value={form.categoriaId} onChange={changeProduct("categoriaId")}><option value="">Selecciona</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select></div></div><button className="btn btn-primary mt-3">Guardar</button>{editing && <button type="button" className="btn btn-outline-light mt-3 ms-2" onClick={() => { setEditing(null); setForm(emptyProduct); }}>Cancelar</button>}</form>
    <form className="card card-body mb-4" onSubmit={createCoupon}><h2 className="h5">Nuevo cupón</h2><div className="row g-2">{[["codigo", "Código", "text"], ["porcentaje", "Descuento (%)", "number"], ["tope", "Tope en $ (opcional)", "number"], ["expiraEn", "Expira", "datetime-local"]].map(([field, label, type]) => <div className="col-md-3" key={field}><label className="form-label">{label}</label><input required={field !== "tope"} type={type} min={type === "number" ? "0" : undefined} className="form-control" value={coupon[field]} onChange={changeCoupon(field)} /></div>)}</div><button className="btn btn-primary mt-3">Crear cupón</button></form>
    <h2 className="h4">Cupones creados</h2><div className="table-responsive mb-4"><table className="table"><thead><tr><th>Código</th><th>Descuento</th><th>Expira</th><th>Estado</th><th /></tr></thead><tbody>{coupons.map((item) => <tr key={item.id}><td>{item.codigo}</td><td>{item.porcentaje}%{item.tope ? ` (tope ${formatCLP(item.tope)})` : ""}</td><td>{new Date(item.expiraEn).toLocaleString("es-CL")}</td><td><button type="button" className={`btn btn-sm ${item.activo ? "btn-success" : "btn-outline-secondary"}`} onClick={() => toggleCoupon(item)}>{item.activo ? "Activo" : "Inactivo"}</button></td><td><button type="button" className="btn btn-danger btn-sm" onClick={() => deleteCoupon(item)}>🗑 Eliminar</button></td></tr>)}</tbody></table>{!coupons.length && <p>No hay cupones creados.</p>}</div>
    <h2 className="h4">Productos</h2><div className="table-responsive"><table className="table"><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{formatCLP(product.regularPrice)}</td><td>{product.stock}</td><td><button type="button" className="btn btn-outline-light btn-sm me-2" onClick={() => editProduct(product)}>Editar</button><button type="button" className="btn btn-danger btn-sm" onClick={() => deleteProduct(product)}>🗑 Eliminar</button></td></tr>)}</tbody></table></div>
  </section>;
}
