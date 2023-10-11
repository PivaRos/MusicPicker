import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { IsNotInQueue, checkWasAdded, hasDevice } from "../middleware";
import { TrackItem, appConfig } from "./../interfaces";
import NodeCache from "node-cache";

const QueueRouter = Router();

QueueRouter.get(
  "/add/:track_uri",
  hasDevice,
  IsNotInQueue,
  checkWasAdded,

  async (req: any, res: any) => {
    let appConfig = req.app.locals.appConfig as appConfig;
    res.locals.trackUri = req.params.track_uri;
    try {
      const tracksCache = req.app.locals.tracksCache as NodeCache;
      const uri = req.params.track_uri.split(":");
      if (uri[1] !== "track" || uri[0] !== "spotify")
        return [res.status(400), res.json({ message: "bad track uri" })];
      const API = req.app.locals.API as SpotifyWebApi;
      let track = tracksCache.get(uri[2]) as SpotifyApi.SingleTrackResponse;
      if (!track) {
        console.log("fetched new track");
        let newTrack = await API.getTrack(uri[2]);
        track = newTrack.body;
      }
      let artists: SpotifyApi.ArtistObjectFull[] = [];
      track.artists.forEach((artist) => {
        console.log("trying get cache of artistID :" + artist.id);
        const fullArtist = tracksCache.get(
          artist.id
        ) as SpotifyApi.ArtistObjectFull;
        if (fullArtist) artists.push(fullArtist);
      });

      if (artists.length === 0) {
        console.log("fetched new artist");
        artists = (
          await API.getArtists(track.artists.map((artist) => artist.id))
        ).body.artists;
      }

      let countEmpty = 0;
      let found = appConfig.genres ? false : true;
      if (appConfig.genres) {
        artists.map((artist) => {
          if (artist.genres.length > 0) {
            artist.genres.map((genre) => {
              if (
                appConfig.genres &&
                appConfig.genres.includes(genre.toLocaleLowerCase())
              ) {
                found = true;
              }
            });
          } else {
            //artist.genres empty.
            countEmpty++;
          }
        });
        if (artists.length === countEmpty) found = true;
      }
      if (found) {
        const result = await API.addToQueue(req.params.track_uri);
        if (result.statusCode === 204) {
          const date = new Date();
          req.session.track_uri = req.params.track_uri;
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

// QueueRouter.get("/current", async (req: Request, res: Response) => {
//   try {
//     const API = req.app.locals.API as SpotifyWebApi;
//     const queue = await API.getQueue();
//     return [
//       res.status(200),
//       res.json({
//         currently_playing: {
//           name: queue.body.currently_playing.name,
//           uri: queue.body.currently_playing.uri,
//         },
//         queue: queue.body.queue.map((track) => {
//           return {
//             name: track.name,
//             uri: track.uri,
//           };
//         }),
//       }),
//     ];
//   } catch {
//     res.sendStatus(500);
//   }
// });

export default QueueRouter;
