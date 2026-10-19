import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "../../src/context/CartContext";
import { ReviewsProvider } from "../../src/context/ReviewsContext";

/** Renderiza la UI con Router en memoria y los providers reales de la app. */
export function renderWithProviders(ui, { route = "/", path = "*" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider>
        <ReviewsProvider>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </ReviewsProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

export function CartWrapper({ children }) {
  return (
    <MemoryRouter>
      <CartProvider>{children}</CartProvider>
    </MemoryRouter>
  );
}
