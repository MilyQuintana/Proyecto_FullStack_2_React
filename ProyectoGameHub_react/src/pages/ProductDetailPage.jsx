import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PRODUCTS } from "../data/catalog";
import { useCart } from "../context/CartContext";
import { useReviews } from "../context/ReviewsContext";
import FormField, { controlClass } from "../components/FormField";
import { formatCLP } from "../utils/format";
import { integerInRange } from "../utils/validators";

export function stockMessage(stock) {
    if (stock === 0) return "Sin stock disponible";
    if (stock <= 3) return `¡Últimas ${stock} unidades!`;
    return `${stock} unidades disponibles`;
}

export function ReviewList({ reviews }) {
    if (reviews.length === 0) {
        return <p>Este producto todavía no tiene reseñas.</p>;
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const sorted = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <>
            <p>
                <strong>Promedio: {average.toFixed(1)} / 5</strong> ({reviews.length} reseña(s))
            </p>
            <div className="list-group">
                {sorted.map((review, index) => (
                    <article key={`${review.author}-${review.date}-${index}`} className="list-group-item">
                        <strong>{review.author}</strong> — {"⭐".repeat(review.rating)}
                        <p className="mb-1">{review.comment}</p>
                        <small className="text-body-secondary">{review.date}</small>
                    </article>
                ))}
            </div>
        </>
    );
}

export function AddToCartForm({ product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState("1");
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const outOfStock = product.stock === 0;

    const handleSubmit = (event) => {
        event.preventDefault();
        const message = integerInRange(quantity, { min: 1, max: product.stock, label: "La cantidad" });
        setError(message);
        if (message) return;

        addToCart(product.id, Number(quantity));
        setAdded(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setAdded(false), 1200);
    };

    return (
        <form className="mb-4" onSubmit={handleSubmit} noValidate>
            <FormField id="producto-cantidad" label="Cantidad" error={error}>
                <input
                    type="number"
                    id="producto-cantidad"
                    min="1"
                    max={product.stock}
                    disabled={outOfStock}
                    className={controlClass(error)}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={outOfStock || added}>
                {outOfStock ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
            </button>
        </form>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const { getReviews } = useReviews();
    const product = PRODUCTS.find((item) => item.id === Number(id));
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => setSelectedImage(0), [id]);

    if (!product) {
        return (
            <section className="container py-5">
                <h1>Producto no encontrado</h1>
                <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
            </section>
        );
    }

    const reviews = getReviews(product.id);
    const mainImage = product.images[selectedImage] ?? product.image;

    return (
        <section className="container py-4" aria-labelledby="producto-nombre">
            <div className="row g-4">
                <div className="col-12 col-md-6">
                    <img src={mainImage} alt={product.name} className="img-fluid rounded border w-100" />
                    {product.images.length > 1 && (
                        <div className="detalle-producto__miniaturas d-flex flex-wrap gap-2 mt-3">
                            {product.images.map((src, index) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`Vista adicional de ${product.name}`}
                                    className={`img-thumbnail${index === selectedImage ? " border-primary" : ""}`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-12 col-md-6">
                    <p className="text-uppercase small text-body-secondary mb-1">{product.category}</p>
                    <h1 id="producto-nombre" className="h2">{product.name}</h1>

                    <p className="d-flex align-items-baseline gap-3">
                        <span className="fs-3 fw-bold">{formatCLP(product.discountPrice ?? product.regularPrice)}</span>
                        {product.discountPrice && <span className="precio-tachado">{formatCLP(product.regularPrice)}</span>}
                    </p>

                    <p className="text-body-secondary">{stockMessage(product.stock)}</p>

                    <AddToCartForm key={product.id} product={product} />

                    <h2 className="h5">Especificaciones técnicas</h2>
                    <ul>
                        {product.specs.map((spec) => (
                            <li key={spec}>{spec}</li>
                        ))}
                    </ul>
                </div>

                <section className="col-12" aria-labelledby="resenas-titulo">
                    <h2 id="resenas-titulo" className="h4">Reseñas</h2>
                    <ReviewList reviews={reviews} />
                </section>
            </div>
        </section>
    );
}
