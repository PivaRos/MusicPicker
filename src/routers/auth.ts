import { Request, Response, Router } from "express";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const AuthRouter = Router();

AuthRouter.get("/login", (req: Request, res: Response) => {
  res.redirect(req.app.locals.loginUri);
});

AuthRouter.get("/admin/:password", (req: any, res: Response) => {
  if (req.params.password === req.app.locals.appConfig.adminPassword) {
    req.session.adminPassword = req.params.password;
    return res.redirect("/success");
  } else {
    return res.sendStatus(401);
  }
});

export default AuthRouter;
