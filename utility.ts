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

export const refreshAccessToken = async (API: SpotifyWebApi) => {
  let myInterval;
  try {
    const Token = localStorage.getItem("Token");
    const UpdateToken = localStorage.getItem("UpdateToken");
    if (Token && UpdateToken) {
      API.setAccessToken(Token);
      API.setRefreshToken(UpdateToken);
    }
    const styles = [
      "color: green",
      "background: yellow",
      "font-size: 30px",
      "border: 1px solid red",
      "text-shadow: 2px 2px black",
      "padding: 10px",
    ].join(";");
    console.log("\u001b[1;44m Refreshing Access Token...");
    const token = await API.refreshAccessToken();
    API.setAccessToken(token.body.access_token);
    if (token.body.refresh_token) {
      API.setRefreshToken(token.body.refresh_token);
      localStorage.setItem("UpdateToken", token.body.refresh_token);
    }
    localStorage.setItem("Token", token.body.access_token);
    console.log("\u001b[1;44m Finished Refreshing Token !");
    myInterval = setInterval(async () => {
      refreshAccessToken(API);
    }, 3599900);
  } catch (e: any) {
    clearInterval(myInterval);
    console.log(e.message);
    console.log("\u001b[1;31m please login /auth/login");
  }
};
