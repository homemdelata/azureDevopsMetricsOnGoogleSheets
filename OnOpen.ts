import { BacklogItemReader } from "./application/BacklogItem/BacklogItemReader";
import { BacklogItemWriter } from "./application/BacklogItem/BacklogItemWriter";
import { RefreshBacklogItemsUseCase } from "./application/UseCases/RefreshBacklogItemsUseCase";
import { AzureDevopsBacklogItemRepository } from "./infrastructure/BacklogItem/AzureDevopsBacklogItemRepository"
import { GoogleSheetsBacklogItemRepository } from "./infrastructure/BacklogItem/GoogleSheetsBacklogItemRepository";

function refreshFromServer(backlogItemsSheetName: string, sprintMovementsSheetName: string, holidaysSheetName?:string) {

    var dataSheet = SpreadsheetApp.getActive().getSheetByName('Dados Azure Devops');
    var data = dataSheet.getRange(1, 2, 4).getValues();

    var user = data[0][0];
    var token = data[1][0];
    var baseURL = data[3][0];
    var wiql = data[2][0];

    var azureDevopsBacklogItemRepository = new AzureDevopsBacklogItemRepository(user, token, baseURL, wiql);
    var googleSheetsBacklogItemRepository = new GoogleSheetsBacklogItemRepository(backlogItemsSheetName, sprintMovementsSheetName, holidaysSheetName);

    const refreshBacklogItemsUseCase = new RefreshBacklogItemsUseCase();
    refreshBacklogItemsUseCase.execute(azureDevopsBacklogItemRepository, googleSheetsBacklogItemRepository)
    
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