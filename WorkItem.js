class WorkItem {

  constructor(workItemJSON) {

    this.id = workItemJSON.id;

    this.type = workItemJSON.fields['System.WorkItemType'];

    this.title = workItemJSON.fields['System.Title'];

    this.state = workItemJSON.fields['System.State'];

    this.tags = workItemJSON.fields['System.Tags'];

    this.createDate = new Date(workItemJSON.fields['System.CreatedDate']);
    
    this.startDate = (workItemJSON.fields['Custom.FixStartDate']) ? this.stringToDateIfPresent(workItemJSON.fields['Custom.FixStartDate']) : this.stringToDateIfPresent(workItemJSON.fields['Microsoft.VSTS.Common.ActivatedDate']);

    this.readyToPRODDate = (workItemJSON.fields['Custom.FixResolvedDate']) ? this.stringToDateIfPresent(workItemJSON.fields['Custom.FixResolvedDate']) : this.stringToDateIfPresent(workItemJSON.fields['Microsoft.VSTS.Common.ResolvedDate']);

    this.doneDate =  (workItemJSON.fields['Custom.FixDoneDate']) ? this.stringToDateIfPresent(workItemJSON.fields['Custom.FixDoneDate']) : this.stringToDateIfPresent(workItemJSON.fields['Microsoft.VSTS.Common.ClosedDate']);

    if (!this.readyToPRODDate && this.doneDate)
      this.readyToPRODDate = this.doneDate;

    if (!this.startDate && this.readyToPRODDate)
      this.startDate = this.readyToPRODDate;

    this.effort = workItemJSON.fields['Microsoft.VSTS.Scheduling.StoryPoints'];

    // Isso tá errado porque pode ser que acontceu alguma outra mudança, depois precisa melhorar
    if (this.state == "Removed")
      this.removedDate = this.stringToDateIfPresent(workItemJSON.fields['System.ChangedDate']);

    this.sprintsRecords = [];

  }

  stringToDateIfPresent(stringDate){
    return (stringDate != undefined) ? new Date(stringDate) : undefined;
  }

  getLeadTime() {
    if (!this.doneDate)
      return undefined;
    
    return workingDaysDiff(this.createDate, this.doneDate);
  }

  getCycleTime() {
    if (!this.startDate || !this.readyToPRODDate)
      return undefined;
    
    return workingDaysDiff(this.startDate, this.readyToPRODDate);
  }

  toRow() {

    var row = [];

    row[0] = this.id;
    row[1] = this.type;
    row[2] = this.title;
    row[3] = this.state;
    row[4] = this.tags;
    row[5] = (this.effort != undefined) ? this.effort : "";
    row[6] = Utilities.formatDate(this.createDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss');
    row[7] = (this.startDate != undefined) ? Utilities.formatDate(this.startDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
    row[8] = (this.readyToPRODDate != undefined) ? Utilities.formatDate(this.readyToPRODDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
    row[9] = (this.doneDate != undefined) ? Utilities.formatDate(this.doneDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
    row[10] = (this.removedDate != undefined) ? Utilities.formatDate(this.removedDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
    row[11] = (this.getCycleTime() != undefined) ? this.getCycleTime() : "";
    row[12] = (this.getLeadTime() != undefined) ? this.getLeadTime() : "";

    return row;

  }

  parseUpdates(updates){
    for (var i = 0; i < updates.count; i++){
      var upd = updates.value[i];

      

      if (upd.fields != undefined)
      {  
        var updateDate = new Date(upd.fields['System.ChangedDate'].newValue);

        //verifica entradas e saídas dos sprints
        if (upd.fields['System.IterationPath'] != undefined)
        {
          var oldIterationPath = upd.fields['System.IterationPath'].oldValue;
          var newIterationPath = upd.fields['System.IterationPath'].newValue;

          if (oldIterationPath != undefined)            
            this.sprintsRecords.push(new SprintRecord(this.id, oldIterationPath, updateDate, sprintRecordAction.REMOVED, this.effort));
          

          if (newIterationPath != "")
            this.sprintsRecords.push(new SprintRecord(this.id, newIterationPath, updateDate, sprintRecordAction.INSERTED, this.effort));

        }

        var teste = this;

        //verifica data de remoção
        if (upd.fields['System.State'] != undefined)
        {
          var oldState = upd.fields['System.State'].oldValue;
          var newState = upd.fields['System.State'].newValue;

          if (oldState != undefined && oldState == "Removed")
          {
            this.removedDate = undefined;
            //verifica se estava em um sprint para adicionar de novo
            if (this.sprintsRecords[this.sprintsRecords.length - 1] && this.sprintsRecords[this.sprintsRecords.length - 1].sprintRecordAction == sprintRecordAction.INSERTED)
            {
              var iterationPath = this.sprintsRecords[this.sprintsRecords.length - 1].sprint;
              this.sprintsRecords.push(new SprintRecord(this.id, iterationPath, updateDate, sprintRecordAction.INSERTED, this.effort));
            }
          }

          if (newState == "Removed")
          {
            this.removedDate = updateDate;

            //verifica se estava em um sprint para remover do sprint
            if (this.sprintsRecords[this.sprintsRecords.length - 1] && this.sprintsRecords[this.sprintsRecords.length - 1].sprintRecordAction == sprintRecordAction.INSERTED)
            {
              var iterationPath = this.sprintsRecords[this.sprintsRecords.length - 1].sprint;
              this.sprintsRecords.push(new SprintRecord(this.id, iterationPath, updateDate, sprintRecordAction.REMOVED, this.effort));
            }
          }
        }
      }
      
    }
  }


}