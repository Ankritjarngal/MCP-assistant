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

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  intents : {
    "google calendar": [],
    "mailing service": [],
    "task management": [],
    "documenting service": []
  }
});

const UsersForMcp = mongoose.model("UserForMcp", UserSchema);

export { UsersForMcp };



