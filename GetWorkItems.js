function getWorkItems(context) {

  var data = {
    "query" : context.wiql
  }
  var options = {
    'method' : 'post',
    'headers': context.headers,
    'payload': JSON.stringify(data),
    'contentType': 'application/json',
    'muteHttpExceptions': true
  }
  var url = context.baseURL + '_apis/wit/wiql?api-version=6.0';
  var response = UrlFetchApp.fetch(url, options);
  var responseJSON = JSON.parse(response.getContentText());
  var workItemsURLs = responseJSON['workItems'];

  var requests = []

  for(var i = 0; i < workItemsURLs.length; i++) {
    
    requests[i] = {
      'headers': context.headers,
      'url': workItemsURLs[i]['url'] + '?$expand=all',
      'muteHttpExceptions': true
    }
  }

  var workItemsResponses = UrlFetchApp.fetchAll(requests);

  var workItems = new Map();
  var updates = [];

  for(var i = 0; i < workItemsResponses.length; i++) {

    var jsonWorkItem = JSON.parse(workItemsResponses[i].getContentText());
    workItems.set(jsonWorkItem.id, new WorkItem(jsonWorkItem));

    updates[i] = {
      'headers': context.headers,
      'url': jsonWorkItem._links.workItemUpdates.href + '?$expand=all',
      'muteHttpExceptions': true
    }

  }

  var updatesResponses = UrlFetchApp.fetchAll(updates);

  for(var i = 0; i < updatesResponses.length; i++) {
    var jsonUpdates = JSON.parse(updatesResponses[i].getContentText());
    var workItemId = jsonUpdates.value[0].workItemId;
    workItems.get(workItemId).parseUpdates(jsonUpdates);
  }


  return workItems;

}
