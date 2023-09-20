import SpotifyWebApi from "spotify-web-api-node";
import { VoteModule } from "../modules/VoteModule";
import { Vote, votes } from "../modules/vote";

test("Chcek Vote Module", () => {
  const API = new SpotifyWebApi();
  const voteModule = new VoteModule(API, { getActiveVoters: () => 1 });
  expect(voteModule.getVotes()).toStrictEqual([]);
  voteModule.addVote(new Vote(votes.Skip), "this is me");
  expect(voteModule.getVotes().length).toBe(1);
  expect(voteModule.getVotes()[0].getType()).toBe(votes.Skip);
  voteModule.removeVotes("this is me");
  expect(voteModule.getVotes()[0].getVotes().length).toBe(0);
});
