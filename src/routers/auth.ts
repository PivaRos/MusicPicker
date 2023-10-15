import { Request, Response, Router } from "express";
import { query, validationResult } from "express-validator";
import { appConfig } from "../interfaces";

const AuthRouter = Router();

AuthRouter.get(
  "/login",
  query("password").notEmpty(),
  (req: Request, res: Response) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const appConfig = req.app.locals.appConfig as appConfig;
      if (req.query.password === appConfig.adminPassword)
        return res.redirect(req.app.locals.loginUri);
      else return res.sendStatus(401);
    }
    return [res.status(400), res.send({ message: result.array()[0].msg })];
  }
);

AuthRouter.get("/admin/:password", (req: any, res: Response) => {
  if (req.params.password === req.app.locals.appConfig.adminPassword) {
    req.session.adminPassword = req.params.password;
    return res.redirect("/success");
  } else {
    return res.sendStatus(401);
  }
});

export default AuthRouter;
