import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CategoryCarousel from "../../src/components/CategoryCarousel";
import { CATEGORIES } from "../../src/data/catalog";

const activeSlide = (container) => container.querySelector(".carousel-item.active");

describe("CategoryCarousel", () => {
  let container;

  beforeEach(() => {
    jasmine.clock().install();
    ({ container } = render(
      <MemoryRouter>
        <CategoryCarousel />
      </MemoryRouter>
    ));
  });

  afterEach(() => jasmine.clock().uninstall());

  it("renderiza una diapositiva por categoría y activa la primera", () => {
    expect(container.querySelectorAll(".carousel-item").length).toBe(CATEGORIES.length);
    expect(activeSlide(container).textContent).toContain(CATEGORIES[0].name);
  });

  it("avanza y retrocede con los botones (de forma circular)", () => {
    fireEvent.click(screen.getByLabelText("Categoría siguiente"));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[1].name);
    fireEvent.click(screen.getByLabelText("Categoría anterior"));
    fireEvent.click(screen.getByLabelText("Categoría anterior"));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[CATEGORIES.length - 1].name);
  });

  it("salta a la categoría elegida con los indicadores", () => {
    fireEvent.click(screen.getByLabelText("Ir a categoría 3"));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[2].name);
    expect(screen.getByLabelText("Ir a categoría 3").getAttribute("aria-current")).toBe("true");
  });

  it("avanza solo cada 4 segundos", () => {
    act(() => jasmine.clock().tick(4000));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[1].name);
  });

  it("se pausa al pasar el mouse y se reanuda al salir", () => {
    const root = container.firstChild;
    fireEvent.mouseEnter(root);
    act(() => jasmine.clock().tick(9000));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[0].name);
    fireEvent.mouseLeave(root);
    act(() => jasmine.clock().tick(4000));
    expect(activeSlide(container).textContent).toContain(CATEGORIES[1].name);
  });

  it("cada diapositiva enlaza al catálogo filtrado por categoría", () => {
    const link = activeSlide(container).querySelector("a");
    expect(link.getAttribute("href")).toBe(`/catalogo?categoria=${encodeURIComponent(CATEGORIES[0].id)}`);
  });
});
