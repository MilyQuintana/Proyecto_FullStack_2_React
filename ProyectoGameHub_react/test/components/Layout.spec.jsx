import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import Layout from "../../src/components/Layout";
import { renderWithProviders } from "../helpers/render.jsx";
import { guestCartKey, mockLocalStorage } from "../helpers/mocks.js";

function renderLayout(route = "/") {
  return renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<p>contenido inicio</p>} />
          <Route path="catalogo" element={<p>contenido catalogo</p>} />
        </Route>
      </Routes>,
      { route }
  );
}

describe("Layout", () => {
  beforeEach(() => {
    spyOn(window, "scrollTo");
    mockLocalStorage({ [guestCartKey]: JSON.stringify([{ idProducto: 1, cantidad: 2 }, { idProducto: 2, cantidad: 1 }]) });
  });

  it("muestra la ruta hija dentro de <main>", async () => {
    await renderLayout();
    expect(screen.getByRole("main").textContent).toContain("contenido inicio");
  });

  it("el badge del carrito suma las unidades", async () => {
    await renderLayout();
    expect(screen.getByLabelText("Ver carrito de compras").textContent).toContain("3");
  });

  it("el menú móvil se abre y cierra con el botón hamburguesa", async () => {
    const { container } = await renderLayout();
    const toggle = screen.getByLabelText("Mostrar menú de navegación");
    const menu = container.querySelector("#menu-principal");
    expect(menu.classList.contains("show")).toBeFalse();
    fireEvent.click(toggle);
    expect(menu.classList.contains("show")).toBeTrue();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(toggle);
    expect(menu.classList.contains("show")).toBeFalse();
  });

  it("navega, marca el enlace activo y vuelve al inicio de la página", async () => {
    await renderLayout();
    fireEvent.click(screen.getAllByRole("link", { name: "Catálogo" })[0]);
    expect(screen.getByRole("main").textContent).toContain("contenido catalogo");
    expect(screen.getAllByRole("link", { name: "Catálogo" })[0].classList.contains("active")).toBeTrue();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
