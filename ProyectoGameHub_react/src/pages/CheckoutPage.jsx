import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import FormField, { controlClass } from "../components/FormField";
import { formatCLP } from "../utils/format";
import { email, hasErrors, phoneCL, required, selectRequired } from "../utils/validators";

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
    const { detailedLines, subtotal, discount, total, clearCart, addOrder } = useCart();
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [orderNumber, setOrderNumber] = useState(null);

    const isEmpty = detailedLines.length === 0;

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

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isEmpty) {
            window.alert("No puedes confirmar una compra con el carrito vacío.");
            return;
        }

        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (hasErrors(nextErrors)) return;

        const number = `GH-${Date.now().toString().slice(-8)}`;

        addOrder({
            numero: number,
            fecha: new Date().toISOString().slice(0, 10),
            estado: "Pagada",
            total,
            subtotal,
            descuento: discount,
            pago: { metodo: form.paymentMethod, estado: "Aprobado" },
            despacho: {
                estado: "En preparación",
                nombre: form.name.trim(),
                correo: form.email.trim(),
                telefono: `${PHONE_PREFIX}${form.phone}`,
                region: form.region,
                comuna: form.commune.trim(),
                direccion: form.address.trim(),
            },
            productos: detailedLines.map((line) => ({
                id: line.product.id,
                nombre: line.product.name,
                cantidad: line.quantity,
                subtotal: line.subtotal,
                resenada: false,
            })),
        });

        clearCart();
        setOrderNumber(number);
    };

    return (
        <section className="container py-4" aria-labelledby="checkout-titulo">
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <h1 id="checkout-titulo" className="h2">Finalizar compra</h1>

                    {orderNumber ? (
                        <div className="alert alert-success" aria-live="polite">
                            <p className="fw-bold">¡Compra confirmada!</p>
                            <p>Número de orden: <strong>{orderNumber}</strong></p>
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

                            <button type="submit" className="btn btn-primary" disabled={isEmpty}>
                                Confirmar compra
                            </button>
                        </form>
                    )}
                </div>

                <aside className="col-12 col-lg-5" aria-labelledby="checkout-resumen-titulo">
                    <div className="card card-body">
                        <h2 id="checkout-resumen-titulo" className="h5">Resumen de la orden</h2>
                        <ul className="list-unstyled">
                            {isEmpty && !orderNumber && <li>Tu carrito está vacío. Vuelve al catálogo para agregar productos.</li>}
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
                                <dd className="mb-1">-{formatCLP(discount)}</dd>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 fs-5">
                                <dt>Total</dt>
                                <dd className="mb-0 fw-bold">{formatCLP(total)}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </section>
    );
}
