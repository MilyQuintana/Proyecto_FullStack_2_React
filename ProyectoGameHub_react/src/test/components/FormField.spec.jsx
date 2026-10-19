import { render, screen } from "@testing-library/react";
import FormField, { controlClass } from "../../src/components/FormField";

describe("FormField", () => {
  it("asocia la etiqueta con el control mediante htmlFor", () => {
    render(
      <FormField id="campo" label="Nombre">
        <input id="campo" />
      </FormField>
    );
    expect(screen.getByLabelText("Nombre").id).toBe("campo");
  });

  it("muestra el texto de ayuda cuando se entrega", () => {
    render(
      <FormField id="campo" label="Nombre" help="Escribe tu nombre">
        <input id="campo" />
      </FormField>
    );
    expect(screen.getByText("Escribe tu nombre").className).toContain("form-text");
  });

  it("expone el error en una región role=alert", () => {
    render(
      <FormField id="campo" label="Nombre" error="Es obligatorio">
        <input id="campo" />
      </FormField>
    );
    expect(screen.getByRole("alert").textContent).toBe("Es obligatorio");
  });

  it("controlClass agrega is-invalid solo cuando hay error", () => {
    expect(controlClass("")).toBe("form-control");
    expect(controlClass("mal")).toBe("form-control is-invalid");
    expect(controlClass("mal", "form-select")).toBe("form-select is-invalid");
  });
});
