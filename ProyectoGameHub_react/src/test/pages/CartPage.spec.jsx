import { fireEvent, screen, within } from "@testing-library/react";
import CartPage from "../../src/pages/CartPage";
import { formatCLP, getFinalPrice } from "../../src/utils/format";
import { renderWithProviders } from "../helpers/render";
import { firstProduct, mockLocalStorage } from "../helpers/mocks";

const seedCart = (quantity) =>
  mockLocalStorage({ gamehub_carrito: JSON.stringify([{ idProducto: firstProduct.id, cantidad: quantity }]) });

const plus = () => screen.getByLabelText(`Sumar una unidad de ${firstProduct.name}`);
const minus = () => screen.getByLabelText(`Restar una unidad de ${firstProduct.name}`);
const remove = () => screen.getByLabelText(`Eliminar ${firstProduct.name} del carrito`);
const qty = () => screen.getByRole("group", { name: `Cantidad de ${firstProduct.name}` }).querySelector("output").textContent;

describe("CartPage", () => {
  it("muestra el mensaje de carrito vacío con enlace al catálogo", () => {
    mockLocalStorage();
    renderWithProviders(<CartPage />);
    expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ir al catálogo" }).getAttribute("href")).toBe("/catalogo");
  });

  it("lista el producto con enlace a su detalle y su subtotal", () => {
    seedCart(2);
    renderWithProviders(<CartPage />);
    expect(screen.getByRole("link", { name: firstProduct.name }).getAttribute("href")).toBe(`/producto/${firstProduct.id}`);
    expect(screen.getAllByText(formatCLP(getFinalPrice(firstProduct) * 2)).length).toBeGreaterThan(0);
  });

  it("el botón + suma una unidad y el botón − la resta", () => {
    seedCart(2);
    renderWithProviders(<CartPage />);
    fireEvent.click(plus());
    expect(qty()).toBe("3");
    fireEvent.click(minus());
    fireEvent.click(minus());
    expect(qty()).toBe("1");
  });

  it("deshabilita − en 1 unidad", () => {
    seedCart(1);
    renderWithProviders(<CartPage />);
    expect(minus().disabled).toBeTrue();
  });

  it("deshabilita + al llegar al stock disponible", () => {
    seedCart(firstProduct.stock);
    renderWithProviders(<CartPage />);
    expect(plus().disabled).toBeTrue();
  });

  it("el botón Eliminar quita el producto del carrito", () => {
    seedCart(1);
    renderWithProviders(<CartPage />);
    fireEvent.click(remove());
    expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
  });

  describe("vaciar carrito", () => {
    it("vacía el carrito si el usuario confirma", () => {
      seedCart(1);
      spyOn(window, "confirm").and.returnValue(true);
      renderWithProviders(<CartPage />);
      fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
      expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
    });

    it("no hace nada si el usuario cancela", () => {
      seedCart(1);
      spyOn(window, "confirm").and.returnValue(false);
      renderWithProviders(<CartPage />);
      fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
      expect(screen.queryByText("Tu carrito está vacío.")).toBeNull();
    });
  });

  describe("cupones", () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2026, 5, 15));
      seedCart(1);
    });
    afterEach(() => jasmine.clock().uninstall());

    const apply = (code) => {
      fireEvent.change(screen.getByLabelText("Código de cupón"), { target: { value: code } });
      fireEvent.click(screen.getByRole("button", { name: "Aplicar cupón" }));
    };

    it("exige ingresar un código", () => {
      renderWithProviders(<CartPage />);
      apply("");
      expect(screen.getByText("El código de cupón es obligatorio.")).toBeTruthy();
    });

    it("informa cuando el cupón no existe", () => {
      renderWithProviders(<CartPage />);
      apply("NOEXISTE");
      expect(screen.getByText("Ese código de cupón no existe.")).toBeTruthy();
    });

    it("aplica un cupón válido y refleja el descuento en el resumen", () => {
      renderWithProviders(<CartPage />);
      apply("GAMER10");
      const expected = Math.min(getFinalPrice(firstProduct) * 0.1, 50000);
      expect(screen.getByText(`-${formatCLP(expected)}`)).toBeTruthy();
    });
  });

  it("alerta si se intenta ir a checkout con el carrito vacío", () => {
    mockLocalStorage();
    spyOn(window, "alert");
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByRole("link", { name: "Continuar a checkout" }));
    expect(window.alert).toHaveBeenCalled();
  });
});
