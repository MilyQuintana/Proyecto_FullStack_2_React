import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../../src/components/ProductCard";
import { formatCLP } from "../../src/utils/format";

const product = { id: 7, name: "Teclado Pro", image: "/img/teclado.png", regularPrice: 100000, discountPrice: 80000, stock: 5 };

const renderCard = (item) =>
  render(
    <MemoryRouter>
      <ProductCard product={item} />
    </MemoryRouter>
  );

describe("ProductCard", () => {
  it("enlaza al detalle del producto", () => {
    renderCard(product);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/producto/7");
  });

  it("muestra nombre, imagen con alt y el precio con descuento", () => {
    renderCard(product);
    expect(screen.getByRole("heading", { name: "Teclado Pro" })).toBeTruthy();
    expect(screen.getByAltText("Teclado Pro").getAttribute("src")).toBe("/img/teclado.png");
    expect(screen.getByText(formatCLP(80000))).toBeTruthy();
  });

  it("muestra la insignia 'Sin stock' solo cuando stock es 0", () => {
    const { unmount } = renderCard(product);
    expect(screen.queryByText("Sin stock")).toBeNull();
    unmount();
    renderCard({ ...product, stock: 0 });
    expect(screen.getByText("Sin stock")).toBeTruthy();
  });
});
