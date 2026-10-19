import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useReviews } from "../context/ReviewsContext";
import FormField, { controlClass } from "../components/FormField";
import { formatCLP } from "../utils/format";
import { integerInRange, required } from "../utils/validators";

const WARRANTY_DAYS = 30;

export const isDelivered = (order) => order.despacho?.estado === "Entregado";

export function ReviewForm({ order, onDone }) {
    const { updateOrder } = useCart();
    const { addReview } = useReviews();
    const pending = order.productos.find((product) => !product.resenada);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState("5");
    const [errors, setErrors] = useState({});

    if (!pending) {
        return <p role="status" className="alert alert-info">Los productos de esta orden ya contienen una reseña.</p>;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!isDelivered(order)) return;
        const nextErrors = {
            comment: required(comment, "El comentario"),
            rating: integerInRange(rating, { min: 1, max: 5, label: "La puntuación" }),
        };
        setErrors(nextErrors);
        if (nextErrors.comment || nextErrors.rating) return;

        addReview(pending.id, {
            author: "Tú",
            rating: Number(rating),
            comment: comment.trim(),
            date: new Date().toISOString().slice(0, 10),
        });
        updateOrder(order.numero, {
            productos: order.productos.map((product) =>
                product.id === pending.id ? { ...product, resenada: true } : product
            ),
        });
        onDone("¡Gracias por tu reseña!");
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <FormField id="resena-comentario" label={`Reseña para "${pending.nombre}"`} error={errors.comment}>
        <textarea
            id="resena-comentario"
            rows="3"
            className={controlClass(errors.comment)}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
        />
            </FormField>
            <FormField id="resena-puntuacion" label="Puntuación (1 a 5)" error={errors.rating}>
                <input
                    type="number"
                    id="resena-puntuacion"
                    min="1"
                    max="5"
                    className={controlClass(errors.rating)}
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                />
            </FormField>
            <button type="submit" className="btn btn-primary">Enviar reseña</button>
        </form>
    );
}

export function WarrantyForm({ order, onDone }) {
    const { updateOrder } = useCart();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        const missing = required(reason, "El motivo de la garantía");
        if (missing) {
            setError(missing);
            return;
        }

        const daysSincePurchase = (Date.now() - new Date(order.fecha)) / (1000 * 60 * 60 * 24);
        if (daysSincePurchase > WARRANTY_DAYS) {
            setError(`El plazo de garantía para esta orden ya venció (${WARRANTY_DAYS} días).`);
            return;
        }

        updateOrder(order.numero, { garantia: { motivo: reason.trim(), estado: "En revisión" } });
        onDone("Tu solicitud de garantía fue enviada y está en revisión.");
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <FormField id="garantia-motivo" label="Motivo de la garantía" error={error}>
        <textarea
            id="garantia-motivo"
            rows="3"
            className={controlClass(error)}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
        />
            </FormField>
            <button type="submit" className="btn btn-primary">Enviar solicitud</button>
        </form>
    );
}

export function OrderDetail({ order }) {
    const { updateOrder } = useCart();
    const delivered = isDelivered(order);
    const [panel, setPanel] = useState(null);
    const [notice, setNotice] = useState("");

    const finish = (message) => {
        setPanel(null);
        setNotice(message);
    };

    const markDelivered = () => {
        updateOrder(order.numero, {
            estado: "Entregada",
            despacho: { ...order.despacho, estado: "Entregado" },
        });
        setNotice("La orden fue marcada como entregada. Ya puedes escribir reseñas.");
    };

    const toggle = (name) => {
        setNotice("");
        setPanel((current) => (current === name ? null : name));
    };

    return (
        <section className="col-12 col-lg-5" aria-labelledby="orden-detalle-titulo">
            <div className="card card-body">
                <h2 id="orden-detalle-titulo" className="h5">Detalle de la orden {order.numero}</h2>

                <p><strong>Estado del pago:</strong> {order.pago.estado} ({order.pago.metodo})</p>
                <p><strong>Seguimiento del despacho:</strong> {order.despacho.estado}</p>
                {order.garantia && <p><strong>Garantía:</strong> {order.garantia.estado}</p>}

                <ul className="list-unstyled">
                    {order.productos.map((product) => (
                        <li key={product.id}>
                            {product.cantidad} x{" "}
                            <Link to={`/producto/${product.id}`}>{product.nombre}</Link> - {formatCLP(product.subtotal)}
                        </li>
                    ))}
                </ul>

                <div className="d-flex flex-wrap gap-2 mb-3">
                    {!delivered && (
                        <button type="button" className="btn btn-outline-light" onClick={markDelivered}>
                            Marcar como entregado (simulación)
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-light"
                        disabled={!delivered}
                        title={delivered ? undefined : "Disponible cuando el pedido esté entregado"}
                        onClick={() => toggle("review")}
                    >
                        Escribir reseña
                    </button>
                    <button type="button" className="btn btn-outline-light" onClick={() => toggle("warranty")}>
                        Solicitar garantía
                    </button>
                </div>

                {!delivered && <p className="form-text">Podrás escribir reseñas cuando el pedido esté entregado.</p>}
                {notice && <p role="status" className="alert alert-success">{notice}</p>}
                {panel === "review" && delivered && <ReviewForm order={order} onDone={finish} />}
                {panel === "warranty" && <WarrantyForm order={order} onDone={finish} />}
            </div>
        </section>
    );
}

export default function OrdersPage() {
    const { orders } = useCart();
    const [selectedNumber, setSelectedNumber] = useState(null);
    const selected = orders.find((order) => order.numero === selectedNumber) ?? null;

    return (
        <section className="container py-4" aria-labelledby="ordenes-titulo">
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <h1 id="ordenes-titulo" className="h2">Mis órdenes</h1>

                    {orders.length === 0 ? (
                        <div className="alert alert-secondary text-center">
                            <p>Todavía no tienes órdenes registradas.</p>
                            <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table id="tabla-ordenes" className="table table-hover align-middle">
                                <caption className="visually-hidden">Listado de órdenes del cliente</caption>
                                <thead>
                                <tr>
                                    <th scope="col">N° de orden</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Total</th>
                                    <th scope="col"><span className="visually-hidden">Detalle</span></th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map((order) => (
                                    <tr key={order.numero} onClick={() => setSelectedNumber(order.numero)}>
                                        <td>{order.numero}</td>
                                        <td>{order.fecha}</td>
                                        <td>{order.estado}</td>
                                        <td>{formatCLP(order.total)}</td>
                                        <td>
                                            <button type="button" className="btn btn-outline-light btn-sm">Ver detalle</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selected && <OrderDetail key={selected.numero} order={selected} />}
            </div>
        </section>
    );
}
