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
      const result = await API.getQueue();
      const result2 = await API.getMyCurrentPlaybackState();
      let theAlbum;
      let genres;
      if (
        result.body.currently_playing &&
        result.body.currently_playing.type === "track"
      ) {
        theAlbum = result.body.currently_playing.album;
        genres = result.body.currently_playing.genres;
      }
      if (!result.body.currently_playing) app.locals.playerState = undefined;
      else {
        app.locals.playerState = {
          queue: result.body.queue,
          currentlyPlaying: result2.body.is_playing,
          time: result2.body.progress_ms,
          maxtime: result.body.currently_playing.duration_ms,
          uri: result.body.currently_playing.uri,
          images: theAlbum ? theAlbum.images : [],
          name: result.body.currently_playing.name,
          artists: theAlbum?.artists.map((artist) => {
            return artist.name;
          }),
          genres,
        };
      }
    } catch (e) {
      console.log(e);
    }
  }, 1550);

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
