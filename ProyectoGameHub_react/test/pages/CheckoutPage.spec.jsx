import { fireEvent, screen } from "@testing-library/react";
import { gamehubApi } from "../../src/services/gamehubApi";
import CheckoutPage, { formatPhoneDigits } from "../../src/pages/CheckoutPage";
import { renderWithProviders } from "../helpers/render.jsx";
import { customer, customerCartKey, firstProduct, mockLocalStorage } from "../helpers/mocks.js";

const phoneInput = () => screen.getByLabelText("Teléfono");
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function fillValidForm(phone = "12345678") {
  type("Nombre completo", "Ana Pérez");
  type("Correo electrónico", "ana@correo.cl");
  type("Teléfono", phone);
  type("Región", "valparaiso");
  type("Comuna", "Viña del Mar");
  type("Dirección", "Calle 123");
}

describe("CheckoutPage", () => {
  let store;

  beforeEach(() => {
    store = mockLocalStorage({
      gamehub_sesion: JSON.stringify(customer),
      [customerCartKey]: JSON.stringify([{ idProducto: firstProduct.id, cantidad: 1 }]),
    });
  });

  describe("teléfono (+569 + 8 dígitos)", () => {
    it("muestra el prefijo fijo +56 9", async () => {
      await renderWithProviders(<CheckoutPage />);
      expect(screen.getByText("+56 9")).toBeTruthy();
    });

    it("formatea como 1234 5678 mientras se escribe", async () => {
      await renderWithProviders(<CheckoutPage />);
      fireEvent.change(phoneInput(), { target: { value: "12345678" } });
      expect(phoneInput().value).toBe("1234 5678");
    });

    it("descarta letras y limita a 8 dígitos", async () => {
      await renderWithProviders(<CheckoutPage />);
      fireEvent.change(phoneInput(), { target: { value: "12ab34567899" } });
      expect(phoneInput().value).toBe("1234 5678");
    });

    it("al pegar un número con el prefijo completo lo recorta", async () => {
      await renderWithProviders(<CheckoutPage />);
      fireEvent.change(phoneInput(), { target: { value: "+56987654321" } });
      expect(phoneInput().value).toBe("8765 4321");
    });

    it("formatPhoneDigits agrupa en bloques de 4", () => {
      expect(formatPhoneDigits("1234")).toBe("1234");
      expect(formatPhoneDigits("12345")).toBe("1234 5");
    });
  });

  describe("validación del formulario", () => {
    it("muestra errores en los campos obligatorios vacíos", async () => {
      await renderWithProviders(<CheckoutPage />);
      fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));
      expect(screen.getByText("El nombre completo es obligatorio.")).toBeTruthy();
      expect(screen.getByText("El teléfono es obligatorio.")).toBeTruthy();
      expect(screen.getByText("Selecciona una región.")).toBeTruthy();
    });

    it("rechaza un teléfono con menos de 8 dígitos", async () => {
      await renderWithProviders(<CheckoutPage />);
      fillValidForm("1234567");
      fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));
      expect(screen.getByText(/El teléfono debe tener 11 dígitos/)).toBeTruthy();
      expect(screen.queryByText("¡Compra confirmada!")).toBeNull();
    });

    it("rechaza un correo inválido", async () => {
      await renderWithProviders(<CheckoutPage />);
      fillValidForm();
      type("Correo electrónico", "malcorreo");
      fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));
      expect(screen.getByText(/formato válido/)).toBeTruthy();
    });
  });

  describe("confirmación de compra", () => {
    it("crea la boleta, actualiza el catálogo y vacía el carrito", async () => {
      const crearBoleta = spyOn(gamehubApi, "crearBoleta").and.resolveTo({ id: 123, total: 1000 });
      await renderWithProviders(<CheckoutPage />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));

      expect(await screen.findByText("¡Compra confirmada!")).toBeTruthy();
      expect(crearBoleta).toHaveBeenCalledOnceWith([{ productoId: firstProduct.id, cantidad: 1 }], customer.token, "");
      expect(gamehubApi.productos.calls.count()).toBe(2);
      expect(JSON.parse(store[customerCartKey])).toEqual([]);
    });
  });

  it("con el carrito vacío deshabilita el botón de confirmar", async () => {
    store[customerCartKey] = "[]";
    await renderWithProviders(<CheckoutPage />);
    expect(screen.getByRole("button", { name: "Confirmar compra" }).disabled).toBeTrue();
    expect(screen.getByText(/Tu carrito está vacío/)).toBeTruthy();
  });
});
