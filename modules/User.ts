import { randomUUID } from "crypto";
import WebSocket from "ws";

export class User {
  private id = randomUUID();
  private socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  getId = () => this.id;

  getSocket = () => this.socket;
}
