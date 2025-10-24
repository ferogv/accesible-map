//accesorios.test.js
import { addAccessory, removeAccessory, getAccessories } from "./accesorios.js";

describe("Gestión de accesorios", () => {
  const spaceId = "test-space";

  test("agregar accesorio válido", async () => {
    const acc = await addAccessory(spaceId, "Rampa portátil", 2);
    expect(acc.id).toBeDefined();
  });

  test("error al agregar accesorio sin nombre", async () => {
    await expect(addAccessory(spaceId, "", 1))
      .rejects.toThrow("Datos inválidos");
  });

  test("error al agregar accesorio con cantidad <= 0", async () => {
    await expect(addAccessory(spaceId, "Barandal", 0))
      .rejects.toThrow("Datos inválidos");
  });

  test("visualizar accesorios", async () => {
    const list = await getAccessories(spaceId);
    expect(Array.isArray(list)).toBe(true);
  });

  test("eliminar accesorio inexistente", async () => {
    await expect(removeAccessory(spaceId, "fakeId"))
      .rejects.toThrow();
  });
});