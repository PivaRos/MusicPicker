import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { IsAdmin, hasDevice } from "../middleware";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const router = (app: any) => {
  const PlayerRouter = Router();

  const updateStateInterval = setInterval(async () => {
    try {
      if (!app.locals.refreshingAccessToken) {
        const API = app.locals.API as SpotifyWebApi;
        const allResult = await Promise.allSettled([
          API.getQueue(),
          API.getMyCurrentPlaybackState(),
        ]);
        let result, result2;
        if (allResult[0].status === "fulfilled") {
          result = allResult[0].value;
        } else {
          throw new Error(allResult[0].reason);
        }
        if (allResult[1].status === "fulfilled") {
          result2 = allResult[1].value;
        } else {
          throw new Error(allResult[1].reason);
        }
        let theAlbum;
        let genres;
        if (
          result.body.currently_playing &&
          result.body.currently_playing.type === "track"
        ) {
          theAlbum = result.body.currently_playing.album;
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
      }
    } catch (e) {
      app.locals.playerState = undefined;
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
