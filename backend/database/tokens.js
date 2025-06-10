import mongoose from "mongoose";
import {config} from "dotenv";
config();

const MONGO_URI = process.env.MongoDB_URL;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected successfully!");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

const tokens = new mongoose.Schema({
    email:"String",
    access_token: "String",
});

const tokensUsers = mongoose.model("tokensUsers", tokens);

export { tokensUsers };



