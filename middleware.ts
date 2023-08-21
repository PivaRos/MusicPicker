import SpotifyWebApi from "spotify-web-api-node";
import { appConfig } from "./interfaces";
import { calculate_Minutes_Time } from "./utility";

export const checkWasAdded = (req: any, res: any, next: any) => {
  const appConfig = req.app.locals.appConfig as appConfig;

  if (!req.session.track_id || !req.session.track_date) return next();
  const date = new Date();
  if (
    calculate_Minutes_Time(req.session.track_date as Date, date) >
    appConfig.minutes_between_queue_adds
  ) {
    return next();
  }
  return [
    res.status(400),
    res.json({
      error_type: "ALREADY_ADD",
      message: `user already added track to queue, please wait ${appConfig.minutes_between_queue_adds} minutes before trying to add new track to the queue`,
    }),
  ];
};

export const hasDevice = async (req: any, res: any, next: any) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const MyDevices = await API.getMyDevices();
    if (MyDevices.body.devices.length > 0) {
      next();
    } else {
      return [
        res.status(503),
        res.json({ message: "has no devices connected" }),
      ];
    }
  } catch (e: any) {
    return [res.status(500), res.json({ message: e.message })];
  }
};

export const IsAdmin = async (req: any, res: any, next: any) => {
  if (req.app.locals.appConfig.adminPassword === req.session.adminPassword) {
    next();
  } else {
    res.sendStatus(401);
  }
};
