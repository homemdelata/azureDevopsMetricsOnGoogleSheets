function onOpen() {

  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Atualizar Dados')
      .addItem('Pegar dados do Azure Devops', 'getAzureDevopsWorkItems')
      .addToUi();

  refreshData();
  
}

function getAzureDevopsWorkItems() {
  refreshData();
}