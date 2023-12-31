import { Request, Response, Router } from "express";
import path from "path";
import SpotifyWebApi from "spotify-web-api-node";

var localStorage: any = null;
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  var path1 = path.join(process.env.pvPath || "", "./scratch");
  console.log("callback : " + path1);
  localStorage = new LocalStorage(path1);
}

const callbackRouter = Router();

callbackRouter.get("/spotify", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
      res.redirect("/#error=state_mismatch");
    } else {
      if (code) {
        const resGrant = await API.authorizationCodeGrant(code.toString());
        if (resGrant.statusCode === 200) {
          localStorage.setItem("Token", resGrant.body.access_token);
          localStorage.setItem("UpdateToken", resGrant.body.refresh_token);
          API.setAccessToken(resGrant.body.access_token);
          API.setRefreshToken(resGrant.body.refresh_token);
          req.app.locals.API = API;
          req.app.locals.refreshingAccessToken = false;
          console.log("\u001b[1;32m logged in successfully !");
          return res.redirect(process.env.success_route || "/success");
        } else {
          return res.sendStatus(401);
        }
      }
    }
    return res.sendStatus(500);
  } catch (e) {
    console.log(e);
    console.log(e);
    return res.sendStatus(401);
  }
});

export default callbackRouter;
