import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { MailService } from './MailService';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/project-final';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

/////////// EMAIL-SENDER /////////////
const cron = require('node-cron');
const cronJob = {
  every2sec: '*/2 * * * * *',
  testSchedule: '*/1 * * * *',
  schedule: '0 7 * * *',
  info: '“At 07:00 GMT every day .”'
};

cron.schedule(cronJob.every2sec, async () => {
  // Get all birthdays, find matching reminder settings and send email to respective user
  const birthdays = await Birthday.find();
  const users = await User.find();
  MailService(birthdays, users);
});
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
    default: () => crypto.randomBytes(128).toString('hex')
  },
  birthdayReminders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Birthday'
    }
  ]
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
    ref: 'User',
    required: true
  },
  birthdayReminderSettings: {
    type: Array,
    default: 0
  },
  otherInfo: {
    type: String,
    maxlength: 250
  }
});

const User = mongoose.model('User', UserSchema);
const Birthday = mongoose.model('Birthday', BirthdaySchema);

///////////// Endpoints for user ////////////////////

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    const salt = bcrypt.genSaltSync();
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        response: 'Password must be at least 8 characters long'
      });
    } else {
      const newUser = await new User({
        username,
        password: bcrypt.hashSync(password, salt)
      }).save();
      res.status(201).json({
        success: true,
        response: {
          accessToken: newUser.accessToken,
          username: newUser.username,
          id: newUser._id
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
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
  const accessToken = req.header('Authorization');
  try {
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      next();
    } else {
      res.status(401).json({
        response: 'Please log in',
        success: false
      });
    }
  } catch (error) {
    res.status(400).json({
      response: error,
      success: false
    });
  }
};

app.delete('/user', authenticateUser);
app.delete('/user', async (req, res) => {
  const { id } = req.body;

  console.log(req.body);

  const userToDelete = await User.findByIdAndDelete(id);
  try {
    if (userToDelete) {
      res.status(200).json(userToDelete);
    } else {
      res.status(404).json({ success: false, response: 'User was not found' });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.patch('/change-password', authenticateUser);
app.patch('/change-password', async (req, res) => {
  const { id, password } = req.body;

  console.log(req.body);
  try {
    const salt = bcrypt.genSaltSync();
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        response: 'Password must be at least 8 characters long'
      });
    } else {
      const passwordToUpdate = await User.findByIdAndUpdate(
        { _id: id },
        { password: bcrypt.hashSync(password, salt) },
        { new: true }
      );
      res.status(200).json({
        success: true,
        response: passwordToUpdate
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

/////////////////////////////////////////////////////

//////// Endpoints for birthday reminders ///////////

app.post('/birthday', authenticateUser);
app.post('/birthday', async (req, res) => {
  const {
    firstName,
    lastName,
    birthDate,
    userId,
    birthdayReminderSettings,
    otherInfo
  } = req.body;

  console.log('birthDate:', birthDate);

  try {
    const newBirthday = await new Birthday({
      firstName,
      lastName,
      birthDate,
      userId,
      birthdayReminderSettings,
      otherInfo
    }).save();
    res.status(201).json({ success: true, response: newBirthday });
  } catch (error) {
    res.status(400).json({ success: false, response: error });
  }
});

app.patch('/birthday', authenticateUser);
app.patch('/birthday', async (req, res) => {
  const {
    firstName,
    lastName,
    birthDate,
    id,
    birthdayReminderSettings,
    otherInfo
  } = req.body;

  console.log(req.body);

  const birthdayToUpdate = await Birthday.findByIdAndUpdate(
    { _id: id },
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

  console.log(req.body);

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

  console.log(req.body);

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

  console.log(req.body);

  // const birthdays = await Birthday.findById(userId);
  const birthdays = await Birthday.find({ userId });

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
app.get('/', (req, res) => {
  res.send('Hello Viktor, Joel and Nina');
});

app.get('/cron', (req, res) => {
  res.json({
    cron: cronJob
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
