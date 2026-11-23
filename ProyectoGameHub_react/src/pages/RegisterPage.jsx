import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gamehubApi } from "../services/gamehubApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", telefono: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSending(true);
    try { await gamehubApi.registro(form.nombre, form.email, form.password, form.telefono || null, null); navigate("/login"); }
    catch (cause) { setError(cause.message || "No fue posible crear la cuenta."); }
    finally { setSending(false); }
  };
  return <section className="container py-5" style={{ maxWidth: 520 }}>
    <h1 className="h2">Crear cuenta</h1>
    <form onSubmit={submit} className="card card-body mt-3" noValidate>
      <label className="form-label" htmlFor="registro-nombre">Nombre completo</label>
      <input id="registro-nombre" className="form-control mb-3" required value={form.nombre} onChange={update("nombre")} />
      <label className="form-label" htmlFor="registro-email">Correo</label>
      <input id="registro-email" type="email" className="form-control mb-3" required value={form.email} onChange={update("email")} />
      <label className="form-label" htmlFor="registro-telefono">Teléfono</label>
      <input id="registro-telefono" type="tel" className="form-control mb-3" value={form.telefono} onChange={update("telefono")} />
      <label className="form-label" htmlFor="registro-password">Contraseña</label>
      <input id="registro-password" type="password" minLength="8" className="form-control mb-3" required value={form.password} onChange={update("password")} />
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={sending}>{sending ? "Creando..." : "Crear cuenta"}</button>
      <p className="mt-3 mb-0">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </form>
  </section>;
}
