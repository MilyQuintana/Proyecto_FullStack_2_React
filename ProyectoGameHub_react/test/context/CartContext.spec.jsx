import { act, renderHook } from "@testing-library/react";
import { useAuth } from "../../src/context/AuthContext";
import { gamehubApi } from "../../src/services/gamehubApi";
import { useCart } from "../../src/context/CartContext";
import { getFinalPrice } from "../../src/utils/format";
import { PRODUCTS } from "../../src/data/catalog";
import { renderCartHook } from "../helpers/render.jsx";
import { customer, customerCartKey, guestCartKey, mockLocalStorage, testCoupon } from "../helpers/mocks.js";

const [p1, p2] = PRODUCTS;
const setup = () => renderCartHook(useCart);

describe("CartContext", () => {
  let store;

  beforeEach(() => {
    store = mockLocalStorage();
  });

  it("lanza un error si useCart se usa fuera del provider", () => {
    // React en modo desarrollo reporta el error también como evento global: se silencia solo aquí.
    const previousOnError = window.onerror;
    window.onerror = () => true;
    spyOn(console, "error");
    try {
      expect(() => renderHook(() => useCart())).toThrowError(/CartProvider/);
    } finally {
      window.onerror = previousOnError;
    }
  });

  it("addToCart agrega productos y acumula la cantidad del mismo producto", async () => {
    const { result } = await setup();
    act(() => result.current.addToCart(p1.id, 1));
    act(() => result.current.addToCart(p1.id, 2));
    act(() => result.current.addToCart(p2.id, 1));
    expect(result.current.detailedLines.length).toBe(2);
    expect(result.current.detailedLines[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(4);
  });

  it("calcula subtotal por línea y total", async () => {
    const { result } = await setup();
    act(() => result.current.addToCart(p1.id, 2));
    const expected = getFinalPrice(p1) * 2;
    expect(result.current.detailedLines[0].subtotal).toBe(expected);
    expect(result.current.subtotal).toBe(expected);
    expect(result.current.total).toBe(expected);
  });

  it("updateQuantity cambia la cantidad y elimina la línea si llega a 0", async () => {
    const { result } = await setup();
    act(() => result.current.addToCart(p1.id, 1));
    act(() => result.current.updateQuantity(p1.id, 5));
    expect(result.current.itemCount).toBe(5);
    act(() => result.current.updateQuantity(p1.id, 0));
    expect(result.current.detailedLines.length).toBe(0);
  });

  it("removeFromCart quita solo el producto indicado", async () => {
    const { result } = await setup();
    act(() => {
      result.current.addToCart(p1.id, 1);
      result.current.addToCart(p2.id, 1);
    });
    act(() => result.current.removeFromCart(p1.id));
    expect(result.current.detailedLines.map((line) => line.product.id)).toEqual([p2.id]);
  });

  it("persiste el carrito en localStorage", async () => {
    const { result } = await setup();
    act(() => result.current.addToCart(p1.id, 2));
    expect(JSON.parse(store[guestCartKey])).toEqual([{ idProducto: p1.id, cantidad: 2 }]);
  });

  it("ignora productos del carrito que ya no existen en el catálogo", async () => {
    store[guestCartKey] = JSON.stringify([{ idProducto: 999999, cantidad: 1 }]);
    const { result } = await setup();
    expect(result.current.detailedLines.length).toBe(0);
  });

  describe("cupones", () => {
    beforeEach(() => {
      store.gamehub_sesion = JSON.stringify(customer);
    });

    it("applyCoupon aplica el descuento respetando el tope", async () => {
      const validateCoupon = spyOn(gamehubApi, "validarCupon").and.resolveTo(testCoupon);
      const { result } = await setup();
      act(() => result.current.addToCart(p1.id, 2));
      let response;
      await act(async () => {
        response = await result.current.applyCoupon("GAMER10");
      });
      expect(validateCoupon).toHaveBeenCalledOnceWith("GAMER10", customer.token);
      expect(response.valid).toBeTrue();
      expect(result.current.subtotal * 0.1).toBeGreaterThan(testCoupon.tope);
      expect(result.current.discount).toBe(testCoupon.tope);
      expect(result.current.total).toBe(result.current.subtotal - testCoupon.tope);
    });

    it("un cupón inválido no cambia el descuento", async () => {
      spyOn(gamehubApi, "validarCupon").and.rejectWith(new Error("Cupón no válido."));
      const { result } = await setup();
      act(() => result.current.addToCart(p1.id, 1));
      let response;
      await act(async () => {
        response = await result.current.applyCoupon("FALSO");
      });
      expect(response).toEqual({ valid: false, reason: "Cupón no válido." });
      expect(result.current.discount).toBe(0);
    });

    it("clearCart vacía el carrito y quita el cupón", async () => {
      spyOn(gamehubApi, "validarCupon").and.resolveTo(testCoupon);
      const { result } = await setup();
      act(() => result.current.addToCart(p1.id, 1));
      await act(async () => {
        await result.current.applyCoupon("GAMER10");
      });
      expect(result.current.couponCode).toBe("GAMER10");
      act(() => result.current.clearCart());
      expect(result.current.itemCount).toBe(0);
      expect(result.current.couponCode).toBe("");
    });
  });

  it("mantiene separados los carritos de invitado y cliente al iniciar y cerrar sesión", async () => {
    const guestLines = [{ idProducto: p1.id, cantidad: 2 }];
    const customerLines = [{ idProducto: p2.id, cantidad: 1 }];
    store[guestCartKey] = JSON.stringify(guestLines);
    store[customerCartKey] = JSON.stringify(customerLines);
    spyOn(gamehubApi, "login").and.resolveTo(customer);

    const { result } = await renderCartHook(() => ({ cart: useCart(), auth: useAuth() }));
    expect(result.current.cart.detailedLines[0].product.id).toBe(p1.id);
    await act(async () => {
      await result.current.auth.login("cliente@example.test", "demo");
    });
    expect(result.current.cart.detailedLines[0].product.id).toBe(p2.id);
    act(() => result.current.auth.logout());
    expect(result.current.cart.detailedLines[0].product.id).toBe(p1.id);
    expect(JSON.parse(store[guestCartKey])).toEqual(guestLines);
    expect(JSON.parse(store[customerCartKey])).toEqual(customerLines);
  });
});
