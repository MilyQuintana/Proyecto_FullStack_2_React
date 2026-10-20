import { validateCoupon } from "../../src/utils/coupons";

describe("validateCoupon", () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 5, 15)); // 15-jun-2026: GAMER10 y BIENVENIDO15 vigentes
  });

  afterEach(() => jasmine.clock().uninstall());

  it("acepta un cupón vigente sin importar mayúsculas/minúsculas", () => {
    const result = validateCoupon("gamer10");
    expect(result.valid).toBeTrue();
    expect(result.coupon.percentage).toBe(10);
  });

  it("rechaza un código inexistente", () => {
    const result = validateCoupon("NOEXISTE");
    expect(result.valid).toBeFalse();
    expect(result.reason).toBe("Ese código de cupón no existe.");
    expect(result.coupon).toBeNull();
  });

  it("rechaza un cupón vencido", () => {
    jasmine.clock().mockDate(new Date(2026, 9, 1)); // 1-oct-2026: BIENVENIDO15 venció el 1-ago
    const result = validateCoupon("BIENVENIDO15");
    expect(result.valid).toBeFalse();
    expect(result.reason).toContain("vencido");
  });

  it("rechaza un cupón que aún no está vigente", () => {
    jasmine.clock().mockDate(new Date(2025, 11, 31));
    expect(validateCoupon("GAMER10").valid).toBeFalse();
  });
});
