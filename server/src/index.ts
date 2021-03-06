//ROOT server file
//create express server, connecting to mongoDB database, and adding router for routes
//Programmer: Ryan Arora, Muhammad Ali, Sree Bandi, Daniel Rusetski
//Date: 10th November 2021
//Purpose: Backend for stoken - an application intended to digitalize SHSM certifications via NFTs

require("dotenv").config(); // Load environment variables

import express from "express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import cors from "./middleware/cors";
import router from "./router";

const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

const app = express();
export default app;

app.disable("x-powered-by"); // Removes the "X-Powered-By: Express" header (useless)

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors);

// Connects to mongoose database before serving app
// Exports a promise to be reused by mongo session store so we don't need two mongo conn.s
export const mongooseClientPromise = mongoose.connect(`${process.env.MONGO_URL!}/${process.env.MONGO_DB_NAME!}`).then((m) => {
  const conn = mongoose.connections[0];
  console.log(`connected to database ${conn?.name}`);

  return m.connection.getClient();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_WEEK_SECONDS * 1000,
    },
    store: MongoStore.create({
      clientPromise: mongooseClientPromise,
      dbName: process.env.MONGO_DB_NAME!,
      ttl: ONE_WEEK_SECONDS,
    }),
  })
);

app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`app listening on port ${process.env.PORT}`);
});
