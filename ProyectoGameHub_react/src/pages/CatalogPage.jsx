import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES, PRODUCTS } from "../data/catalog";
import FormField, { controlClass } from "../components/FormField";
import ProductCard from "../components/ProductCard";
import { getFinalPrice } from "../utils/format";
import { rangeCoherence } from "../utils/validators";

const PAGE_SIZE = 15;

const BRANDS = [...new Set(PRODUCTS.map((product) => product.brand))].sort();

const SORT_OPTIONS = [
    { value: "", label: "Relevancia" },
    { value: "precio-asc", label: "Precio: menor a mayor" },
    { value: "precio-desc", label: "Precio: mayor a menor" },
    { value: "nombre-asc", label: "Nombre (A-Z)" },
];

function brandLabel(brand) {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function getInitialCategory(searchParams) {
    const requested = searchParams.get("categoria");
    if (!requested) return "";
    const match = CATEGORIES.find((category) => category.id.toLowerCase() === requested.toLowerCase());
    return match ? match.id : "";
}

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const initialCategory = getInitialCategory(searchParams);

    const emptyDraft = { category: "", brand: "", minPrice: "", maxPrice: "", sort: "" };
    const [draft, setDraft] = useState({ ...emptyDraft, category: initialCategory });
    const [applied, setApplied] = useState({ ...emptyDraft, category: initialCategory });
    const [priceError, setPriceError] = useState("");
    const [page, setPage] = useState(1);

    const updateDraft = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        const message = rangeCoherence(
            draft.minPrice,
            draft.maxPrice,
            "El precio máximo no puede ser menor que el precio mínimo."
        );
        setPriceError(message);
        if (message) return;
        setApplied(draft);
        setPage(1);
    };

    const handleReset = () => {
        setDraft(emptyDraft);
        setApplied(emptyDraft);
        setPriceError("");
        setPage(1);
    };

    const filtered = useMemo(() => {
        const min = Number(applied.minPrice) || 0;
        const max = Number(applied.maxPrice) || Infinity;

        const result = PRODUCTS.filter((product) => {
            const price = getFinalPrice(product);
            return (
                (!applied.category || product.category === applied.category) &&
                (!applied.brand || product.brand === applied.brand) &&
                price >= min &&
                price <= max
            );
        });

        if (applied.sort === "precio-asc") result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
        if (applied.sort === "precio-desc") result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
        if (applied.sort === "nombre-asc") result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    }, [applied]);

    const visibleCount = PAGE_SIZE * page;
    const visible = filtered.slice(0, visibleCount);

    return (
        <section className="container py-4" aria-labelledby="catalogo-titulo">
            <div className="row g-4">
                <aside className="col-12 col-lg-3" aria-labelledby="filtros-titulo">
                    <div className="card card-body">
                        <h2 id="filtros-titulo" className="h5">Filtros</h2>
                        <form onSubmit={handleSubmit} onReset={handleReset} noValidate>
                            <FormField id="filtro-categoria" label="Categoría">
                                <select id="filtro-categoria" className="form-select" value={draft.category} onChange={updateDraft("category")}>
                                    <option value="">Todas</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField id="filtro-marca" label="Marca">
                                <select id="filtro-marca" className="form-select" value={draft.brand} onChange={updateDraft("brand")}>
                                    <option value="">Todas</option>
                                    {BRANDS.map((brand) => (
                                        <option key={brand} value={brand}>{brandLabel(brand)}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField id="filtro-precio-min" label="Precio mínimo">
                                <input
                                    type="number"
                                    id="filtro-precio-min"
                                    className="form-control"
                                    min="0"
                                    step="1000"
                                    placeholder="$0"
                                    inputMode="numeric"
                                    value={draft.minPrice}
                                    onChange={updateDraft("minPrice")}
                                />
                            </FormField>

                            <FormField id="filtro-precio-max" label="Precio máximo" error={priceError}>
                                <input
                                    type="number"
                                    id="filtro-precio-max"
                                    min="0"
                                    step="1000"
                                    placeholder="2000000"
                                    inputMode="numeric"
                                    className={controlClass(priceError)}
                                    value={draft.maxPrice}
                                    onChange={updateDraft("maxPrice")}
                                />
                            </FormField>

                            <FormField id="filtro-orden" label="Ordenar por">
                                <select id="filtro-orden" className="form-select" value={draft.sort} onChange={updateDraft("sort")}>
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </FormField>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary">Aplicar filtros</button>
                                <button type="reset" className="btn btn-outline-light">Limpiar filtros</button>
                            </div>
                        </form>
                    </div>
                </aside>

                <div className="col-12 col-lg-9">
                    <div className="d-flex flex-wrap justify-content-between align-items-baseline mb-3">
                        <h1 id="catalogo-titulo" className="h2">Catálogo</h1>
                        <p className="mb-0 text-body-secondary" aria-live="polite">{filtered.length} producto(s) encontrado(s)</p>
                    </div>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                        {visible.map((product) => (
                            <div className="col" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    {visibleCount < filtered.length && (
                        <nav className="text-center mt-4" aria-label="Paginación de resultados">
                            <button type="button" className="btn btn-outline-light" onClick={() => setPage((value) => value + 1)}>
                                Cargar más productos
                            </button>
                        </nav>
                    )}
                </div>
            </div>
        </section>
    );
}
