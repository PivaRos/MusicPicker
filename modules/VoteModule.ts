import SpotifyWebApi from "spotify-web-api-node";
import { Vote, votes } from "./vote";

export interface options {
  getActiveVoters: () => number;
}

export class VoteModule {
  private getActiveVoters: () => number;
  private API: SpotifyWebApi;
  private votes: Vote[] = [];
  private volume: number | null = null;

  constructor(API: SpotifyWebApi, { getActiveVoters }: options) {
    this.API = API;
    this.getActiveVoters = getActiveVoters;
    this.API.getMyDevices()
      .then((result) => {
        this.volume = result.body.devices[0].volume_percent;
      })
      .catch();

    const Interval = setInterval(() => {
      this.checkVotes();
    }, 1500);
  }

  // return's false if vote this the same type is already in the votes array else return's true
  addVote = (vote: Vote) => {
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i].getType() === vote.getType()) {
        return false;
      }
    }
    this.votes.push(vote);
    return true;
  };

  checkVotes = async () => {
    if (!this.volume) {
      this.API.getMyDevices()
        .then((result) => {
          this.volume = result.body.devices[0].volume_percent;
        })
        .catch();
    }
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i].getVotes() > this.getActiveVoters() / 2) {
        //execute vote and delete
        switch (this.votes[i].getType()) {
          case votes.Skip:
            //do Skip
            this.API.skipToNext();
            this.votes[i].resetVotes();
            break;
          case votes.VolumeUp:
            if (this.volume) {
              this.API.setVolume(this.volume + 15);
              this.volume += 15;
            }
          case votes.VolumeDown:
            if (this.volume) {
              this.API.setVolume(this.volume - 15);
              this.volume -= 15;
            }
            break;
        }
      }
    }
  };
}
