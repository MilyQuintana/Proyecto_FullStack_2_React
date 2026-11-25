import { act, render, renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../src/context/AuthContext";
import { CartProvider } from "../../src/context/CartContext";
import { CatalogProvider } from "../../src/context/CatalogContext";
import { ReviewsProvider } from "../../src/context/ReviewsContext";
import { gamehubApi } from "../../src/services/gamehubApi";
import { CATEGORIES, PRODUCTS } from "../../src/data/catalog";

function mockCatalog() {
    spyOn(gamehubApi, "productos").and.resolveTo(PRODUCTS);
    spyOn(gamehubApi, "categorias").and.resolveTo(CATEGORIES);
}

function Providers({ children }) {
    return (
        <AuthProvider>
            <CatalogProvider>
                <CartProvider>
                    <ReviewsProvider>{children}</ReviewsProvider>
                </CartProvider>
            </CatalogProvider>
        </AuthProvider>
    );
}

/** Monta los providers reales y espera el catálogo simulado antes de comprobar la UI. */
export async function renderWithProviders(ui, { route = "/", path = "*" } = {}) {
    mockCatalog();
    let view;
    await act(async () => {
        view = render(
            <MemoryRouter initialEntries={[route]}>
                <Providers>
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                </Providers>
            </MemoryRouter>
        );
    });
    return view;
}

export async function renderCartHook(hook) {
    mockCatalog();
    let view;
    await act(async () => {
        view = renderHook(hook, { wrapper: Providers });
    });
    return view;
}
