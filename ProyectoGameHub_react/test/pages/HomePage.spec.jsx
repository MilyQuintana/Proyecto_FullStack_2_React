import { fireEvent, screen } from "@testing-library/react";
import HomePage, { NewsletterForm } from "../../src/pages/HomePage";
import { renderWithProviders } from "../helpers/render.jsx";
import { mockLocalStorage } from "../helpers/mocks.js";

describe("HomePage", () => {
  beforeEach(() => mockLocalStorage());

  it("muestra el banner, el carrusel de categorías y hasta 4 productos destacados", () => {
    const { container } = renderWithProviders(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "GameHub Store" })).toBeTruthy();
    expect(container.querySelector(".carousel")).not.toBeNull();
    const cards = container.querySelectorAll(".tarjeta-producto");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(4);
  });

  describe("NewsletterForm", () => {
    const submit = (value) => {
      fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value } });
      fireEvent.click(screen.getByRole("button", { name: "Suscribirse" }));
    };

    it("muestra error con un correo inválido", () => {
      renderWithProviders(<NewsletterForm />);
      submit("malo");
      expect(screen.getByText(/formato válido/)).toBeTruthy();
      expect(screen.queryByText("¡Gracias por suscribirte!")).toBeNull();
    });

    it("confirma la suscripción y limpia el campo con un correo válido", () => {
      renderWithProviders(<NewsletterForm />);
      submit("ana@correo.cl");
      expect(screen.getByText("¡Gracias por suscribirte!")).toBeTruthy();
      expect(screen.getByLabelText("Correo electrónico").value).toBe("");
    });
  });
});
