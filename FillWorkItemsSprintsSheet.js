function fillWorkItemsSprintsSheet(workItems) {

  var dataSheet = SpreadsheetApp.getActive().getSheetByName('WorkItems x Sprints');

  var values = [
    [
      'Work Item ID',
      'Sprint',
      'Data',
      'Entrada/Saída',
      'Mov. Story Points'
    ]
  ];

  var workItemsArray = Array.from(workItems.values());

  var sprintRecords = []

  for (var i=0; i < workItemsArray.length; i++) {
    sprintRecords.push(...workItemsArray[i].sprintsRecords)

  }

  var rowsNum = sprintRecords.length+1;
  var colsNum = sprintRecords[0].toRow().length;

  for (var i=0; i < sprintRecords.length; i++) {
    values[i+1] = sprintRecords[i].toRow();
  }

  dataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);
  
}
