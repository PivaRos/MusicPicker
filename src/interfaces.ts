import { type } from "node:os";
import { votes } from "./modules/vote";

export enum AppPlatform {
  SPOTIFY = "spotify",
  YOUTUBE_MUSIC = "youtube-music",
}

export type appConfig = {
  platform: AppPlatform;
  genres?: string[];
  minutes_between_queue_adds: number;
  votes: [votes];
};

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
export interface spotifyRequest {
  token: string;
  endpoint: string;
  method: httpMethod;
  body?: object | string;
}

export interface lisence {
  mac: string;
  authorized: boolean;
}
