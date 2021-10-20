function dayDiff(startDate, endDate)
{
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((endDate - startDate) / oneDay));
}

function workingDaysDiff(startDate, endDate)
{
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var days = Math.round(Math.abs((endDate - startDate) / oneDay));

  // remove fins de semana de semanas inteiras
  var weeks = Math.floor(days / 7);
  days -= weeks * 2;

  // casos especiais
  var startDay = startDate.getDay();
  var endDay = endDate.getDay();

  if (startDay - endDay > 1)
  {
    days -= 2;
  }

  if (startDay == 0 && endDay != 6)
  {
    days--;
  }

  if (endDay == 6 && startDay != 0)
  {
    days--;
  }

  var holidays = getHolidays();

  holidays.forEach(day => {
    if ((day[0] >= startDate) && (day[0] <= endDate)) {
      /* If it is not saturday (6) or sunday (0), substract it */
      if ((day[0].getDay() % 6) != 0) {
        days--;
      }
    }
  });

  return days;
}


function getHolidays()
{
  var holidaysRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Feriados").getValues();

  var holidays = [];

  for (var i = 0; i < holidaysRange.length; i++) {
    if (holidaysRange[i] != "")
      holidays[i] = holidaysRange[i];
  }

  return holidays;
}