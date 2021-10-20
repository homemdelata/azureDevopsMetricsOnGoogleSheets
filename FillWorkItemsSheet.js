function fillWorkItemsSheet(workItems) {

  var dataSheet = SpreadsheetApp.getActive().getSheetByName('WorkItems');

  var values = [
    [
      'ID',
      'Tipo',
      'Título',
      'Estado',
      'Tags',
      'Story Points',
      'Data Criação',
      'Data Início',
      'Data Pronto para PROD',
      'Data Finalização',
      'Data Deleção',
      'Cycle Time',
      'Lead Time'
    ]
  ];

  var workItemsArray = Array.from(workItems.values());
  var rowsNum = workItemsArray.length+1;
  var colsNum = workItemsArray[0].toRow().length;

  for (var i=0; i < workItemsArray.length; i++) {
    values[i+1] = workItemsArray[i].toRow();
  }

  dataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);

}
