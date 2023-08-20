import express, { Request, Response } from "express";
import { Buffer } from "node:buffer";
import {
  addToQueue,
  search,
  searchResult,
  aaass2,
  updateToken,
} from "./modules/spotify";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import session from "express-session";

require("dotenv").config();

const app = express();

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

import AuthRouter from "./routers/auth";
import callbackRouter from "./routers/callback";

app.use("/auth", AuthRouter);
app.use("/callback", callbackRouter);

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

enum platform {
  SPOTIFY = "spotify",
  YOUTUBE_MUSIC = "youtube-music",
}

const PLATFORM = platform.SPOTIFY;

var redirect_uri = "http://localhost:9000/callback/spotify";
const client_id = process.env.client_id || "";
const client_secret = process.env.client_secret || "";

const API = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri,
});

const Token = localStorage.getItem("Token");
const UpdateToken = localStorage.getItem("UpdateToken");

if (Token && UpdateToken) {
  API.setAccessToken(Token);
  API.setRefreshToken(UpdateToken);
}

var scopes = [
  "user-read-private",
  "user-read-email",
  "user-modify-playback-state",
];
var state = "some-state-of-my-choice";
app.locals.loginUri = API.createAuthorizeURL(scopes, state, true);

app.locals.API = API;

app.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const searchResponse = await API.searchTracks(req.params.query);
    res.status(200);

    res.json(searchResponse);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.get("/test", (req: Request, res: Response) => {
  return res.sendStatus(200);
});

app.get("/queue/add/:track_id", async (req: Request, res: Response) => {
  try {
    const uri = req.params.track_id.split(":");
    if (uri[1] !== "track" || uri[0] !== "spotify")
      return [res.status(400), res.json({ message: "bad track uri" })];
    const API = req.app.locals.API as SpotifyWebApi;
    const track = await API.getTrack(uri[2]);
    console.log(track.body.genres);
    const result = await API.addToQueue(req.params.track_id);
    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/player/pause", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    API.pause();

    return res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.get("/success", async (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "/rawHTML/success.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`app is running at port ${process.env.PORT} !`);
});
