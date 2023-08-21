import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { checkWasAdded, hasDevice } from "../middleware";
import { appConfig } from "./../interfaces";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const QueueRouter = Router();

QueueRouter.get(
  "/add/:track_id",
  hasDevice,
  checkWasAdded,
  async (req: any, res: any) => {
    let appConfig = req.app.locals.appConfig as appConfig;
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
          const date = new Date();
          req.session.track_id = req.params.track_id;
          req.session.track_date = date;
          return res.sendStatus(200);
        }
        return res.sendStatus(500);
      } else {
        return [
          res.status(400),
          res.json({
            error_type: "GENRE_NOT_ALLOWED",
            message: "track's genre not allowed",
          }),
        ];
      }
    } catch (e: any) {
      res.status(e.statusCode);
      e.headers && e.headers["retry-after"]
        ? res.json({ retry_after: e.headers["retry-after"] })
        : res.json(e);
    }
  }
);

QueueRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const queue = await API.getQueue();
    return [
      res.status(200),
      res.json({
        currently_playing: {
          name: queue.body.currently_playing.name,
          uri: queue.body.currently_playing.uri,
        },
        queue: queue.body.queue.map((track) => {
          return {
            name: track.name,
            uri: track.uri,
          };
        }),
      }),
    ];
  } catch {
    res.sendStatus(500);
  }
});

export default QueueRouter;
