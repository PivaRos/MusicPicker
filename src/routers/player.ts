import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { IsAdmin, hasDevice } from "../middleware";
import { ApiAdapter } from "../modules/ApiAdapter";

const router = (app: any) => {
  const PlayerRouter = Router();

  const wait = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms));
  };

  const updateStateInterval = setInterval(async () => {
    try {
      await wait(1000);
      if (!app.locals.refreshingAccessToken) {
        const API = app.locals.API as ApiAdapter;
        var check = API.checkBeforeRequest(2);
        console.log(check);
        if (check === 0) {
          const allResult = await Promise.allSettled([
            API.getQueue(),
            API.getMyCurrentPlaybackState(),
          ]);
          API.addToFollower(2);
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
          if (!result.body.currently_playing)
            app.locals.playerState = undefined;
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
        } else {
          throw new Error("not enough requests left");
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
    else return [res.status(500), res.json({ message: "no player state" })];
  });
  return PlayerRouter;
};
export default router;
