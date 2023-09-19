import config from "../../DefaultAppConfig.json";

export enum votes {
  VolumeUp = "VOLUMEUP",
  VolumeDown = "VOLUMEDOWN",
  Skip = "SKIP",
}

export class Vote {
  private type: string;
  private votes: string[] = [];

  constructor(type: votes) {
    this.type = type;
  }

  getType: () => string = () => {
    return this.type;
  };

  getVotes: () => string[] = () => {
    return this.votes;
  };

  addVote = (id: string) => {
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i] === id) {
        return false;
      }
    }
    this.votes.push(id);
    return true;
  };

  removeVote = (id: string) => {
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i] === id) {
        this.votes.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  getAddVote = () => this.addVote;
  getRemoveVote = () => this.removeVote;
}
