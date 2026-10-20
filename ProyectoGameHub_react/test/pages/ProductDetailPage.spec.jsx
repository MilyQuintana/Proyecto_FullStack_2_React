import { fireEvent, render, screen } from "@testing-library/react";
import ProductDetailPage, { ReviewList, stockMessage } from "../../src/pages/ProductDetailPage";
import { renderWithProviders } from "../helpers/render.jsx";
import { firstProduct, mockLocalStorage } from "../helpers/mocks.js";

const renderDetail = (id) => renderWithProviders(<ProductDetailPage />, { route: `/producto/${id}`, path: "/producto/:id" });

describe("ProductDetailPage", () => {
  let store;
  beforeEach(() => {
    store = mockLocalStorage();
  });

  it("muestra el nombre del producto y sus especificaciones", () => {
    renderDetail(firstProduct.id);
    expect(screen.getByRole("heading", { level: 1, name: firstProduct.name })).toBeTruthy();
    expect(screen.getByText(firstProduct.specs[0])).toBeTruthy();
  });

  it("muestra 'Producto no encontrado' para un id inexistente", () => {
    renderDetail(999999);
    expect(screen.getByText("Producto no encontrado")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toBeTruthy();
  });

  it("valida la cantidad antes de agregar al carrito", () => {
    renderDetail(firstProduct.id);
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByText("La cantidad no puede ser menor que 1.")).toBeTruthy();
    expect(store.gamehub_carrito).toBe("[]");
  });

  it("rechaza una cantidad mayor al stock", () => {
    renderDetail(firstProduct.id);
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: String(firstProduct.stock + 1) } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByText(/no puede ser mayor que/)).toBeTruthy();
  });

  it("agrega al carrito con una cantidad válida y confirma con '¡Agregado!'", () => {
    renderDetail(firstProduct.id);
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByRole("button", { name: "¡Agregado!" })).toBeTruthy();
    expect(JSON.parse(store.gamehub_carrito)).toEqual([{ idProducto: firstProduct.id, cantidad: 2 }]);
  });

  describe("stockMessage", () => {
    it("distingue sin stock, últimas unidades y stock normal", () => {
      expect(stockMessage(0)).toBe("Sin stock disponible");
      expect(stockMessage(2)).toBe("¡Últimas 2 unidades!");
      expect(stockMessage(10)).toBe("10 unidades disponibles");
    });
  });

  describe("ReviewList", () => {
    it("informa cuando no hay reseñas", () => {
      render(<ReviewList reviews={[]} />);
      expect(screen.getByText("Este producto todavía no tiene reseñas.")).toBeTruthy();
    });

    it("calcula el promedio y ordena de la más reciente a la más antigua", () => {
      const reviews = [
        { author: "Vieja", rating: 5, comment: "a", date: "2024-01-01" },
        { author: "Nueva", rating: 3, comment: "b", date: "2025-06-01" },
      ];
      const { container } = render(<ReviewList reviews={reviews} />);
      expect(screen.getByText("Promedio: 4.0 / 5")).toBeTruthy();
      const authors = [...container.querySelectorAll("article strong")].map((node) => node.textContent);
      expect(authors).toEqual(["Nueva", "Vieja"]);
    });
  });
});
