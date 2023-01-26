export const getMailDetails = (email, birthday, difference) => {
  return {
    from: "The Happy Birthday Team <birthdayremindersender@gmail.com>",
    to: email,
    subject: "Birthday reminder!",
    html: `
        <table style="width:100%; border:5px dotted #f0c8b0; color: #303346; padding: 20px;text-align:center; max-width: 600px; margin: auto;"
          <tr>
            <th style="height:70px; font-size:32px">Hey there!</th>
          </tr>
          <tr style="height:40px">
            <td>
              Looks like <b>${birthday.firstName} ${
      birthday.lastName
    }</b> has a birthday ${
      difference === 0 ? "TODAY! 🎈🎈" : `in ${difference} days!`
    }
            </td>
          </tr>
          <tr style="height:40px">
            <td>Don't forget to get them something nice!</td>
          </tr>
          <tr style="height:40px">
            <td>Your notes:</td>
          </tr>
          <tr style="height:40px">
            <td>
              <i>
                <span style="font-size:20px">“</span>
                ${birthday.otherInfo}
                <span style="font-size:20px">”</span>
              </i>
            </td>
          </tr>
        </table>
        `,
  };
};
