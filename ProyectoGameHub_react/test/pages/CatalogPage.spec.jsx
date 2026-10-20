import { fireEvent, screen } from "@testing-library/react";
import CatalogPage from "../../src/pages/CatalogPage";
import { PRODUCTS } from "../../src/data/catalog";
import { renderWithProviders } from "../helpers/render.jsx";
import { mockLocalStorage } from "../helpers/mocks.js";

const count = () => screen.getByText(/producto\(s\) encontrado\(s\)/).textContent;

describe("CatalogPage", () => {
  beforeEach(() => mockLocalStorage());

  it("muestra todos los productos por defecto", () => {
    renderWithProviders(<CatalogPage />, { route: "/catalogo" });
    expect(count()).toContain(`${PRODUCTS.length} producto(s)`);
  });

  it("aplica el filtro de categoría que viene en la URL", () => {
    const expected = PRODUCTS.filter((product) => product.category === "Notebooks").length;
    renderWithProviders(<CatalogPage />, { route: "/catalogo?categoria=Notebooks" });
    expect(count()).toContain(`${expected} producto(s)`);
  });

  it("filtra por categoría al aplicar los filtros", () => {
    renderWithProviders(<CatalogPage />, { route: "/catalogo" });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "Monitores" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    const expected = PRODUCTS.filter((product) => product.category === "Monitores").length;
    expect(count()).toContain(`${expected} producto(s)`);
  });

  it("valida que el precio máximo no sea menor al mínimo", () => {
    renderWithProviders(<CatalogPage />, { route: "/catalogo" });
    fireEvent.change(screen.getByLabelText("Precio mínimo"), { target: { value: "500000" } });
    fireEvent.change(screen.getByLabelText("Precio máximo"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    expect(screen.getByText("El precio máximo no puede ser menor que el precio mínimo.")).toBeTruthy();
    expect(count()).toContain(`${PRODUCTS.length} producto(s)`);
  });

  it("'Limpiar filtros' restablece el listado completo", () => {
    renderWithProviders(<CatalogPage />, { route: "/catalogo?categoria=Notebooks" });
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(count()).toContain(`${PRODUCTS.length} producto(s)`);
  });

  it("pagina de a 15 y carga más al pedirlo", () => {
    const { container } = renderWithProviders(<CatalogPage />, { route: "/catalogo" });
    const initial = container.querySelectorAll(".tarjeta-producto").length;
    expect(initial).toBe(Math.min(15, PRODUCTS.length));
    if (PRODUCTS.length > 15) {
      fireEvent.click(screen.getByRole("button", { name: "Cargar más productos" }));
      expect(container.querySelectorAll(".tarjeta-producto").length).toBe(Math.min(30, PRODUCTS.length));
    }
  });
});
