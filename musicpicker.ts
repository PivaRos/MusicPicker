import express, { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import session from "express-session";
import AuthRouter from "./routers/auth";
import AdminRouter from "./routers/admin";
import QueueRouter from "./routers/queue";
import RouterFunction from "./routers/vote";
import callbackRouter from "./routers/callback";
import { appConfig, image, lisence } from "./interfaces";
import { authorizeToRun, refreshAccessToken } from "./utility";
import PlayerRouter from "./routers/player";
import cors from "cors";
import address from "address";
import { SocketServer } from "./modules/socket";
import { activeUsers } from "./modules/activeUser";
import { VoteModule } from "./modules/VoteModule";
import NodeCache from "node-cache";
import enumsRouter from "./routers/enums";

require("dotenv").config();

var scopes = [
  "user-read-private",
  "user-read-email",
  "user-modify-playback-state",
  "app-remote-control",
  "streaming",
  "user-read-currently-playing",
  "user-read-playback-state",
];
var state = "some-state-of-my-choice";

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

var localStorage: any = null;
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

let appConfig = require("./DefaultAppConfig.json") as appConfig;
app.locals.appConfig = appConfig;

const redirect_route = process.env.redirect_route || "";
const client_id = process.env.client_id || "";
const client_secret = process.env.client_secret || "";

const HOST = process.env.HOST || "http://localhost:" + process.env.PORT + "/";

const API = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: HOST + redirect_route || "",
});
app.locals.API = API;

address.mac((err, addr) => {
  console.log(addr);
  app.locals.lisence = {
    mac: addr,
    authorized: false,
  } as lisence;
});

authorizeToRun(app);

refreshAccessToken(API, app);
app.locals.loginUri = API.createAuthorizeURL(scopes, state, true);

const ActiveUsers = new activeUsers();

app.locals.ActiveUsers = ActiveUsers as activeUsers;
const options = { getActiveVoters: ActiveUsers.getAmountOfUsers };
const voteModule = new VoteModule(app.locals.API, options);
app.locals.voteModule = voteModule;
const trackCache = new NodeCache();

app.locals.tracksCache = trackCache as NodeCache;

const socketServer = SocketServer(API, {
  addUser: ActiveUsers.addUser,
  removeUser: ActiveUsers.removeUser,
  removeVotes: voteModule.removeVotes,
});
app.use(async (req, res, next) => {
  if (app.locals.lisence.authorized) {
    next();
  } else {
    return [res.status(401), res.json({ message: "no license found" })];
  }
});
const apiRouter = Router();
apiRouter.use("/auth", AuthRouter);
apiRouter.use("/callback", callbackRouter);
apiRouter.use("/admin", AdminRouter);
apiRouter.use("/queue", QueueRouter);
apiRouter.use("/player", PlayerRouter(app));
apiRouter.use("/vote", RouterFunction(app, ActiveUsers));
apiRouter.use("/enums", enumsRouter);

apiRouter.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const API = req.app.locals.API as SpotifyWebApi;
    const searchResponse = await API.search(req.params.query, [
      "track",
      "artist",
    ]);

    res.status(200);
    if (!searchResponse.body.tracks)
      return [res.status(200), res.json({ message: "no tracks found" })];
    searchResponse.body.tracks.items.forEach((track) => {
      if (!trackCache.get(track.id)) trackCache.set(track.id, track, 45);
    });
    searchResponse.body.artists?.items.forEach((artist) => {
      if (!trackCache.get(artist.id)) {
        trackCache.set(artist.id, artist, 45);
        console.log(
          "artist cache set on id: " + artist.id + " name: " + artist.name
        );
      }
    });
    res.json(
      searchResponse.body.tracks.items.map((track) => {
        return {
          uri: track.uri,
          name: track.name,
          artists: track.artists.map((artist) => {
            return artist.name;
          }),
          images: track.album.images as image[],
        };
      })
    );
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

const musicpicker = Router();
const appconfig = app.locals.appConfig as appConfig;
appconfig.votes.length > 0
  ? musicpicker.use(express.static(path.join(__dirname, "build")))
  : musicpicker.use(express.static(path.join(__dirname, "buildnoVote")));

musicpicker.get("/", function (req, res) {
  const appconfig = app.locals.appConfig as appConfig;
  appconfig.votes.length > 0
    ? res.sendFile(path.join(__dirname, "build", "index.html"))
    : res.sendFile(path.join(__dirname, "buildnoVote", "index.html"));
});

musicpicker.get("/admin", function (req, res) {
  const appconfig = app.locals.appConfig as appConfig;
  appconfig.votes.length > 0
    ? res.sendFile(path.join(__dirname, "build", "index.html"))
    : res.sendFile(path.join(__dirname, "buildnoVote", "index.html"));
});
musicpicker.get("/success", async (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "/rawHTML/success.html"));
});
musicpicker.use("/api", apiRouter);

app.use("/", musicpicker);

app.listen(process.env.PORT, () => {
  console.log(`\u001b[1;42m app is running at port ${process.env.PORT} !`);
});
