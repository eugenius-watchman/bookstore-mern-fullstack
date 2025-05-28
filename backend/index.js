import express, { request, response } from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import cors from "cors";

const app = express();

// Middleware for parsing body request
app.use(express.json());

// Middleware for handling CORS Policy
// 1. Allow all Origins with Default of cors(*)
app.use(cors());

// 2. Allow Custom Origin
// app.use(cors({
//     origin: 'http://localhost:3000',
//     method: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowHeaders: ['Content-Type']
// }));

app.use('/images', express.static('public/images'));


// Routes
app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("Bookstore tutorials");
});

app.use("/books", booksRoute);

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database successfully");
    app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });
