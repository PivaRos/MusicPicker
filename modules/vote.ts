import config from "../DefaultAppConfig.json";

export enum votes {
  VolumeUp = "VOLUMEUP",
  VolumeDown = "VOLUMEDOWN",
  Skip = "SKIP",
}

export class Vote {
  private type: string;
  private votes: number = 0;

  constructor(type: votes) {
    this.type = type;
  }

  getType: () => string = () => {
    return this.type;
  };

  getVotes: () => number = () => {
    return this.votes;
  };

  addVote: () => void = () => {
    this.votes++;
  };

  removeVote: () => void = () => {
    this.votes--;
  };

  getAddVote = () => this.addVote;
  getRemoveVote = () => this.removeVote;

  resetVotes = () => {
    this.votes = 0;
  };
}
