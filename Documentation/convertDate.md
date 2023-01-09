# convertDate(birthDate)

Converts a given birth date to a new date object with the current year.

## Parameters

- `birthDate`: A JavaScript `Date` object representing the birth date.

## Return value

A JavaScript `Date` object representing the converted date.

## Examples

```
const birthDate = new Date('1995-01-01');
console.log(convertDate(birthDate));
// Output: Mon Jan 01 2024 00:00:00 GMT+0000 (Greenwich Mean Time)
```

```
const birthDate = new Date('1995-02-01');
console.log(convertDate(birthDate));
// Output: Sat Feb 01 2023 00:00:00 GMT+0000 (Greenwich Mean Time)
```

## Note

- If the month of the `birthDate` is January, and the current month is not January, the returned date will have the current year plus 1. This is because the `birthDate` represents the next occurrence of the birth date, which will be in the following year, and because the maximum notification setting is 30 days in advance.
