import express, { Request, Response } from "express";
import { Buffer } from "node:buffer";
import {
  addToQueue,
  search,
  searchResult,
  aaass2,
  updateToken,
} from "./modules/spotify";
import { generateRandomString } from "./utility";
import { GoodToken } from "./middleware";
import SpotifyWebApi from "spotify-web-api-node";
import { copyFileSync } from "node:fs";

require("dotenv").config();

const app = express();

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
const client_id = process.env.ClientID || "";
const client_secret = process.env.ClientSecret || "";

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
    const searchResponse = (await search(
      req.params.query,
      req.app.locals.token
    )) as searchResult;

    res.status(200);

    res.json(searchResponse);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.get("/queue/add/:track_id", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const result = await API.addToQueue(req.params.track_id);
    return res.sendStatus(200);
  } catch {
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

app.get("/login", function (req, res) {
  res.redirect(req.app.locals.loginUri);
});

app.get("/callback/spotify", async function (req, res) {
  try {
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
      res.redirect("/#error=state_mismatch");
    } else {
      if (code) {
        const resGrant = await API.authorizationCodeGrant(code.toString());
        if (resGrant.statusCode === 200) {
          console.log(resGrant.body);

          localStorage.setItem("Token", resGrant.body.access_token);
          localStorage.setItem("UpdateToken", resGrant.body.refresh_token);
          API.setAccessToken(resGrant.body.access_token);
          API.setRefreshToken(resGrant.body.refresh_token);
          return res.sendStatus(200);
        } else {
          return res.sendStatus(401);
        }
      }
    }
    return res.sendStatus(500);
  } catch (e) {
    console.log(e);
    return res.sendStatus(401);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`app is running at port ${process.env.PORT} !`);
});
