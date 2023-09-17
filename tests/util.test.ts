import { authorize } from "../utility";
import Request from "supertest";
import app from "../musicpicker";
import { getLocal } from "mockttp";

const mockServer = getLocal();

beforeAll(async () => {
  await mockServer.start();
});
afterAll(async () => await mockServer.stop());

test("test authorize function", async () => {
  await authorize(app);
  await expect(app.locals.lisence.authorized).toBe(true);
});
