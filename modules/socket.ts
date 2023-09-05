import SpotifyWebApi from "spotify-web-api-node";
import { WebSocketServer, WebSocket } from "ws";
import { User } from "./User";

interface countInterface {
  addUser: (User: User) => boolean;
  removeUser: (User: User) => boolean;
}

export const SocketServer = (
  API: SpotifyWebApi,
  { addUser, removeUser }: countInterface
) => {
  const server = new WebSocketServer({
    port: process.env.WebSocketPORT ? +process.env.WebSocketPORT : 3000,
    host: process.env.WebSocketHOST ? process.env.WebSocketHOST : "0.0.0.0",
    verifyClient: async (info, callback) => {
      callback(true, 200);
    },
  });

  server.on("connection", (socket, req) => {
    const user = new User();
    addUser(user);
    socket.on("message", async (message) => {});
    socket.on("close", async () => {
      removeUser(user);
    });
  });
};
