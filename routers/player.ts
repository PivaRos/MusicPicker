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

const router = (app: any) => {
  const PlayerRouter = Router();

  const updateStateInterval = setInterval(async () => {
    try {
      const API = app.locals.API as SpotifyWebApi;
      const result = await API.getMyCurrentPlayingTrack();
      let theAlbum;
      let genres;
      if (result.body.currently_playing_type === "track" && result.body.item) {
        if (result.body.item.type === "track") {
          theAlbum = result.body.item.album;
          genres = theAlbum.genres;
        }
      }
      if (!result.body.item) app.locals.playerState = undefined;
      else {
        app.locals.playerState = {
          currentlyPlaying: result.body.is_playing,
          time: result.body.progress_ms,
          maxtime: result.body.item?.duration_ms,
          uri: result.body.item?.uri,
          images: theAlbum ? theAlbum.images : [],
          name: result.body.item?.name,
          artists: theAlbum?.artists.map((artist) => {
            return artist.name;
          }),
          genres,
        };
      }
    } catch (e) {
      console.log(e);
    }
  }, 1200);

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
    if (req.app.locals.playerState) return res.json(req.app.locals.playerState);
    else return [res.status(500), res.json({ device: undefined })];
  });
  return PlayerRouter;
};
export default router;
