import SpotifyWebApi from "spotify-web-api-node";
import { WebSocketServer, WebSocket } from "ws";
import { User } from "./User";

interface countInterface {
  addUser: (User: User) => boolean;
  removeUser: (User: User) => boolean;
  removeVotes: (userid: string) => void;
}

export const SocketServer = (
  API: SpotifyWebApi,
  { addUser, removeUser, removeVotes }: countInterface
) => {
  const server = new WebSocketServer({
    port: process.env.WebSocketPORT ? +process.env.WebSocketPORT : 3000,
    verifyClient: async (info, callback) => {
      if (
        !process.env.development &&
        info.req.headers.host !== process.env.APP_HOST
      )
        callback(false, 401, "bad origin");
      !process.env.development &&
        !info.secure &&
        callback(false, 400, "not secure");
      callback(true, 200);
    },
  });

  server.on("connection", (socket, req) => {
    const user = new User(socket);
    addUser(user);
    socket.send(
      JSON.stringify({
        userid: user.getId(),
      })
    );
    socket.on("message", async (message) => {});
    socket.on("close", async () => {
      removeUser(user);
      removeVotes(user.getId());
    });
  });
};
