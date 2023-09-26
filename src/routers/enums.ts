import { Router } from "express";

import { configDotenv } from "dotenv";

configDotenv();

const enumsRouter = Router();

enumsRouter.get("/validVotes", (req, res) => {
  const validVotes = process.env.validVotes?.split(",") || [];
  return res.json({ validVotes });
});

enumsRouter.get("/validGenres", (req, res) => {
  const validGenres = process.env.validGenres?.split(",") || [];

  return res.json({ validGenres });
});

export default enumsRouter;
