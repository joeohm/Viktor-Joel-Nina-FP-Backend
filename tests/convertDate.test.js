import { convertDate } from "../MailService";

describe("convertDate", () => {
  it("It should convert birthyear to current year", () => {
    expect(convertDate(new Date("1991-09-09"))).toStrictEqual(
      new Date(`${new Date().getFullYear()}-09-09`)
    );
  });
  it("convert current year +1, If todays date is Dec and birthday is in Jan", () => {
    expect(convertDate(new Date("1991-01-09"))).toStrictEqual(
      new Date("2023-01-09")
    );
  });
});
