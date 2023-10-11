import SpotifyWebApi from "spotify-web-api-node";
import { RateLimitFollower } from "./RateLimitFollower";

export class ApiAdapter extends SpotifyWebApi {
  rateLimitFollower: RateLimitFollower;

  constructor({ ...SpotifyWebApi }, PerTime: number, MaxLimit: number) {
    super(SpotifyWebApi);
    this.rateLimitFollower = new RateLimitFollower({
      maxLimit: MaxLimit,
      PerTime: PerTime,
    });
  }

  addToFollower = (number?: number) => {
    if (!number) number = 1;
    return this.rateLimitFollower.addToFollow(number);
  };

  checkBeforeRequest = (number?: number) => {
    return this.rateLimitFollower.checkforAllow(number);
  };
}
