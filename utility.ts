import SpotifyWebApi from "spotify-web-api-node";

var localStorage: any = null;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

export var generateRandomString = function (length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const refreshAccessToken = async (app: any) => {
  const API = app.locals.API as SpotifyWebApi;
  const token = await API.refreshAccessToken();
  API.setAccessToken(token.body.access_token);
  API.setRefreshToken(token.body.refresh_token ? token.body.refresh_token : "");
  localStorage.setItem("Token", token.body.access_token);
  localStorage.setItem("UpdateToken", token.body.refresh_token);
  setInterval(async () => {
    const API = app.locals.API as SpotifyWebApi;
    const token = await API.refreshAccessToken();
    API.setAccessToken(token.body.access_token);
    API.setRefreshToken(
      token.body.refresh_token ? token.body.refresh_token : ""
    );
    localStorage.setItem("Token", token.body.access_token);
    localStorage.setItem("UpdateToken", token.body.refresh_token);
  }, 3599900);
};
