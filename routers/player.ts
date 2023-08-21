import { Request, Response, Router } from "express";
import path from "path";
import SpotifyWebApi from "spotify-web-api-node";
import { IsAdmin, hasDevice } from "../middleware";
import { appConfig } from "./../interfaces";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

let appConfig = require("./../DefaultAppConfig.json") as appConfig;

const PlayerRouter = Router();

PlayerRouter.get("/pause", IsAdmin, async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    API.pause();
    return res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

PlayerRouter.get("/skip", IsAdmin, async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    API.skipToNext();
    return res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

PlayerRouter.get("/current", async (req: Request, res: Response) => {
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

export default PlayerRouter;
