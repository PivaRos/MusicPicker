import SpotifyWebApi from "spotify-web-api-node";
import { VoteModule } from "../../modules/VoteModule";
import { Vote, votes } from "../../modules/vote";

var localStorage: any = null;
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const API = new SpotifyWebApi();
const Token = localStorage.getItem("Token");
const UpdateToken = localStorage.getItem("UpdateToken");
API.setAccessToken(Token);
API.setRefreshToken(UpdateToken);

const voteModule = new VoteModule(API, { getActiveVoters: () => 2 });

const RandomUserId = "this is random id";
const SecondRandomUserId = "this is random id2";

describe("Vote Module", () => {
  test("check initial state", async () => {
    expect(voteModule.getVotes().length).toBe(0);
  });

  test("check addition of Vote", async () => {
    const added = voteModule.addVote(new Vote(votes.Skip), RandomUserId);
    expect(added).toBe(true);
    expect(voteModule.getVotes().length).toBe(1);
    expect(voteModule.getVotes()[0].getVotes().length).toBe(1);
  });

  test("check deletion of Users Votes", async () => {
    expect(voteModule.getVotes()[0].getVotes().length).toBe(1);
    voteModule.removeVotes(RandomUserId);
    expect(voteModule.getVotes()[0].getVotes().length).toBe(0);
    expect(voteModule.getVotes().length).toBe(1);
  });

  test("check execution of Votes", async () => {
    const added = voteModule.addVote(new Vote(votes.Skip), RandomUserId);
    expect(added).toBe(true);
    expect(voteModule.getVotes()[0].getVotes().length).toBe(1);
    const added2 = voteModule.addVote(new Vote(votes.Skip), SecondRandomUserId);
    expect(added2).toBe(true);
    expect(voteModule.getVotes()[0].getVotes().length).toBe(2);
    const wait = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(undefined);
        //because votes module checks every 2 minutes for accepted votes
      }, 2000);
    });
    await wait;
    //after 1.5 seconds;
    expect(voteModule.getVotes().length).toBe(0);
  });
});
