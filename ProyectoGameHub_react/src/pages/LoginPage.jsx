import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (cause) {
      setError(cause.message || "No fue posible iniciar sesión.");
    } finally {
      setSending(false);
    }
  };

  return <section className="container py-5" style={{ maxWidth: 520 }}>
    <h1 className="h2">Iniciar sesión</h1>
    <form onSubmit={submit} className="card card-body mt-3" noValidate>
      <label className="form-label" htmlFor="login-email">Correo</label>
      <input id="login-email" type="email" className="form-control mb-3" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="form-label" htmlFor="login-password">Contraseña</label>
      <input id="login-password" type="password" className="form-control mb-3" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={sending}>{sending ? "Ingresando..." : "Ingresar"}</button>
      <p className="mt-3 mb-0">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </form>
  </section>;
}
