import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { VoteModule } from "../modules/VoteModule";
import { activeUsers } from "../modules/activeUser";
import { json } from "stream/consumers";
import { Vote, votes } from "../modules/vote";
import { checkIfUserExists, voteAllowed } from "../middleware";

const RouterFunction = (app: any, ActiveUsers: activeUsers) => {
  const votesRouter = Router();

  votesRouter.use(checkIfUserExists);

  const voteModule = app.locals.voteModule as VoteModule;

  votesRouter.get("/", (req: Request, res: Response) => {
    try {
      return res.json({
        votes: voteModule.getVotes().map((vote) => {
          return { ...vote, votes: vote.getVotes().length };
        }),
        activeusers: ActiveUsers.getUsers().length,
      });
    } catch {
      return [
        res.sendStatus(500),
        res.json({ message: "unable to load votes" }),
      ];
    }
  });

  votesRouter.get(
    "/skip",
    voteAllowed(votes.Skip),
    async (req: Request, res: Response) => {
      try {
        const acknowledged = await voteModule.addVote(
          new Vote(votes.Skip),
          req.headers.authorization || ""
        );
        if (acknowledged) {
          res.status(200);
          return res.json({ activeUsers: ActiveUsers.getAmountOfUsers() });
        } else {
          return [res.status(403), res.json({ message: "user already voted" })];
        }
      } catch {
        res.sendStatus(500);
      }
    }
  );

  votesRouter.get(
    "/volumeup",
    voteAllowed(votes.VolumeUp),
    async (req: Request, res: Response) => {
      try {
        const acknowledged = await voteModule.addVote(
          new Vote(votes.VolumeUp),
          req.headers.authorization || ""
        );
        if (acknowledged) {
          res.status(200);
          return res.json({ activeUsers: ActiveUsers.getAmountOfUsers() });
        } else {
          return [res.status(403), res.json({ message: "user already voted" })];
        }
      } catch {
        res.sendStatus(500);
      }
    }
  );

  votesRouter.get(
    "/volumedown",
    voteAllowed(votes.VolumeDown),
    async (req: Request, res: Response) => {
      try {
        const acknowledged = await voteModule.addVote(
          new Vote(votes.VolumeDown),
          req.headers.authorization || ""
        );
        if (acknowledged) {
          res.status(200);
          return res.json({ activeUsers: ActiveUsers.getAmountOfUsers() });
        } else {
          return [res.status(403), res.json({ message: "user already voted" })];
        }
      } catch {
        res.sendStatus(500);
      }
    }
  );

  return votesRouter;
};
export default RouterFunction;
