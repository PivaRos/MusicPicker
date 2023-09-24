import SpotifyWebApi from "spotify-web-api-node";
import { AppPlatform, appConfig } from "../interfaces";
import path from "path";

const configPath = path.join(__dirname, "/DefaultAppConfig.json");

let appConfig = require(configPath) as appConfig;

class ApiAdapter {
  API: any;

  constructor() {
    if (appConfig.platform === AppPlatform.SPOTIFY) {
      const redirect_uri = process.env.redirect_uri;
      const client_id = process.env.client_id;
      const client_secret = process.env.client_secret;

      const API = new SpotifyWebApi({
        clientId: client_id,
        clientSecret: client_secret,
        redirectUri: "http://localhost:" + process.env.PORT + redirect_uri,
      });
      this.API = API;
    }
    if (appConfig.platform === AppPlatform.YOUTUBE_MUSIC) {
      // not done yet
    }
  }
}

if (appConfig.platform === AppPlatform.SPOTIFY) {
}
