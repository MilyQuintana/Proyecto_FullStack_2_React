import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import OrdersPage from "../../src/pages/OrdersPage";
import { gamehubApi } from "../../src/services/gamehubApi";
import { renderWithProviders } from "../helpers/render.jsx";
import { customer, firstProduct, makeOrder, mockLocalStorage } from "../helpers/mocks.js";

const staff = { id: 7, token: "token-vendedor", rol: "VENDEDOR" };
const openDetail = () => fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));
const reviewButton = () => screen.getByRole("button", { name: `Reseñar ${firstProduct.name}` });

function mockOrders(orders = [], session = customer) {
  const store = mockLocalStorage({ gamehub_sesion: JSON.stringify(session) });
  const listOrders = spyOn(gamehubApi, session.rol === "CLIENTE" ? "misCompras" : "boletas").and.resolveTo(orders);
  return { store, listOrders };
}

describe("OrdersPage", () => {
  it("muestra el estado vacío cuando no hay órdenes", async () => {
    const { listOrders } = mockOrders();
    await renderWithProviders(<OrdersPage />);
    expect(screen.getByText("Todavía no tienes órdenes registradas.")).toBeTruthy();
    expect(listOrders).toHaveBeenCalledOnceWith(customer.token);
  });

  it("lista las órdenes y abre el detalle", async () => {
    mockOrders([makeOrder()]);
    await renderWithProviders(<OrdersPage />);
    expect(screen.getByText("123")).toBeTruthy();
    openDetail();
    expect(screen.getByRole("heading", { name: "Detalle de la orden 123" })).toBeTruthy();
  });

  it("enlaza el producto del detalle a su página", async () => {
    mockOrders([makeOrder()]);
    await renderWithProviders(<OrdersPage />);
    openDetail();
    expect(screen.getByRole("link", { name: firstProduct.name }).getAttribute("href"))
        .toBe(`/producto/${firstProduct.id}`);
  });

  it("muestra el error cuando la API no puede listar las órdenes", async () => {
    const { listOrders } = mockOrders();
    listOrders.and.rejectWith(new Error("No fue posible cargar las órdenes."));
    await renderWithProviders(<OrdersPage />);
    expect(screen.getByText("No fue posible cargar las órdenes.")).toBeTruthy();
    expect(screen.queryByText("Todavía no tienes órdenes registradas.")).toBeNull();
  });

  describe("reseñas del cliente", () => {
    it("no permite reseñar una orden pendiente ni marcarla como entregada", async () => {
      mockOrders([makeOrder()]);
      await renderWithProviders(<OrdersPage />);
      openDetail();
      expect(screen.queryByRole("button", { name: /Reseñar/ })).toBeNull();
      expect(screen.queryByRole("button", { name: "Marcar como entregada" })).toBeNull();
    });

    it("exige que el comentario tenga contenido", async () => {
      const { store } = mockOrders([makeOrder({ estado: "ENTREGADA" })]);
      await renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(reviewButton());
      fireEvent.change(screen.getByLabelText("Comentario"), { target: { value: "   " } });
      fireEvent.click(screen.getByRole("button", { name: "Publicar reseña" }));
      expect(screen.getByText("Escribe un comentario y una puntuación entre 1 y 5.")).toBeTruthy();
      expect(JSON.parse(store.gamehub_resenas)[firstProduct.id]).toBeUndefined();
    });

    it("guarda la puntuación y el comentario de una compra entregada", async () => {
      const { store } = mockOrders([makeOrder({ estado: "ENTREGADA" })]);
      await renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(reviewButton());
      fireEvent.change(screen.getByLabelText("Comentario"), { target: { value: "Excelente producto" } });
      fireEvent.change(screen.getByLabelText("Puntuación"), { target: { value: "4" } });
      fireEvent.click(screen.getByRole("button", { name: "Publicar reseña" }));
      expect(screen.queryByLabelText("Comentario")).toBeNull();
      expect(JSON.parse(store.gamehub_resenas)[firstProduct.id][0])
          .toEqual(jasmine.objectContaining({ rating: 4, comment: "Excelente producto" }));
    });
  });

  describe("pedidos del personal", () => {
    it("muestra los pedidos y el nombre del cliente al vendedor", async () => {
      const { listOrders } = mockOrders([makeOrder()], staff);
      await renderWithProviders(<OrdersPage />);
      expect(listOrders).toHaveBeenCalledOnceWith(staff.token);
      expect(screen.getByRole("heading", { name: "Pedidos" })).toBeTruthy();
      expect(within(screen.getByRole("table")).getByText("Ana Pérez")).toBeTruthy();
    });

    it("marca un pedido como entregado y actualiza el listado desde la API", async () => {
      const { listOrders } = mockOrders([makeOrder()], staff);
      const deliver = spyOn(gamehubApi, "marcarEntregada").and.callFake(async () => {
        listOrders.and.resolveTo([makeOrder({ estado: "ENTREGADA" })]);
      });
      await renderWithProviders(<OrdersPage />);
      openDetail();
      fireEvent.click(screen.getByRole("button", { name: "Marcar como entregada" }));
      await waitFor(() => {
        expect(within(screen.getByRole("table")).getByText("ENTREGADA")).toBeTruthy();
      });
      expect(deliver).toHaveBeenCalledOnceWith(123, staff.token);
      expect(listOrders.calls.count()).toBe(2);
      expect(screen.queryByRole("button", { name: "Marcar como entregada" })).toBeNull();
    });

    it("no ofrece marcar como entregado un pedido cancelado", async () => {
      mockOrders([makeOrder({ estado: "CANCELADA" })], staff);
      await renderWithProviders(<OrdersPage />);
      openDetail();
      expect(screen.queryByRole("button", { name: "Marcar como entregada" })).toBeNull();
    });
  });
});
