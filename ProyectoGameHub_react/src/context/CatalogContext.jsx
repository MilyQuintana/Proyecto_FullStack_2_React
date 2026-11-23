import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { gamehubApi } from "../services/gamehubApi";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [nextProducts, nextCategories] = await Promise.all([gamehubApi.productos(), gamehubApi.categorias()]);
            setProducts(nextProducts);
            setCategories(nextCategories);
        } catch (cause) {
            setError(cause.message || "No fue posible cargar el catálogo.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const value = useMemo(() => ({ products, categories, loading, error, refresh }), [products, categories, loading, error, refresh]);
    return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
    const context = useContext(CatalogContext);
    if (!context) throw new Error("useCatalog debe usarse dentro de CatalogProvider");
    return context;
}
