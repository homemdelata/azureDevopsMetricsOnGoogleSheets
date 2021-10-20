const sprintRecordAction = {
  REMOVED: -1,
  INSERTED: 1
}

class SprintRecord {

  constructor(workItemID, sprint, recordDate, sprintRecordAction, effort) {

    this.workItemID = workItemID;

    this.sprint = sprint;

    this.date = recordDate;

    this.sprintRecordAction = sprintRecordAction;

    this.effortMovement = (effort) ? effort * sprintRecordAction : undefined;

  }

  toRow() {

    var row = [];

    row[0] = this.workItemID;
    row[1] = this.sprint;
    row[2] = Utilities.formatDate(this.date, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss');
    row[3] = this.sprintRecordAction;
    row[4] = this.effortMovement;

    return row;

  }
  
}
