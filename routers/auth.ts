import { Request, Response, Router } from "express";
import path from "path";
import SpotifyWebApi from "spotify-web-api-node";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const AuthRouter = Router();

AuthRouter.get("/login", (req: Request, res: Response) => {
  res.redirect(req.app.locals.loginUri);
});

export default AuthRouter;
