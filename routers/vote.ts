import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { VoteModule } from "../modules/VoteModule";
import { activeUsers } from "../modules/activeUser";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const RouterFunction = (API: SpotifyWebApi, ActiveUsers: activeUsers) => {
  const votesRouter = Router();

  const options = { getActiveVoters: ActiveUsers.getAmountOfUsers };
  const voteModule = new VoteModule(API, options);

  votesRouter.get("/skip", async (req: Request, res: Response) => {
    try {
      res.status(200);
      return res.json({ activeUsers: ActiveUsers.getAmountOfUsers() });
    } catch {}
  });

  return votesRouter;
};
export default RouterFunction;
