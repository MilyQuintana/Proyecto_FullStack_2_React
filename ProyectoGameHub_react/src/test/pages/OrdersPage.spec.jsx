import { fireEvent, screen } from "@testing-library/react";
import OrdersPage from "../../src/pages/OrdersPage";
import { renderWithProviders } from "../helpers/render";
import { firstProduct, makeOrder, mockLocalStorage } from "../helpers/mocks";

const seedOrders = (...orders) => mockLocalStorage({ gamehub_ordenes: JSON.stringify(orders) });
const openDetail = () => fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));
const reviewButton = () => screen.getByRole("button", { name: "Escribir reseña" });
const delivered = () =>
  makeOrder({ estado: "Entregada", despacho: { ...makeOrder().despacho, estado: "Entregado" } });

describe("OrdersPage", () => {
  it("muestra el estado vacío cuando no hay órdenes", () => {
    mockLocalStorage();
    renderWithProviders(<OrdersPage />);
    expect(screen.getByText("Todavía no tienes órdenes registradas.")).toBeTruthy();
  });

  it("lista las órdenes y abre el detalle", () => {
    seedOrders(makeOrder());
    renderWithProviders(<OrdersPage />);
    expect(screen.getByText("GH-00000001")).toBeTruthy();
    openDetail();
    expect(screen.getByRole("heading", { name: "Detalle de la orden GH-00000001" })).toBeTruthy();
  });

  it("el nombre del producto en el detalle es un hipervínculo a su página", () => {
    seedOrders(makeOrder());
    renderWithProviders(<OrdersPage />);
    openDetail();
    const link = screen.getByRole("link", { name: firstProduct.name });
    expect(link.getAttribute("href")).toBe(`/producto/${firstProduct.id}`);
  });

  describe("reseñas solo con pedido entregado", () => {
    it("deshabilita 'Escribir reseña' si el pedido no está entregado", () => {
      seedOrders(makeOrder());
      renderWithProviders(<OrdersPage />);
      openDetail();
      expect(reviewButton().disabled).toBeTrue();
      expect(screen.getByText(/cuando el pedido esté entregado/)).toBeTruthy();
    });

    it("marcar como entregado habilita la reseña", () => {
      seedOrders(makeOrder());
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(screen.getByRole("button", { name: /Marcar como entregado/ }));
      expect(reviewButton().disabled).toBeFalse();
      expect(screen.getByText("Entregado", { exact: false })).toBeTruthy();
    });

    it("exige comentario y guarda la reseña cuando el pedido está entregado", () => {
      const store = seedOrders(delivered());
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(reviewButton());

      fireEvent.click(screen.getByRole("button", { name: "Enviar reseña" }));
      expect(screen.getByText("El comentario es obligatorio.")).toBeTruthy();

      fireEvent.change(screen.getByLabelText(/Reseña para/), { target: { value: "Excelente producto" } });
      fireEvent.change(screen.getByLabelText("Puntuación (1 a 5)"), { target: { value: "4" } });
      fireEvent.click(screen.getByRole("button", { name: "Enviar reseña" }));

      expect(screen.getByText("¡Gracias por tu reseña!")).toBeTruthy();
      const saved = JSON.parse(store.gamehub_resenas);
      expect(saved[firstProduct.id][0]).toEqual(jasmine.objectContaining({ rating: 4, comment: "Excelente producto" }));
      expect(JSON.parse(store.gamehub_ordenes)[0].productos[0].resenada).toBeTrue();
    });

    it("rechaza una puntuación fuera de 1 a 5", () => {
      seedOrders(delivered());
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(reviewButton());
      fireEvent.change(screen.getByLabelText(/Reseña para/), { target: { value: "ok" } });
      fireEvent.change(screen.getByLabelText("Puntuación (1 a 5)"), { target: { value: "9" } });
      fireEvent.click(screen.getByRole("button", { name: "Enviar reseña" }));
      expect(screen.getByText("La puntuación no puede ser mayor que 5.")).toBeTruthy();
    });
  });

  describe("garantía", () => {
    it("exige el motivo", () => {
      seedOrders(makeOrder());
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(screen.getByRole("button", { name: "Solicitar garantía" }));
      fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
      expect(screen.getByText("El motivo de la garantía es obligatorio.")).toBeTruthy();
    });

    it("registra la solicitud dentro del plazo de 30 días", () => {
      const store = seedOrders(makeOrder());
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(screen.getByRole("button", { name: "Solicitar garantía" }));
      fireEvent.change(screen.getByLabelText("Motivo de la garantía"), { target: { value: "No enciende" } });
      fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
      expect(JSON.parse(store.gamehub_ordenes)[0].garantia.estado).toBe("En revisión");
    });

    it("rechaza la solicitud si la orden tiene más de 30 días", () => {
      seedOrders(makeOrder({ fecha: "2020-01-01" }));
      renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(screen.getByRole("button", { name: "Solicitar garantía" }));
      fireEvent.change(screen.getByLabelText("Motivo de la garantía"), { target: { value: "Falla" } });
      fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
      expect(screen.getByText(/ya venció/)).toBeTruthy();
    });
  });
});
