import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCTS } from "../data/catalog";
import CategoryCarousel from "../components/CategoryCarousel";
import FormField, { controlClass } from "../components/FormField";
import ProductCard from "../components/ProductCard";
import TikTokEmbed from "../components/TikTokEmbed";
import { email as validateEmail } from "../utils/validators";

export function NewsletterForm() {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const message = validateEmail(value);
        setError(message);
        if (message) return;
        setSubscribed(true);
        setValue("");
    };

    return (
        <form className="mx-auto" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
            <FormField
                id="boletin-correo"
                label="Correo electrónico"
                error={error}
                help="Usaremos tu correo solo para enviar ofertas"
            >
                <input
                    type="email"
                    id="boletin-correo"
                    name="correo"
                    autoComplete="email"
                    placeholder="tuemail@dominio.com"
                    aria-describedby="boletin-correo-help boletin-correo-error"
                    className={controlClass(error)}
                    value={value}
                    onChange={(event) => {
                        setValue(event.target.value);
                        setSubscribed(false);
                    }}
                />
            </FormField>
            <button type="submit" className="btn btn-primary">Suscribirse</button>
            {subscribed && <p role="status" className="mt-3 mb-0 text-success">¡Gracias por suscribirte!</p>}
        </form>
    );
}

export default function HomePage() {
    const featured = PRODUCTS.filter((product) => product.featured).slice(0, 4);

    return (
        <>
            <section className="banner text-center py-5" aria-labelledby="banner-titulo">
                <div className="container py-4">
                    <h1 id="banner-titulo" className="display-4 fw-bold">GameHub Store</h1>
                    <p className="lead">Tu tienda gamer en línea: notebooks, tarjetas gráficas, consolas y más.</p>
                    <Link to="/catalogo" className="btn btn-primary btn-lg">Ver catálogo</Link>
                </div>
            </section>

            <section className="container py-5" aria-labelledby="categorias-titulo">
                <h2 id="categorias-titulo" className="mb-4">Categorías</h2>
                <CategoryCarousel />
            </section>

            <section className="container py-5" aria-labelledby="destacados-titulo">
                <h2 id="destacados-titulo" className="mb-4">Productos destacados</h2>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                    {featured.map((product) => (
                        <div className="col" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="container py-5" aria-labelledby="video-titulo">
                <h2 id="video-titulo">Producto Destacado</h2>
                <p>Mira en detalle nuestro notebook, nuestro producto más vendido</p>
                <div className="d-flex justify-content-center overflow-auto">
                    <TikTokEmbed />
                </div>
            </section>

            <section className="container py-5 text-center" aria-labelledby="boletin-titulo">
                <h2 id="boletin-titulo">Boletín de noticias</h2>
                <p>Recibe ofertas exclusivas y novedades</p>
                <NewsletterForm />
            </section>
        </>
    );
}
