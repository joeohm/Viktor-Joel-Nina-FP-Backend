import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { differenceInDays } from 'date-fns'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-final";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

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

const convertDate = (birthDate) => {
  const day = String(birthDate.getDate()).padStart(2, 0);
  const month = String(birthDate.getMonth() + 1).padStart(2, 0); // getMonth() starts at 0

  // If birthday is in January, but today is December, add 1 year to converted year
  // Since 30 days is the maximum setting, only do this for January
  const convertedYear = month === '01' && new Date().getMonth() !== 0 ? new Date().getFullYear() + 1 : new Date().getFullYear()

  return new Date(`${convertedYear}-${month}-${day}`)
}

const mailService = async () => {
  let mailTransporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD
    }
  });

// Get all birthdays and users
const birthdays = await Birthday.find()
const users = await User.find()

// For every birthday, compare the birthdate with current date
// if the difference in days matches one of the birthdayReminderSettings, send email
birthdays.forEach((birthday) => {
  const {birthDate, birthdayReminderSettings} = birthday

  // In order to check for reminders every year, convert the birthdate to current year 
  const convertedBirthDate = convertDate(birthDate)

  // new Date() but with time set to midnight UTC for comparison to work
  const today = new Date(new Date().setUTCHours(0, 0, 0, 0))

  // Compare the converted date to today's date and get the difference in days
  const difference = differenceInDays(convertedBirthDate, today)

  // Check if difference between dates corresponds with one of the settings for reminders
  const shouldSendEmail = birthdayReminderSettings.some(setting => setting === difference)

  
  if (shouldSendEmail) {
    // Find the email of the owner of the birthday reminder
    const email = users.find((user) => user._id.toString() === birthday.userId.toString()).username
    console.log(email)

    let mailDetails = {
      from: 'birthdayremindersender@gmail.com',
      to: email,
      subject: 'Birthday reminder!',
      text: `Hey There! Looks like ${birthday.firstName} ${birthday.lastName} has a birthday ${difference === 0 ? 'TODAY!' : `in ${difference} days`}! Don't forget to get them something nice! ${birthday.otherInfo}`
    };

    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log('error occured', err.message);
      } else {
        console.log('-----------------------');
        console.log('email sent successfully');
      }
    });
  }
})
};

////////////////////////////////////////

require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid';

const UserSchema = new mongoose.Schema({
  username: {
    type: mongoose.SchemaTypes.Email,
    required: true, 
    correctTld: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex")
  },
  birthdayReminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Birthday"
  }]
});

const BirthdaySchema = new mongoose.Schema({
 firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // behöver fixa denna för att kunna sätta default värdet till [0], verkar inte fungera
  birthdayReminderSettings: {
    type: Array,
    default: 0
  },
  otherInfo: {
    type: String,
    maxlength: 250
  }
})

const User = mongoose.model("User", UserSchema);
const Birthday = mongoose.model("Birthday", BirthdaySchema);

///////////// Endpoints for user ////////////////////

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  try {
    const salt = bcrypt.genSaltSync();
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        response: "Password must be at least 8 characters long"
      });
    } else {
      const newUser = await new User({username, password: bcrypt.hashSync(password, salt)}).save();
      res.status(201).json({
        success: true,
        response: {
          accessToken: newUser.accessToken,
          username: newUser.username,
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

app.delete('/user', authenticateUser);
app.delete('/user', async (req, res) => {
  const { id } = req.body;

  console.log(req.body)

  const userToDelete = await User.findByIdAndDelete(id);
  try {
    if (userToDelete) {
      res.status(200).json(userToDelete);
    } else {
      res
        .status(404)
        .json({ success: false, response: 'User was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.patch('/change-password', authenticateUser);
app.patch("/change-password", async (req, res) => {
  const { id, password } = req.body;

  console.log(req.body)
  try {
    const salt = bcrypt.genSaltSync();
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        response: "Password must be at least 8 characters long"
      });
    } else {
      const passwordToUpdate = await User.findByIdAndUpdate(
        {_id: id},
        {password: bcrypt.hashSync(password, salt)},
        { new: true }
      );
      res.status(200).json({
        success: true,
        response: passwordToUpdate
      });
    }
  } catch(error) {
      res.status(400).json({
        success: false,
        response: error
      });
  }
});

/////////////////////////////////////////////////////

//////// Endpoints for birthday reminders ///////////

app.post('/birthday', authenticateUser);
app.post("/birthday", async (req, res) => {
  const {firstName, lastName, birthDate, userId, birthdayReminderSettings, otherInfo} = req.body;

  console.log("birthDate:", birthDate)

  try {
    const newBirthday = await new Birthday({firstName, lastName, birthDate, userId, birthdayReminderSettings, otherInfo}).save();
    res.status(201).json({success: true, response: newBirthday});
  }catch (error){
    res.status(400).json({success: false, response: error});
  }
});

app.patch('/birthday', authenticateUser);
app.patch('/birthday', async (req, res) => {
  const {firstName, lastName, birthDate, id, birthdayReminderSettings, otherInfo} = req.body;

  console.log(req.body)

  const birthdayToUpdate = await Birthday.findByIdAndUpdate(
    {_id: id},
    { 
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      birthdayReminderSettings: birthdayReminderSettings,
      otherInfo: otherInfo
    },
    { new: true }
  );
  try {
    if (birthdayToUpdate) {
      console.log(birthdayToUpdate);
      res.status(200).json(birthdayToUpdate);
    } else {
      res
        .status(404)
        .json({ success: false, response: 'Birthday was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.delete('/birthday', authenticateUser);
app.delete('/birthday', async (req, res) => {
  const { id } = req.body;

  console.log(req.body)

  const birthdayToDelete = await Birthday.findByIdAndDelete(id);
  try {
    if (birthdayToDelete) {
      res.status(200).json(birthdayToDelete);
    } else {
      res
        .status(404)
        .json({ success: false, response: 'Birthday was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.get('/birthday', authenticateUser);
app.get('/birthday', async (req, res) => {
  const { id } = req.body;

  console.log(req.body)

  const birthday = await Birthday.findById(id);
  try {
    if (birthday) {
      res.status(200).json(birthday);
    } else {
      res
        .status(404)
        .json({ success: false, response: 'Birthday was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.get('/all-birthdays', authenticateUser);
app.get('/all-birthdays', async (req, res) => {
  const { userId } = req.body;

  console.log(req.body)

  // const birthdays = await Birthday.findById(userId);
  const birthdays = await Birthday.find({userId})

  try {
    if (birthdays) {
      res.status(200).json(birthdays);
    } else {
      res
        .status(404)
        .json({ success: false, response: 'Birthday was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});


// Put in express list node
app.get("/", (req, res) => {
  res.send("Hello Viktor, Joel and Nina");
});

app.get('/cron', (req, res) => {
  res.json({
    cron: cronJob
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
