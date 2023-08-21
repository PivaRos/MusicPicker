import express, { Request, Response } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import session from "express-session";
import AuthRouter from "./routers/auth";
import AdminRouter from "./routers/admin";
import QueueRouter from "./routers/queue";
import callbackRouter from "./routers/callback";
import { appConfig, image } from "./interfaces";
import { refreshAccessToken } from "./utility";
import PlayerRouter from "./routers/player";

require("dotenv").config();

var scopes = [
  "user-read-private",
  "user-read-email",
  "user-modify-playback-state",
  "app-remote-control",
  "streaming",
  "user-read-currently-playing",
  "user-read-playback-state",
];
var state = "some-state-of-my-choice";

const app = express();

app.use(express.json());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", AuthRouter);
app.use("/callback", callbackRouter);
app.use("/admin", AdminRouter);
app.use("/queue", QueueRouter);
app.use("/player", PlayerRouter);

var localStorage: any = null;
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

let appConfig = require("./DefaultAppConfig.json") as appConfig;
app.locals.appConfig = appConfig;

const redirect_route = process.env.redirect_route;
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

const API = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: "http://localhost:" + process.env.PORT + redirect_route,
});
app.locals.API = API;

refreshAccessToken(API);
app.locals.loginUri = API.createAuthorizeURL(scopes, state, true);

app.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const searchResponse = await API.searchTracks(req.params.query);

    res.status(200);
    if (!searchResponse.body.tracks)
      return [res.status(200), res.json({ message: "no tracks found" })];
    res.json(
      searchResponse.body.tracks.items.map((track) => {
        return {
          uri: track.uri,
          name: track.name,
          artists: track.artists.map((artist) => {
            return artist.name;
          }),
          images: track.album.images as image[],
          genres: track.album.genres,
        };
      })
    );
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.get("/success", async (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "/rawHTML/success.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`\u001b[1;42m app is running at port ${process.env.PORT} !`);
});
