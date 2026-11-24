import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import FormField, { controlClass } from "../components/FormField";
import { formatCLP } from "../utils/format";
import { email, hasErrors, phoneCL, required, selectRequired } from "../utils/validators";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { gamehubApi } from "../services/gamehubApi";

const REGIONS = [
    { value: "metropolitana", label: "Metropolitana de Santiago" },
    { value: "valparaiso", label: "Valparaíso" },
    { value: "biobio", label: "Biobío" },
    { value: "araucania", label: "La Araucanía" },
];

const PAYMENT_METHODS = [
    { value: "tarjeta-credito", label: "Tarjeta de crédito (simulado)" },
    { value: "tarjeta-debito", label: "Tarjeta de débito (simulado)" },
    { value: "transferencia", label: "Transferencia (simulado)" },
];

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    region: "",
    commune: "",
    address: "",
    paymentMethod: "tarjeta-credito",
};

export const PHONE_PREFIX = "+569";

export function formatPhoneDigits(digits) {
    return digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits;
}

function validate(form) {
    return {
        name: required(form.name, "El nombre completo"),
        email: email(form.email),
        phone: phoneCL(form.phone ? `${PHONE_PREFIX}${form.phone}` : ""),
        region: selectRequired(form.region, "Selecciona una región"),
        commune: required(form.commune, "La comuna"),
        address: required(form.address, "La dirección"),
    };
}

export default function CheckoutPage() {
    const { detailedLines, subtotal, discount, total, clearCart, couponCode, couponInfo: cartCouponInfo } = useCart();
    const { token } = useAuth();
    const { refresh: refreshCatalog } = useCatalog();
    const [submitError, setSubmitError] = useState("");
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [completedOrder, setCompletedOrder] = useState(null);
    const [coupon, setCoupon] = useState(couponCode);
    const [couponInfo, setCouponInfo] = useState(null);
    const [couponError, setCouponError] = useState("");

    const isEmpty = detailedLines.length === 0;
    const activeCouponInfo = couponInfo || cartCouponInfo;
    const couponDiscount = activeCouponInfo ? Math.min(subtotal * activeCouponInfo.porcentaje / 100, activeCouponInfo.tope ?? Infinity) : 0;
    const finalTotal = Math.max(subtotal - couponDiscount, 0);

    const applyCoupon = async () => {
        if (!coupon.trim()) return;
        try { setCouponInfo(await gamehubApi.validarCupon(coupon, token)); setCouponError(""); }
        catch (cause) { setCouponInfo(null); setCouponError(cause.message || "Cupón no válido."); }
    };

    const bind = (field, base = "form-control") => ({
        value: form[field],
        onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
        className: controlClass(errors[field], base),
    });

    const handlePhoneChange = (event) => {
        let digits = event.target.value.replace(/[^0-9]/g, "");
        if (digits.length > 8 && digits.startsWith("569")) digits = digits.slice(3);
        setForm((current) => ({ ...current, phone: digits.slice(0, 8) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isEmpty) {
            window.alert("No puedes confirmar una compra con el carrito vacío.");
            return;
        }

        const nextErrors = validate(form);
        setErrors(nextErrors);

        if (hasErrors(nextErrors)) return;
        setSubmitError("");
        setSending(true);

        try {
            const boleta = await gamehubApi.crearBoleta(
                detailedLines.map((line) => ({
                    productoId: line.product.id,
                    cantidad: line.quantity,
                })),
                token, coupon
            );

            // El stock se descuenta en el servidor; se vuelve a consultar para no dejar
            // catálogo, detalle y carrito mostrando las existencias anteriores.
            await refreshCatalog();
            clearCart();
            setCompletedOrder(boleta);
        } catch (cause) {
            setSubmitError(cause.message || "No fue posible confirmar la compra.");
        } finally {
            setSending(false);
        }

    };

    return (
        <section className="container py-4" aria-labelledby="checkout-titulo">
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <h1 id="checkout-titulo" className="h2">Finalizar compra</h1>

                    {completedOrder ? (
                        <div className="alert alert-success" aria-live="polite">
                            <p className="fw-bold">¡Compra confirmada!</p>
                            <p>Número de orden: <strong>{completedOrder.id}</strong></p>
                            <p>Total cobrado: <strong>{formatCLP(completedOrder.total)}</strong></p>
                            <Link to="/ordenes" className="btn btn-primary">Ver mis órdenes</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <h2 className="h5">Datos de despacho</h2>

                            <FormField id="checkout-nombre" label="Nombre completo" error={errors.name}>
                                <input type="text" id="checkout-nombre" autoComplete="name" {...bind("name")} />
                            </FormField>

                            <FormField id="checkout-correo" label="Correo electrónico" error={errors.email}>
                                <input type="email" id="checkout-correo" autoComplete="email" {...bind("email")} />
                            </FormField>

                            <FormField
                                id="checkout-telefono"
                                label="Teléfono"
                                error={errors.phone}
                                help="Formato +569 seguido de 8 números (11 dígitos en total)."
                            >
                                <div className="input-group">
                                    <span className="input-group-text" aria-hidden="true">+56 9</span>
                                    <input
                                        type="tel"
                                        id="checkout-telefono"
                                        autoComplete="tel-national"
                                        placeholder="1234 5678"
                                        inputMode="numeric"
                                        maxLength={9}
                                        aria-describedby="checkout-telefono-help checkout-telefono-error"
                                        value={formatPhoneDigits(form.phone)}
                                        onChange={handlePhoneChange}
                                        className={controlClass(errors.phone)}
                                    />
                                </div>
                            </FormField>

                            <FormField id="checkout-region" label="Región" error={errors.region}>
                                <select id="checkout-region" autoComplete="address-level1" {...bind("region", "form-select")}>
                                    <option value="">Selecciona una región</option>
                                    {REGIONS.map((region) => (
                                        <option key={region.value} value={region.value}>{region.label}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField id="checkout-comuna" label="Comuna" error={errors.commune}>
                                <input type="text" id="checkout-comuna" autoComplete="address-level2" {...bind("commune")} />
                            </FormField>

                            <FormField id="checkout-direccion" label="Dirección" error={errors.address}>
                                <input type="text" id="checkout-direccion" autoComplete="street-address" {...bind("address")} />
                            </FormField>

                            <h2 className="h5">Método de pago</h2>
                            <FormField id="checkout-cupon" label="Código de descuento (opcional)" error={couponError}>
                                <div className="input-group"><input id="checkout-cupon" className="form-control" value={coupon} onChange={(event) => { setCoupon(event.target.value.toUpperCase()); setCouponInfo(null); setCouponError(""); }} /><button type="button" className="btn btn-outline-light" onClick={applyCoupon}>Aplicar</button></div>
                            </FormField>
                            {activeCouponInfo && <p className="alert alert-success">Cupón {activeCouponInfo.codigo} aplicado: {activeCouponInfo.porcentaje}% de descuento.</p>}
                            <fieldset className="mb-3">
                                <legend className="visually-hidden">Selecciona un método de pago</legend>
                                {PAYMENT_METHODS.map((method) => (
                                    <div key={method.value} className="form-check">
                                        <input
                                            id={`pago-${method.value}`}
                                            className="form-check-input"
                                            type="radio"
                                            name="metodoPago"
                                            value={method.value}
                                            checked={form.paymentMethod === method.value}
                                            onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                                        />
                                        <label className="form-check-label" htmlFor={`pago-${method.value}`}>{method.label}</label>
                                    </div>
                                ))}
                            </fieldset>
                            {submitError && (
                                <p className="alert alert-danger" role="alert">
                                    {submitError}
                                </p>
                            )}
                            <button type="submit" className="btn btn-primary" disabled={isEmpty || sending}>
                                {sending ? "Confirmando..." : "Confirmar compra"}
                            </button>
                        </form>
                    )}
                </div>

                <aside className="col-12 col-lg-5" aria-labelledby="checkout-resumen-titulo">
                    <div className="card card-body">
                        <h2 id="checkout-resumen-titulo" className="h5">Resumen de la orden</h2>
                        <ul className="list-unstyled">
                            {isEmpty && !completedOrder && <li>Tu carrito está vacío. Vuelve al catálogo para agregar productos.</li>}
                            {detailedLines.map((line) => (
                                <li key={line.product.id}>
                                    {line.quantity} x {line.product.name} — {formatCLP(line.subtotal)}
                                </li>
                            ))}
                        </ul>
                        <dl className="mb-0">
                            <div className="d-flex justify-content-between">
                                <dt className="fw-normal">Subtotal</dt>
                                <dd className="mb-1">{formatCLP(subtotal)}</dd>
                            </div>
                            <div className="d-flex justify-content-between">
                                <dt className="fw-normal">Descuento</dt>
                                <dd className="mb-1">-{formatCLP(couponDiscount)}</dd>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 fs-5">
                                <dt>Total</dt>
                                <dd className="mb-0 fw-bold">{formatCLP(finalTotal)}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </section>
    );
}
