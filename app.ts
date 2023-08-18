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
require("dotenv").config();

const app = express();

enum platform {
  SPOTIFY = "spotify",
  YOUTUBE_MUSIC = "youtube-music",
}

const PLATFORM = platform.SPOTIFY;

app.locals.token = "";
app.use(GoodToken);

const redirect_uri = "http://lcoalhost:9000/callback/spotify";
const client_id = process.env.ClientID || "";
const client_secret = process.env.ClientSecret || "";

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
  const sd = await aaass2(req.app.locals.token);
  console.log(sd);
  // const result = await addToQueue("", req.app.locals.token);
  // console.log(result);
  return res.sendStatus(200);
});

app.get("/login", function (req, res) {
  console.log("client id : " + client_id);
  var state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`
  );
});

app.get("/callback/spotify", function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect("/#error=state_mismatch");
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };
  }
});

app.listen(process.env.PORT, () => {
  console.log(`app is running at port ${process.env.PORT} !`);
});
