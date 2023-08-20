import { NextFunction, Request, Response } from "express";
import { updateToken } from "./modules/spotify";
import SpotifyWebApi from "spotify-web-api-node";

export const checkWasAdded = (req: any, res: any, next: any) => {
  if (req.session.TrackAddedToQueue) {
    let deleted = false;
    //delete previus
    if (!deleted)
      return [
        res.status(400),
        res.json({
          message: "user already added track to queue",
        }),
      ];
  }
  next();
};
