function refreshData() {

  var context = new Context();

  var workItems = getWorkItems(context);

  fillWorkItemsSheet(workItems);
  fillWorkItemsSprintsSheet(workItems);

}
