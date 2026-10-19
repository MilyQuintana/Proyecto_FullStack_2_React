import { formatCLP, getFinalPrice } from "../../src/utils/format";

describe("format", () => {
  it("formatCLP entrega moneda chilena sin decimales", () => {
    const text = formatCLP(1390000).replace(/\s/g, " ");
    expect(text).toContain("$");
    expect(text).toContain("1.390.000");
    expect(text).not.toContain(",");
  });

  it("getFinalPrice usa el precio con descuento cuando existe", () => {
    expect(getFinalPrice({ regularPrice: 1000, discountPrice: 800 })).toBe(800);
  });

  it("getFinalPrice usa el precio regular cuando no hay descuento", () => {
    expect(getFinalPrice({ regularPrice: 1000 })).toBe(1000);
    expect(getFinalPrice({ regularPrice: 1000, discountPrice: null })).toBe(1000);
  });
});
