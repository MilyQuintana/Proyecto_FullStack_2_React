import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import FormField, { controlClass } from "../components/FormField";
import { formatCLP } from "../utils/format";
import { required } from "../utils/validators";

export function CartRow({ line }) {
    const { updateQuantity, removeFromCart } = useCart();
    const { product, quantity, unitPrice, subtotal } = line;

    return (
        <tr>
            <td><Link to={`/producto/${product.id}`}>{product.name}</Link></td>
            <td className="text-nowrap">{formatCLP(unitPrice)}</td>
            <td>
                <div className="btn-group btn-group-sm align-items-center" role="group" aria-label={`Cantidad de ${product.name}`}>
                    <button
                        type="button"
                        className="btn btn-outline-light"
                        aria-label={`Restar una unidad de ${product.name}`}
                        disabled={quantity <= 1}
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                        −
                    </button>
                    <output className="cantidad-control__valor" aria-live="polite">{quantity}</output>
                    <button
                        type="button"
                        className="btn btn-outline-light"
                        aria-label={`Sumar una unidad de ${product.name}`}
                        disabled={quantity >= product.stock}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                        +
                    </button>
                </div>
            </td>
            <td className="text-nowrap">{formatCLP(subtotal)}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-danger btn-sm text-nowrap"
                    aria-label={`Eliminar ${product.name} del carrito`}
                    onClick={() => removeFromCart(product.id)}
                >
                    🗑 Eliminar
                </button>
            </td>
        </tr>
    );
}

export default function CartPage() {
    const { detailedLines, subtotal, discount, total, clearCart, applyCoupon } = useCart();
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState("");

    const hasProducts = detailedLines.length > 0;

    const handleClear = () => {
        if (!window.confirm("¿Seguro que quieres vaciar el carrito?")) return;
        clearCart();
        setCouponInput("");
        setCouponError("");
    };

    const handleCoupon = (event) => {
        event.preventDefault();
        const missing = required(couponInput, "El código de cupón");
        if (missing) {
            setCouponError(missing);
            return;
        }
        const result = applyCoupon(couponInput.trim());
        setCouponError(result.valid ? "" : result.reason);
    };

    const handleCheckout = (event) => {
        if (hasProducts) return;
        event.preventDefault();
        window.alert("Tu carrito está vacío. Agrega productos antes de continuar.");
    };

    return (
        <section className="container py-4" aria-labelledby="carrito-titulo">
            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <h1 id="carrito-titulo" className="h2">Tu carrito</h1>

                    {!hasProducts && (
                        <div className="alert alert-secondary text-center">
                            <p>Tu carrito está vacío.</p>
                            <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
                        </div>
                    )}

                    {hasProducts && (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <caption className="visually-hidden">Detalle de productos en el carrito</caption>
                                    <thead>
                                    <tr>
                                        <th scope="col">Producto</th>
                                        <th scope="col">Precio unitario</th>
                                        <th scope="col">Cantidad</th>
                                        <th scope="col">Subtotal</th>
                                        <th scope="col"><span className="visually-hidden">Acciones</span></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {detailedLines.map((line) => (
                                        <CartRow key={line.product.id} line={line} />
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" className="btn btn-outline-light" onClick={handleClear}>
                                Vaciar carrito
                            </button>
                        </>
                    )}
                </div>

                <aside className="col-12 col-lg-4" aria-labelledby="resumen-titulo">
                    <div className="card card-body">
                        <h2 id="resumen-titulo" className="h5">Resumen de compra</h2>

                        <form onSubmit={handleCoupon} noValidate>
                            <FormField id="cupon-codigo" label="Código de cupón" error={couponError}>
                                <input
                                    type="text"
                                    id="cupon-codigo"
                                    autoComplete="off"
                                    placeholder="Ej: GAMER10"
                                    className={controlClass(couponError)}
                                    value={couponInput}
                                    onChange={(event) => setCouponInput(event.target.value)}
                                />
                            </FormField>
                            <button type="submit" className="btn btn-outline-light w-100 mb-3">Aplicar cupón</button>
                        </form>

                        <dl className="mb-3">
                            <div className="d-flex justify-content-between">
                                <dt className="fw-normal">Subtotal</dt>
                                <dd className="mb-1">{formatCLP(subtotal)}</dd>
                            </div>
                            <div className="d-flex justify-content-between">
                                <dt className="fw-normal">Descuento</dt>
                                <dd className="mb-1">-{formatCLP(discount)}</dd>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 fs-5">
                                <dt>Total</dt>
                                <dd className="mb-0 fw-bold">{formatCLP(total)}</dd>
                            </div>
                        </dl>

                        <Link to="/checkout" className="btn btn-primary" onClick={handleCheckout}>
                            Continuar a checkout
                        </Link>
                    </div>
                </aside>
            </div>
        </section>
    );
}
