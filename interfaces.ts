import { type } from "node:os";

export enum AppPlatform {
  SPOTIFY = "spotify",
  YOUTUBE_MUSIC = "youtube-music",
}

export type appConfig = {
  platform: AppPlatform;
  genres?: string[];
  minutes_between_queue_adds: number;
};
