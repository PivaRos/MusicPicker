import { Request, Response, Router } from "express";
import { IsAdmin } from "../middleware";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const AdminRouter = Router();

AdminRouter.use(IsAdmin);

AdminRouter.put("/genres", async (req: Request, res: Response) => {
  try {
    //change genre;
    const newGenres = req.body.genres;
    req.app.locals.appConfig.genres = newGenres;
    await writeFileSync(
      path.join(__dirname, "../DefaultAppConfig.json"),
      JSON.stringify(req.app.locals.appConfig, null, 2)
    );
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(500);
  }
});

AdminRouter.put("/password", async (req: Request, res: Response) => {
  try {
    // change password
    const newPassword = req.body.password;
    req.app.locals.appConfig.adminPassword = newPassword;
    await writeFileSync(
      path.join(__dirname, "../DefaultAppConfig.json"),
      JSON.stringify(req.app.locals.appConfig, null, 2)
    );
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(500);
  }
});

AdminRouter.put("/minutes", async (req: Request, res: Response) => {
  try {
    //change minutes between queue adds;
    const newMinutes = req.body.minutes;
    req.app.locals.appConfig.minutes_between_queue_adds = newMinutes;
    await writeFileSync(
      path.join(__dirname, "../DefaultAppConfig.json"),
      JSON.stringify(req.app.locals.appConfig, null, 2)
    );
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(500);
  }
});

AdminRouter.put("/appConfig", async (req: Request, res: Response) => {
  //get the app's config
  try {
    //change minutes between queue adds;
    const appConfig = req.body.appConfig;
    req.app.locals.appConfig = appConfig;
    await writeFileSync(
      path.join(__dirname, "../DefaultAppConfig.json"),
      JSON.stringify(req.app.locals.appConfig, null, 2)
    );
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(500);
  }
});

AdminRouter.get("/appConfig", async (req: Request, res: Response) => {
  //get the app's config
  try {
    return res.json(req.app.locals.appConfig);
  } catch {
    return res.sendStatus(500);
  }
});

export default AdminRouter;
