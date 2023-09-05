import { randomUUID } from "crypto";

export class User {
  private id = randomUUID();

  constructor() {}

  getId = () => {
    return this.id;
  };
}
