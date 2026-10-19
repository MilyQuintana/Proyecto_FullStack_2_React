import {
  email, hasErrors, integerInRange, minLength, phoneCL, rangeCoherence, required, selectRequired,
} from "../../src/utils/validators";

describe("validators", () => {
  describe("required", () => {
    it("devuelve mensaje cuando el valor está vacío o solo tiene espacios", () => {
      expect(required("", "El nombre")).toBe("El nombre es obligatorio.");
      expect(required("   ", "El nombre")).toBe("El nombre es obligatorio.");
      expect(required(undefined)).toBe("Este campo es obligatorio.");
    });

    it("devuelve cadena vacía cuando hay valor", () => {
      expect(required("Ana")).toBe("");
    });
  });

  describe("selectRequired", () => {
    it("exige seleccionar una opción", () => {
      expect(selectRequired("", "Selecciona una región")).toBe("Selecciona una región.");
      expect(selectRequired("valparaiso")).toBe("");
    });
  });

  describe("email", () => {
    it("rechaza correos vacíos o con formato inválido", () => {
      expect(email("")).toContain("obligatorio");
      expect(email("sin-arroba")).toContain("formato válido");
      expect(email("a@b")).toContain("formato válido");
    });

    it("acepta un correo válido (ignorando espacios)", () => {
      expect(email("  nombre@correo.com ")).toBe("");
    });
  });

  describe("phoneCL", () => {
    it("acepta +569 seguido de 8 dígitos, con o sin espacios", () => {
      expect(phoneCL("+56912345678")).toBe("");
      expect(phoneCL("+56 9 1234 5678")).toBe("");
    });

    it("rechaza números con menos o más de 11 dígitos", () => {
      expect(phoneCL("+5691234567")).toContain("11 dígitos");
      expect(phoneCL("+569123456789")).toContain("11 dígitos");
    });

    it("rechaza un prefijo distinto de 569", () => {
      expect(phoneCL("+56212345678")).toContain("+569");
      expect(phoneCL("+54912345678")).toContain("+569");
    });

    it("exige el campo", () => {
      expect(phoneCL("")).toBe("El teléfono es obligatorio.");
    });
  });

  describe("integerInRange", () => {
    it("valida tipo numérico y entero", () => {
      expect(integerInRange("", { label: "La cantidad" })).toBe("La cantidad debe ser un número.");
      expect(integerInRange("abc")).toContain("debe ser un número");
      expect(integerInRange("1.5")).toContain("entero");
    });

    it("valida mínimo y máximo", () => {
      expect(integerInRange("0", { min: 1 })).toContain("no puede ser menor que 1");
      expect(integerInRange("6", { max: 5 })).toContain("no puede ser mayor que 5");
      expect(integerInRange("3", { min: 1, max: 5 })).toBe("");
    });
  });

  describe("minLength", () => {
    it("valida largo mínimo", () => {
      expect(minLength("ab", 3, "El texto")).toBe("El texto debe tener al menos 3 caracteres.");
      expect(minLength("abc", 3)).toBe("");
      expect(minLength("", 3)).toContain("obligatorio");
    });
  });

  describe("rangeCoherence", () => {
    it("falla solo cuando el mínimo supera al máximo", () => {
      expect(rangeCoherence("500", "100", "Rango inválido")).toBe("Rango inválido");
      expect(rangeCoherence("100", "500", "Rango inválido")).toBe("");
    });

    it("ignora el chequeo si falta alguno de los dos valores", () => {
      expect(rangeCoherence("", "100", "x")).toBe("");
      expect(rangeCoherence("100", "", "x")).toBe("");
    });
  });

  describe("hasErrors", () => {
    it("detecta si algún campo tiene error", () => {
      expect(hasErrors({ a: "", b: "" })).toBeFalse();
      expect(hasErrors({ a: "", b: "Error" })).toBeTrue();
    });
  });
});
