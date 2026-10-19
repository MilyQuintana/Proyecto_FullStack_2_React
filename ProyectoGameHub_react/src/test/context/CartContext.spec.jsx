import { act, renderHook } from "@testing-library/react";
import { useCart } from "../../src/context/CartContext";
import { getFinalPrice } from "../../src/utils/format";
import { PRODUCTS } from "../../src/data/catalog";
import { CartWrapper } from "../helpers/render";
import { makeOrder, mockLocalStorage } from "../helpers/mocks";

const [p1, p2] = PRODUCTS;
const setup = () => renderHook(() => useCart(), { wrapper: CartWrapper });

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

  it("addToCart agrega productos y acumula la cantidad del mismo producto", () => {
    const { result } = setup();
    act(() => result.current.addToCart(p1.id, 1));
    act(() => result.current.addToCart(p1.id, 2));
    act(() => result.current.addToCart(p2.id, 1));
    expect(result.current.detailedLines.length).toBe(2);
    expect(result.current.detailedLines[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(4);
  });

  it("calcula subtotal por línea y total", () => {
    const { result } = setup();
    act(() => result.current.addToCart(p1.id, 2));
    const expected = getFinalPrice(p1) * 2;
    expect(result.current.detailedLines[0].subtotal).toBe(expected);
    expect(result.current.subtotal).toBe(expected);
    expect(result.current.total).toBe(expected);
  });

  it("updateQuantity cambia la cantidad y elimina la línea si llega a 0", () => {
    const { result } = setup();
    act(() => result.current.addToCart(p1.id, 1));
    act(() => result.current.updateQuantity(p1.id, 5));
    expect(result.current.itemCount).toBe(5);
    act(() => result.current.updateQuantity(p1.id, 0));
    expect(result.current.detailedLines.length).toBe(0);
  });

  it("removeFromCart quita solo el producto indicado", () => {
    const { result } = setup();
    act(() => {
      result.current.addToCart(p1.id, 1);
      result.current.addToCart(p2.id, 1);
    });
    act(() => result.current.removeFromCart(p1.id));
    expect(result.current.detailedLines.map((line) => line.product.id)).toEqual([p2.id]);
  });

  it("persiste el carrito en localStorage", () => {
    const { result } = setup();
    act(() => result.current.addToCart(p1.id, 2));
    expect(JSON.parse(store.gamehub_carrito)).toEqual([{ idProducto: p1.id, cantidad: 2 }]);
  });

  it("ignora productos del carrito que ya no existen en el catálogo", () => {
    store.gamehub_carrito = JSON.stringify([{ idProducto: 999999, cantidad: 1 }]);
    const { result } = setup();
    expect(result.current.detailedLines.length).toBe(0);
  });

  describe("cupones", () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2026, 5, 15));
    });
    afterEach(() => jasmine.clock().uninstall());

    it("applyCoupon aplica el descuento respetando el tope", () => {
      const { result } = setup();
      act(() => result.current.addToCart(p1.id, 1));
      let response;
      act(() => {
        response = result.current.applyCoupon("GAMER10");
      });
      expect(response.valid).toBeTrue();
      const expected = Math.min(result.current.subtotal * 0.1, 50000);
      expect(result.current.discount).toBe(expected);
      expect(result.current.total).toBe(result.current.subtotal - expected);
    });

    it("un cupón inválido no cambia el descuento", () => {
      const { result } = setup();
      act(() => result.current.addToCart(p1.id, 1));
      act(() => {
        result.current.applyCoupon("FALSO");
      });
      expect(result.current.discount).toBe(0);
    });

    it("clearCart vacía el carrito y quita el cupón", () => {
      const { result } = setup();
      act(() => result.current.addToCart(p1.id, 1));
      act(() => {
        result.current.applyCoupon("GAMER10");
      });
      act(() => result.current.clearCart());
      expect(result.current.itemCount).toBe(0);
      expect(result.current.couponCode).toBeNull();
    });
  });

  it("addOrder agrega al inicio y updateOrder modifica solo la orden indicada", () => {
    const { result } = setup();
    act(() => result.current.addOrder(makeOrder({ numero: "A" })));
    act(() => result.current.addOrder(makeOrder({ numero: "B" })));
    expect(result.current.orders.map((order) => order.numero)).toEqual(["B", "A"]);
    act(() => result.current.updateOrder("A", { estado: "Entregada" }));
    expect(result.current.orders.find((order) => order.numero === "A").estado).toBe("Entregada");
    expect(result.current.orders.find((order) => order.numero === "B").estado).toBe("Pagada");
  });
});
