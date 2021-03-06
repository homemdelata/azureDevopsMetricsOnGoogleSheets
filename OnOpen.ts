import { BacklogItemReader } from "./application/BacklogItem/BacklogItemReader";
import { BacklogItemWriter } from "./application/BacklogItem/BacklogItemWriter";
import { SprintMovementWriter } from "./application/SprintMovement/SprintMovementWriter";
import { AzureDevopsBacklogItemRepository } from "./infrastructure/BacklogItem/AzureDevopsBacklogItemRepository"
import { GoogleSheetsBacklogItemRepository } from "./infrastructure/BacklogItem/GoogleSheetsBacklogItemRepository";
import { GoogleSheetsSprintMovementRepository } from "./infrastructure/SprintMovement/GoogleSheetsSprintMovementRepository";

function refreshFromServer(backlogItemsSheetName: string, sprintMovementsSheetName: string, holidaysSheetName?:string) {

    var dataSheet = SpreadsheetApp.getActive().getSheetByName('Dados Azure Devops');
    var data = dataSheet.getRange(1, 2, 4).getValues();

    var user = data[0][0];
    var token = data[1][0];
    var baseURL = data[3][0];
    var wiql = data[2][0];

    var azureDevopsBacklogItemRepository = new AzureDevopsBacklogItemRepository(user, token, baseURL, wiql);
    var backlogItemReader = new BacklogItemReader(azureDevopsBacklogItemRepository);

    var googleSheetsBacklogItemRepository = new GoogleSheetsBacklogItemRepository(backlogItemsSheetName, holidaysSheetName);
    var backlogItemWriter = new BacklogItemWriter(googleSheetsBacklogItemRepository);

    var googleSheetsSprintMovementRepository = new GoogleSheetsSprintMovementRepository(sprintMovementsSheetName);
    var sprintMovementWriter = new SprintMovementWriter(googleSheetsSprintMovementRepository);

    var workItems = backlogItemReader.GetAllBacklogItems();
    backlogItemWriter.WriteBacklogItems(workItems);
    console.log("Started to write movements: " + Date.now().toLocaleString);
    sprintMovementWriter.WriteSprintMovements(workItems);
    console.log("Finished to write movements: " + Date.now().toLocaleString);
    
}

function onOpen() {

    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Atualizar Dados')
        .addItem('Pegar dados do Azure Devops', 'getAzureDevopsWorkItems')
        .addToUi();

    refreshFromServer('WorkItems', 'WorkItems x Sprints', 'Feriados');
}

function getAzureDevopsWorkItems() {
    refreshFromServer('WorkItems', 'WorkItems x Sprints', 'Feriados');
}