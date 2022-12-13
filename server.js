import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";

/////////// EMAIL-SENDER /////////////

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const cronJob = {
  // every2sec: '*/2 * * * * *',
  testSchedule: '*/1 * * * *',
  schedule: '0 7 * * *',
  info: '“At 07:00 GMT every day .”'
};

cron.schedule(cronJob.schedule, () => {
  mailService();
});

const mailService = () => {
  let mailTransporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD
    }
  });

  let mailDetails = {
    from: 'birthdayremindersender@gmail.com',
    to: 'joel.ohman@entryevent.se',
    subject: 'Test mail using Cron Job',
    text: `${new Date()} - Node.js Cron Job Email Demo Test from Reflectoring Blog`
  };

  mailTransporter.sendMail(mailDetails, (err, data) => {
    if (err) {
      console.log('error occured', err.message);
    } else {
      console.log('-----------------------');
      console.log('email sent successfully');
    }
  });
};

////////////////////////////////////////

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-final";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid';

const UserSchema = new mongoose.Schema({
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true, 
    correctTld: true,
    unique: true
  },

  /* Unclear if we need this
  username: {
    type: String,
    required: true,
    unique: true
  },
  */
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex")
  }
});

const User = mongoose.model("User", UserSchema);

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = bcrypt.genSaltSync();
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        response: "Password must be at least 8 characters long"
      });
    } else {
      const newUser = await new User({email: email, password: bcrypt.hashSync(password, salt)}).save();
      res.status(201).json({
        success: true,
        response: {
          email: newUser.email,
          accessToken: newUser.accessToken,
          id: newUser._id
        }
      });
    }
  } catch(error) {
      res.status(400).json({
        success: false,
        response: error
      });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({username});
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        success: true,
        response: {
          username: user.username,
          id: user._id,
          accessToken: user.accessToken
        }
      });
    } else {
      res.status(400).json({
        success: false,
        response: "Credentials didn't match"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error
    });
  }
});

const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({accessToken: accessToken});
    if (user) {
      next();
    } else {
      res.status(401).json({
        response: "Please log in",
        success: false
      })
    }
  } catch (error) {
    res.status(400).json({
      response: error,
      success: false
    })
  }
}

/* const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => new Date() 
  },
  hearts: {
    type: Number,
    default: 0
  }
}); 


const Thought = mongoose.model("Thought", ThoughtSchema);

app.get("/thoughts", authenticateUser);
app.get("/thoughts", async (req, res)=> {
  const thoughts = await Thought.find({});
  res.status(200).json({success: true, response: thoughts});
});

app.post("/thoughts", authenticateUser)
app.post("/thoughts", async (req, res) => {
  const { message } = req.body;
  try {
    const newThought = await new Thought({message}).save();
    res.status(201).json({success: true, response: newThought});
  } catch (error) {
    res.status(400).json({success: false, response: error});
  }
});
 */
app.get("/", (req, res) => {
  res.send("Hello Joel and Nina");
});

app.get('/cron', (req, res) => {
  res.json({
    cron: cronJob
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
