import { fireEvent, screen } from "@testing-library/react";
import { gamehubApi } from "../../src/services/gamehubApi";
import CartPage from "../../src/pages/CartPage";
import { formatCLP, getFinalPrice } from "../../src/utils/format";
import { renderWithProviders } from "../helpers/render.jsx";
import { customer, customerCartKey, firstProduct, guestCartKey, mockLocalStorage, testCoupon } from "../helpers/mocks.js";

const seedCart = (quantity) =>
    mockLocalStorage({ [guestCartKey]: JSON.stringify([{ idProducto: firstProduct.id, cantidad: quantity }]) });

const plus = () => screen.getByLabelText(`Sumar una unidad de ${firstProduct.name}`);
const minus = () => screen.getByLabelText(`Restar una unidad de ${firstProduct.name}`);
const remove = () => screen.getByLabelText(`Eliminar ${firstProduct.name} del carrito`);
const qty = () => screen.getByRole("group", { name: `Cantidad de ${firstProduct.name}` }).querySelector("output").textContent;

describe("CartPage", () => {
  it("muestra el mensaje de carrito vacío con enlace al catálogo", async () => {
    mockLocalStorage();
    await renderWithProviders(<CartPage />);
    expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ir al catálogo" }).getAttribute("href")).toBe("/catalogo");
  });

  it("lista el producto con enlace a su detalle y su subtotal", async () => {
    seedCart(2);
    await renderWithProviders(<CartPage />);
    expect(screen.getByRole("link", { name: firstProduct.name }).getAttribute("href")).toBe(`/producto/${firstProduct.id}`);
    expect(screen.getAllByText(formatCLP(getFinalPrice(firstProduct) * 2)).length).toBeGreaterThan(0);
  });

  it("el botón + suma una unidad y el botón − la resta", async () => {
    seedCart(2);
    await renderWithProviders(<CartPage />);
    fireEvent.click(plus());
    expect(qty()).toBe("3");
    fireEvent.click(minus());
    fireEvent.click(minus());
    expect(qty()).toBe("1");
  });

  it("deshabilita − en 1 unidad", async () => {
    seedCart(1);
    await renderWithProviders(<CartPage />);
    expect(minus().disabled).toBeTrue();
  });

  it("deshabilita + al llegar al stock disponible", async () => {
    seedCart(firstProduct.stock);
    await renderWithProviders(<CartPage />);
    expect(plus().disabled).toBeTrue();
  });

  it("el botón Eliminar quita el producto del carrito", async () => {
    seedCart(1);
    await renderWithProviders(<CartPage />);
    fireEvent.click(remove());
    expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
  });

  describe("vaciar carrito", () => {
    it("vacía el carrito si el usuario confirma", async () => {
      seedCart(1);
      spyOn(window, "confirm").and.returnValue(true);
      await renderWithProviders(<CartPage />);
      fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
      expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
    });

    it("no hace nada si el usuario cancela", async () => {
      seedCart(1);
      spyOn(window, "confirm").and.returnValue(false);
      await renderWithProviders(<CartPage />);
      fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
      expect(screen.queryByText("Tu carrito está vacío.")).toBeNull();
    });
  });

  describe("cupones", () => {
    beforeEach(() => {
      mockLocalStorage({
        gamehub_sesion: JSON.stringify(customer),
        [customerCartKey]: JSON.stringify([{ idProducto: firstProduct.id, cantidad: 1 }]),
      });
    });

    const apply = (code) => {
      fireEvent.change(screen.getByLabelText("Código de cupón"), { target: { value: code } });
      fireEvent.click(screen.getByRole("button", { name: "Aplicar cupón" }));
    };

    it("exige ingresar un código", async () => {
      await renderWithProviders(<CartPage />);
      const validateCoupon = spyOn(gamehubApi, "validarCupon");
      apply("");
      expect(validateCoupon).not.toHaveBeenCalled();
      expect(screen.getByText("El código de cupón es obligatorio.")).toBeTruthy();
    });

    it("informa cuando el cupón no existe", async () => {
      await renderWithProviders(<CartPage />);
      const validateCoupon = spyOn(gamehubApi, "validarCupon").and.rejectWith(new Error("Ese código de cupón no existe."));
      apply("NOEXISTE");
      expect(await screen.findByText("Ese código de cupón no existe.")).toBeTruthy();
      expect(validateCoupon).toHaveBeenCalledWith("NOEXISTE", customer.token);
    });

    it("aplica un cupón válido y refleja el descuento en el resumen", async () => {
      await renderWithProviders(<CartPage />);
      spyOn(gamehubApi, "validarCupon").and.resolveTo(testCoupon);
      apply("GAMER10");
      const expected = Math.min(getFinalPrice(firstProduct) * 0.1, 50000);
      expect(await screen.findByText(`-${formatCLP(expected)}`)).toBeTruthy();
    });
  });

  it("alerta si se intenta ir a checkout con el carrito vacío", async () => {
    mockLocalStorage();
    spyOn(window, "alert");
    await renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByRole("link", { name: "Continuar a checkout" }));
    expect(window.alert).toHaveBeenCalled();
  });
});
