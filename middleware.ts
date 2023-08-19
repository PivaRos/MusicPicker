import { NextFunction, Request, Response } from "express";
import { updateToken } from "./modules/spotify";
import SpotifyWebApi from "spotify-web-api-node";

export const GoodToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.app.locals.token && req.app.locals.token !== "") {
    next();
  } else {
    req.app.locals.token = await updateToken();
    setInterval(async () => {
      req.app.locals.token = await updateToken();
    }, 3600000);
    next();
  }
};
