import { readStorage, removeStorage, writeStorage } from "../../src/utils/storage";
import { mockLocalStorage } from "../helpers/mocks";

describe("storage (con localStorage simulado)", () => {
  it("writeStorage serializa a JSON y readStorage lo recupera", () => {
    const store = mockLocalStorage();
    writeStorage("clave", { a: 1 });
    expect(Storage.prototype.setItem).toHaveBeenCalledWith("clave", '{"a":1}');
    expect(store.clave).toBe('{"a":1}');
    expect(readStorage("clave", null)).toEqual({ a: 1 });
  });

  it("readStorage devuelve el valor por defecto si la clave no existe", () => {
    mockLocalStorage();
    expect(readStorage("nada", ["x"])).toEqual(["x"]);
  });

  it("readStorage devuelve el valor por defecto si el JSON está corrupto", () => {
    mockLocalStorage({ rota: "{no-json" });
    spyOn(console, "error");
    expect(readStorage("rota", 42)).toBe(42);
    expect(console.error).toHaveBeenCalled();
  });

  it("writeStorage no lanza si el almacenamiento falla (cuota llena)", () => {
    spyOn(Storage.prototype, "setItem").and.throwError("QuotaExceeded");
    spyOn(console, "error");
    expect(() => writeStorage("k", 1)).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it("removeStorage elimina la clave", () => {
    const store = mockLocalStorage({ k: "1" });
    removeStorage("k");
    expect(store.k).toBeUndefined();
  });
});
