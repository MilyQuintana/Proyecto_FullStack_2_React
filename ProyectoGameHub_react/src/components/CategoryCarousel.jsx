import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, PRODUCTS } from "../data/catalog";

function getCategoryImage(category) {
    const product = PRODUCTS.find((item) => item.category === category.id);
    return product ? product.image : category.image;
}

export default function CategoryCarousel() {
    const total = CATEGORIES.length;
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const goTo = (index) => setCurrent((index + total) % total);

    useEffect(() => {
        if (paused) return undefined;
        const timer = setInterval(() => setCurrent((value) => (value + 1) % total), 4000);
        return () => clearInterval(timer);
    }, [paused, total]);

    return (
        <div
            className="carousel slide categorias-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="carousel-indicators">
                {CATEGORIES.map((category, index) => (
                    <button
                        key={category.id}
                        type="button"
                        className={index === current ? "active" : ""}
                        aria-current={index === current ? "true" : undefined}
                        aria-label={`Ir a categoría ${index + 1}`}
                        onClick={() => goTo(index)}
                    />
                ))}
            </div>
            <div className="carousel-inner">
                {CATEGORIES.map((category, index) => (
                    <div key={category.id} className={`carousel-item text-center${index === current ? " active" : ""}`}>
                        <Link to={`/catalogo?categoria=${encodeURIComponent(category.id)}`} className="text-decoration-none">
                            <img className="d-block w-100" src={getCategoryImage(category)} alt={category.name} loading="lazy" />
                            <span className="d-block fw-semibold fs-5 mt-2 pb-5">{category.name}</span>
                        </Link>
                    </div>
                ))}
            </div>
            <button type="button" className="carousel-control-prev" aria-label="Categoría anterior" onClick={() => goTo(current - 1)}>
                <span className="carousel-control-prev-icon" aria-hidden="true" />
            </button>
            <button type="button" className="carousel-control-next" aria-label="Categoría siguiente" onClick={() => goTo(current + 1)}>
                <span className="carousel-control-next-icon" aria-hidden="true" />
            </button>
        </div>
    );
}
