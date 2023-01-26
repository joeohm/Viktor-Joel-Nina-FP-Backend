import { differenceInDays } from "date-fns";
import { getMailDetails } from "./util";

const nodemailer = require("nodemailer");

export const convertDate = birthDate => {
  const day = String(birthDate.getDate()).padStart(2, 0);
  const month = String(birthDate.getMonth() + 1).padStart(2, 0); // getMonth() starts at 0

  // If birthday is in January, but today is December, add 1 year to converted year
  // Since 30 days is the maximum setting, only do this for January
  const convertedYear =
    month === "01" && new Date().getMonth() !== 0
      ? new Date().getFullYear() + 1
      : new Date().getFullYear();

  return new Date(`${convertedYear}-${month}-${day}`);
};

export const MailService = (birthdays, users) => {
  let mailTransporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD,
    },
  });

  // For every birthday, compare the birthdate with current date
  // if the difference in days matches one of the birthdayReminderSettings, send email
  birthdays.forEach(birthday => {
    const { birthDate, birthdayReminderSettings } = birthday;

    // In order to check for reminders every year, convert the birthdate to current year
    const convertedBirthDate = convertDate(birthDate);

    // new Date() but with time set to midnight UTC for comparison to work
    const today = new Date(new Date().setUTCHours(0, 0, 0, 0));

    // Compare the converted date to today's date and get the difference in days
    const difference = differenceInDays(convertedBirthDate, today);

    // Check if difference between dates corresponds with one of the settings for reminders
    const shouldSendEmail = birthdayReminderSettings.some(
      setting => setting === difference
    );

    if (shouldSendEmail) {
      // Find the email of the owner of the birthday reminder
      const email = users.find(
        user => user._id.toString() === birthday.userId.toString()
      ).username;

      const mailDetails = getMailDetails(email, birthday, difference);

      mailTransporter.sendMail(mailDetails, (err, data) => {
        if (err) {
          console.log("error occured", err.message);
        } else {
          console.log("-----------------------");
          console.log(email);
          console.log("email sent successfully");
        }
      });
    }
  });
};
