import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gamehubApi } from "../services/gamehubApi";
import { formatCLP } from "../utils/format";
import { useReviews } from "../context/ReviewsContext";
import { PRODUCTS } from "../data/catalog";

function ReviewForm({ item, onDone }) {
    const { addReview } = useReviews();
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const submit = (event) => {
        event.preventDefault();
        const localProduct = PRODUCTS.find((product) => product.name === item.productoNombre);
        if (!localProduct) {
            setError("No se encontró el producto para guardar la reseña.");
            return;
        }
        if (!comment.trim() || Number(rating) < 1 || Number(rating) > 5) {
            setError("Escribe un comentario y una puntuación entre 1 y 5.");
            return;
        }
        addReview(localProduct.id, {
            author: "Tú",
            rating: Number(rating),
            comment: comment.trim(),
            date: new Date().toISOString().slice(0, 10),
        });
        onDone();
    };

    return <form className="border-top pt-3 mt-3" onSubmit={submit}>
        <h3 className="h6">Reseñar: {item.productoNombre}</h3>
        <label className="form-label" htmlFor="review-rating">Puntuación</label>
        <select id="review-rating" className="form-select mb-2" value={rating} onChange={(event) => setRating(event.target.value)}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrella(s)</option>)}
        </select>
        <label className="form-label" htmlFor="review-comment">Comentario</label>
        <textarea id="review-comment" className="form-control mb-2" rows="3" value={comment} onChange={(event) => setComment(event.target.value)} />
        {error && <p className="alert alert-danger">{error}</p>}
        <button className="btn btn-primary">Publicar reseña</button>
    </form>;
}

export default function OrdersPage() {
    const { token, rol } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewingItem, setReviewingItem] = useState(null);

    const isStaff = rol === "VENDEDOR" || rol === "ADMINISTRADOR";
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = isStaff
                ? await gamehubApi.boletas(token)
                : await gamehubApi.misCompras(token);
            setOrders(data);
            setError("");
        } catch (cause) {
            setError(cause.message || "No fue posible cargar las órdenes.");
        } finally {
            setLoading(false);
        }
    }, [isStaff, token]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const markDelivered = async (id) => {
        try {
            await gamehubApi.marcarEntregada(id, token);
            await loadOrders();
        } catch (cause) {
            setError(cause.message || "No fue posible marcar la entrega.");
        }
    };

    const selected = orders.find((order) => order.id === selectedId);

    if (loading) {
        return <section className="container py-4"><p>Cargando órdenes...</p></section>;
    }

    return (
        <section className="container py-4" aria-labelledby="ordenes-titulo">
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <h1 id="ordenes-titulo" className="h2">{isStaff ? "Pedidos" : "Mis órdenes"}</h1>

                    {error && <p className="alert alert-danger">{error}</p>}

                    {!error && orders.length === 0 && (
                        <div className="alert alert-secondary text-center">
                            <p>Todavía no tienes órdenes registradas.</p>
                            <Link to="/catalogo" className="btn btn-primary">
                                Ir al catálogo
                            </Link>
                        </div>
                    )}

                    {orders.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>N° de orden</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                    {isStaff && <th>Cliente</th>}
                                    <th />
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>
                                            {new Date(order.fecha).toLocaleDateString("es-CL")}
                                        </td>
                                        <td>{order.estado}</td>
                                        <td>{formatCLP(order.total)}</td>
                                        {isStaff && <td>{order.usuarioNombre}</td>}
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-light btn-sm"
                                                onClick={() => setSelectedId(order.id)}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selected && (
                    <aside className="col-12 col-lg-5">
                        <div className="card card-body">
                            <h2 className="h5">Detalle de la orden {selected.id}</h2>
                            <p><strong>Estado:</strong> {selected.estado}</p>
                            {isStaff && <p><strong>Cliente:</strong> {selected.usuarioNombre} ({selected.usuarioEmail})</p>}

                            <ul className="list-unstyled mb-0">
                                {selected.detalles.map((item) => (
                                    <li key={item.id} className="mb-2">
                                        {item.cantidad} x{" "}
                                        <Link to={`/producto/${item.productoId}`}>
                                            {item.productoNombre}
                                        </Link>
                                        {" — "}{formatCLP(item.subtotal)}
                                    </li>
                                ))}
                            </ul>
                            {!isStaff && selected.estado === "ENTREGADA" && (
                                <div className="mt-3">
                                    <p className="mb-2">Esta compra fue entregada. Puedes dejar una reseña.</p>
                                    {selected.detalles.map((item) => (
                                        <div key={`review-${item.id}`} className="mb-2">
                                            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => setReviewingItem(item.id)}>
                                                Reseñar {item.productoNombre}
                                            </button>
                                            {reviewingItem === item.id && <ReviewForm item={item} onDone={() => setReviewingItem(null)} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isStaff && selected.estado !== "ENTREGADA" && selected.estado !== "CANCELADA" && (
                                <button
                                    type="button"
                                    className="btn btn-primary mt-3"
                                    onClick={() => markDelivered(selected.id)}
                                >
                                    Marcar como entregada
                                </button>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </section>
    );
}
