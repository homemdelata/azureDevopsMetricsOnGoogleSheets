class Context {

  constructor()
  {
    var dataSheet = SpreadsheetApp.getActive().getSheetByName('Dados Azure Devops');
    var data = dataSheet.getRange(1, 2, 4).getValues();

    var user = data[0][0];
    var token = data[1][0];

    this.headers = new Map();
    this.headers['Authorization'] = 'Basic ' + Utilities.base64Encode(user + ':' + token);

    this.baseURL = data[3][0];
    this.wiql = data[2][0];

    
  }
}
