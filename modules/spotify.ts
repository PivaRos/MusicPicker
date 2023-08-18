require("dotenv").config();
import fetch from "node-fetch";

export enum httpMethod {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
}
export interface searchResult {
  tracks: {
    herf: string;
    items: TrackItem[];
  };
}
export interface image {
  height: number;
  width: number;
  url: string;
}
export interface artist {
  name: string;
  uri: string;
}
export interface TrackItem {
  album: {
    images: image[];
  };
  artists: artist[];
  name: string;
  id: string;
  uri: string;
}

let client_id = process.env.ClientID;
let client_secret = process.env.ClientSecret;

export async function updateToken() {
  const res = await fetch(`https://accounts.spotify.com/api/token`, {
    method: httpMethod.POST,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,
  });

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  console.log(json.access_token);
  return json.access_token;
}

export interface spotifyRequest {
  token: string;
  endpoint: string;
  method: httpMethod;
  body?: object | string;
}

export async function fetchWebApi({ ...request }: spotifyRequest) {
  const res = await fetch(`https://api.spotify.com/${request.endpoint}`, {
    headers: {
      Authorization: `Bearer ${request.token}`,
    },
    method: request.method,
    body: JSON.stringify(request.body),
  });
  return await res.json();
}

export async function search(query: string, token: string) {
  const searchResult = await fetchWebApi({
    endpoint: `v1/search?q=${query}&type=track&limit=10`,
    method: httpMethod.GET,
    token: token,
  });
  return searchResult as searchResult;
}

export async function addToQueue(trackUri: string, token: string) {
  const Result = await fetchWebApi({
    endpoint: `v1/me/player/queue?uri=${trackUri}`,
    method: httpMethod.POST,
    token: token,
  });
  return Result;
}

export const aaass2 = async (token: string) => {
  const Result = await fetchWebApi({
    endpoint: `v1/me/player/`,
    method: httpMethod.PUT,
    token: token,
  });
  return Result;
};
