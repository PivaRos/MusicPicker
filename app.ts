import express, { Request, Response } from "express";
import { Buffer } from "node:buffer";
import {
  addToQueue,
  search,
  searchResult,
  aaass2,
  updateToken,
  image,
} from "./modules/spotify";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import session from "express-session";
import AuthRouter from "./routers/auth";
import AdminRouter from "./routers/admin";

import callbackRouter from "./routers/callback";
import { appConfig } from "./interfaces";
import { checkWasAdded } from "./middleware";
import { refreshAccessToken } from "./utility";

require("dotenv").config();

const app = express();

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

app.get("/queue/add/:track_id", checkWasAdded, async (req: any, res: any) => {
  try {
    const uri = req.params.track_id.split(":");
    if (uri[1] !== "track" || uri[0] !== "spotify")
      return [res.status(400), res.json({ message: "bad track uri" })];
    const API = req.app.locals.API as SpotifyWebApi;
    const track = await API.getTrack(uri[2]);

    const album = await API.getAlbum(track.body.album.id);
    let found = appConfig.genres ? false : true;
    if (appConfig.genres) {
      album.body.genres.map((genre) => {
        if (appConfig.genres && appConfig.genres.includes(genre)) {
          found = true;
        }
      });
    }
    if (found) {
      const result = await API.addToQueue(req.params.track_id);
      if (result.statusCode === 204) {
        req.session.TrackAddedToQueue = req.params.track_id;
      }
      return res.sendStatus(200);
    } else {
      return [
        res.status(400),
        res.json({
          message: "track's genre not allowed",
        }),
      ];
    }
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

app.get("/queue/current", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
  } catch {
    res.sendStatus(500);
  }
});

app.get("/palyer/skip", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    API.skipToNext();
    return res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.get("/player/current", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const result = await API.getMyCurrentPlayingTrack();
    let genres;
    if (result.body.currently_playing_type === "track" && result.body.item) {
      const track = await API.getTrack(result.body.item.id);
      genres = (await API.getAlbum(track.body.album.id)).body.genres;
    }
    return res.json({
      currentlyPlaying: result.body.is_playing,
      uri: result.body.item?.uri,
      name: result.body.item?.name,
      genres,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/success", async (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "/rawHTML/success.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`app is running at port ${process.env.PORT} !`);
});
