import SpotifyWebApi from "spotify-web-api-node";
import { lisence } from "./interfaces";
import axios from "axios";
require("dotenv").config();

const dev = process.env.dev;

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

const refereshToken = async (API: SpotifyWebApi, app: any) => {
  try {
    const Token = localStorage.getItem("Token");
    const UpdateToken = localStorage.getItem("UpdateToken");
    if (Token && UpdateToken) {
      API.setAccessToken(Token);
      API.setRefreshToken(UpdateToken);
    }
    console.log("\u001b[1;44m Refreshing Access Token...");
    app.locals.refreshingAccessToken = true;
    const token = await API.refreshAccessToken();
    API.setAccessToken(token.body.access_token);
    if (token.body.refresh_token) {
      API.setRefreshToken(token.body.refresh_token);
      localStorage.setItem("UpdateToken", token.body.refresh_token);
    }
    localStorage.setItem("Token", token.body.access_token);
    console.log("\u001b[1;44m Finished Refreshing Token !");
    app.locals.refreshingAccessToken = false;
  } catch {
    console.log("\u001b[1;31m please login /auth/login");
  }
};

export const refreshAccessToken = async (API: SpotifyWebApi, app: any) => {
  let myInterval;
  try {
    refereshToken(API, app);
    myInterval = setInterval(async () => {
      refereshToken(API, app);
    }, 3599900);
  } catch (e: any) {
    clearInterval(myInterval);
    console.log(e.message);
    console.log("\u001b[1;31m please login /auth/login");
  }
};

const authorize = async (app: any) => {
  console.log(`\u001b[1;42m Checking lisence...`);
  const lisence = { ...app.locals.lisence } as lisence;
  const HardCodedHOST = "https://danielgurbin.com";

  const result = await axios.get(
    HardCodedHOST + "/api/auth/state/" + lisence.mac,
    {
      validateStatus: () => true,
    }
  );
  if (result.status === 200) {
    lisence.authorized = true; // set authorized true
    app.locals.lisence = lisence;
    console.log(`\u001b[1;42m Lisenced successfully`);
  } else {
    lisence.authorized = false; // set authorized false
    app.locals.lisence = lisence;
    console.log("\u001b[1;31m No License Found");
  }
};

export const authorizeToRun = async (app: any) => {
  let myInterval;
  try {
    authorize(app);
    myInterval = setInterval(async () => {
      authorize(app);
    }, 3599900);
  } catch (e: any) {
    clearInterval(myInterval);
  }
};

export const calculate_Minutes_Time = (date1: Date, date2: Date) => {
  // To calculate the time difference of two dates
  var Difference_In_Time = date2.getTime() - new Date(date1).getTime();
  var Difference_In_minutes = Difference_In_Time / (1000 * 60);
  return Difference_In_minutes;
};
