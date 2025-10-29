import * as telemetry from "./telemetry.js";
import * as fb from "./firebase.js";

jest.mock("./firebase.js");

describe("telemetry", () => {
  beforeEach(() => jest.resetAllMocks());

  test("logEvent calls addDoc", async () => {
    fb.addDoc = jest.fn().mockResolvedValue({});
    fb.collection = jest.fn(() => ({}));
    await telemetry.logEvent({ level: "info", actor: "u1", event: "accessory.add", payload: { spaceId: "s1" }, source: "test" });
    expect(fb.addDoc).toHaveBeenCalled();
  });

  test("incMetric updates or creates counter", async () => {
    fb.doc = jest.fn(() => ({}));
    fb.updateDoc = jest.fn().mockRejectedValue({ code: "not-found" });
    fb.setDoc = jest.fn().mockResolvedValue({});
    await telemetry.incMetric("accessories_added", 1);
    expect(fb.updateDoc).toHaveBeenCalled();
    expect(fb.setDoc).toHaveBeenCalled();
  });
});