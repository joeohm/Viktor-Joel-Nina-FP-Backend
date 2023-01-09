# MailService(birthdays, users)

Sends emails to users with upcoming birthdays.

## Parameters

- `birthdays`: An array of birthday objects. Each birthday object should have the following properties:
  - `birthDate`: A JavaScript `Date` object representing the birth date.
  - `firstName`: A string representing the first name of the person whose birthday it is.
  - `lastName`: A string representing the last name of the person whose birthday it is.
  - `otherInfo`: A string containing any additional notes about the birthday.
  - `userId`: A string or object representing the unique identifier of the user who created the birthday reminder.
  - `birthdayReminderSettings`: An array of numbers representing the number of days before the birthday to send a reminder.
- `users`: An array of user objects. Each user object should have the following properties:
  - `_id`: A string or object representing the unique identifier of the user.
  - `username`: A string representing the email address of the user.

## Return value

None.

## Examples

```
const birthdays = [
    {
        birthDate: new Date('1995-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        otherInfo: 'Likes chocolate cake',
        userId: '123456',
        birthdayReminderSettings: [1, 7]
    }
];

const users = [
    {
        _id: '123456',
        username: 'john.doe@example.com'
    }
];

MailService(birthdays, users);
```

This will send an email to `john.doe@example.com` with a reminder that John Doe's birthday is in 1 or 7 days (depending on the current date). The email will contain the additional notes about John Doe's birthday ("Likes chocolate cake").

## Note

- The `MailService` function uses the `convertDate` and `differenceInDays` functions to compare the birth dates to the current date and determine when to send the emails.
- The `MailService` function sends emails using the [nodemailer](https://nodemailer.com/about/) library and the email credentials specified in the `MAILER_SERVICE`, `MAILER_USER`, and `MAILER_PASSWORD` environment variables.
- The `MailService` function logs to the console upon successful email sending and upon error.
