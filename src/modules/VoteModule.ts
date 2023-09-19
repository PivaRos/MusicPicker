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
    this.checkVolume();

    const Interval = setInterval(() => {
      this.checkVotes();
    }, 2000);
  }

  // return's false if vote this the same type is already in the votes array else return's true
  addVote = (vote: Vote, id: string) => {
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i].getType() === vote.getType()) {
        //check If User Voted;
        return this.votes[i].addVote(id);
      }
    }
    //add new vote
    vote.addVote(id);
    this.votes.push(vote);
    return true;
  };

  private checkVolume = async () => {
    try {
      if (!this.volume) {
        this.API.getMyDevices()
          .then((result) => {
            this.volume = result.body.devices[0].volume_percent;
          })
          .catch(() => {});
      }
    } catch {}
  };

  getVotes = () => this.votes;

  removeVotes = (userid: string) => {
    for (let c = 0; c < this.votes.length; c++) {
      for (let i = 0; i < this.votes[c].getVotes().length; i++) {
        if (this.votes[c].getVotes()[i] === userid) {
          this.votes[c].getVotes().splice(i, 1);
        }
      }
    }
  };

  private checkVotes = async () => {
    await this.checkVolume();
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i].getVotes().length > this.getActiveVoters() / 2) {
        //execute vote and delete
        switch (this.votes[i].getType()) {
          case votes.Skip:
            //do Skip
            this.API.skipToNext();
            this.votes.splice(i, 1); // remove vote from list
            break;
          case votes.VolumeUp:
            if (this.volume) {
              this.volume += 15;
              if (this.volume > 100) this.volume = 100;
              this.API.setVolume(this.volume);
              this.votes.splice(i, 1); // remove vote from list
            }
            break;
          case votes.VolumeDown:
            if (this.volume) {
              this.volume -= 15;
              if (this.volume < 0) this.volume = 1;
              this.API.setVolume(this.volume);
              this.votes.splice(i, 1); // remove vote from list
            }
            break;
        }
      }
    }
  };
}
