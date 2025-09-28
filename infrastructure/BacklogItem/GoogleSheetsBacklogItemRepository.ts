import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";
import { BacklogItemFactory } from "../../domain/BacklogItem/BacklogItemFactory";
import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";
import { BacklogItemStatus } from "../../domain/BacklogItem/BacklogItemStatus";
import { BacklogItemType } from "../../domain/BacklogItem/BacklogItemType";
import { SprintMovement } from "../../domain/SprintMovement/SprintMovement";
import { SprintMovementFactory } from "../../domain/SprintMovement/SprintMovementFactory";

export class GoogleSheetsBacklogItemRepository implements BacklogItemRepository{
    private backlogItemsDataSheet: GoogleAppsScript.Spreadsheet.Sheet;
    private holidays: Date[];
    private sprintMovementsDataSheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor (backlogItemsSheetName: string, sprintMovementsSheetName: string, holidaysSheetName?:string){
        this.backlogItemsDataSheet = SpreadsheetApp.getActive().getSheetByName(backlogItemsSheetName);
        this.sprintMovementsDataSheet = SpreadsheetApp.getActive().getSheetByName(sprintMovementsSheetName);
        this.holidays = [];
        if (holidaysSheetName)
        {
            var holidaysRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(holidaysSheetName).getValues();

            for (var i = 0; i < holidaysRange.length; i++) {
                if (holidaysRange[i] && holidaysRange[i].toString() != "")
                    this.holidays[i] = new Date(holidaysRange[i].toString());
            }

        }
    }

    GetAllBacklogItems(): Map<number, BacklogItem> {
        const backlogItemsSheetData = this.backlogItemsDataSheet.getDataRange().getValues();
        var backlogItems = new Map<number, BacklogItem>();

        for (var i=1; i < backlogItemsSheetData.length; i++) {
            var backlogItem = this.ConvertRowToBacklogItem(backlogItemsSheetData[i]);
            backlogItems.set(backlogItem.id, backlogItem);
        }

        const sprintMovementsSheetData = this.sprintMovementsDataSheet.getDataRange().getValues();
        for (var i=1; i < sprintMovementsSheetData.length; i++) {
            var workItemId = parseInt(sprintMovementsSheetData[i][0].toString());
            backlogItems.get(workItemId)?.sprintMovements.push(this.ConvertRowToSprintMovement(sprintMovementsSheetData[i]));
        }

        return backlogItems;
    }



    GetLastUpdatedBacklogItems(lastUpdateDate: Date): Map<number, BacklogItem> {
        throw new Error("Method not implemented.");
    }

    MergeBacklogItems(destinationWorkItems: Map<number, BacklogItem>, sourceLastUpdatedWorkItems: unknown): Map<number, BacklogItem> {
        throw new Error("Method not implemented.");
    }
    
    WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void {
        
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
                'Lead Time',
                'Current Sprint',
                'Ordem Geral',
                'Board Column'
                ]
            ];

        var workItemsArray = Array.from(backlogItems.values());
        var rowsNum = workItemsArray.length+1;
        var colsNum = values[0].length;

        for (var i=0; i < workItemsArray.length; i++) {
            values[i+1] = this.ConvertBacklogItemToRow(workItemsArray[i]);
        }

        this.backlogItemsDataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);
    }

    ConvertBacklogItemToRow(backlogItem: BacklogItem): string[] {
        var row = [];

        row[0] = backlogItem.id;
        row[1] = this.convertBacklogItemTypeToString(backlogItem.type);
        row[2] = backlogItem.title;
        row[3] = this.convertBacklogItemStatusToString(backlogItem.state);
        row[4] = backlogItem.tags;
        row[5] = backlogItem.storyPoints ? backlogItem.storyPoints : "";
        row[6] = Utilities.formatDate(backlogItem.createDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss');
        row[7] = backlogItem.startDate ? Utilities.formatDate(backlogItem.startDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
        row[8] = backlogItem.resolvedDate ? Utilities.formatDate(backlogItem.resolvedDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
        row[9] = backlogItem.doneDate ? Utilities.formatDate(backlogItem.doneDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
        row[10] = backlogItem.removedDate ? Utilities.formatDate(backlogItem.removedDate, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss') : "";
        var cycleTime = backlogItem.cycleTime(this.holidays);
        row[11] = cycleTime != undefined ? cycleTime : "";
        var leadTime = backlogItem.leadTime(this.holidays)
        row[12] = leadTime != undefined ? leadTime : "";
        row[13] = backlogItem.currentSprint;
        row[14] = backlogItem.orderRank;
        row[15] = backlogItem.boardColumn;

        return row;
    }

    ConvertRowToBacklogItem(row: string[]): BacklogItem {
        var backlogItem = BacklogItemFactory.CreateBacklogItemFromStrings(
            row[0],
            row[1],
            row[2],
            row[3],
            row[6],
            row[7],
            row[8],
            row[9],
            row[10],
            row[5],
            row[4],
            row[13],
            row[14],
            row[15]
        )

        return backlogItem;
    }

    private convertBacklogItemTypeToString(backlogItemType: BacklogItemType) :string {
        switch (backlogItemType) {
            case BacklogItemType.Bug:
                return "Bug";
            case BacklogItemType.ProductBacklogItem:
                return "Product Backlog Item";
            case BacklogItemType.TeamTask:
                return "Team Task";
            case BacklogItemType.UserStory:
                return "User Story";
            case BacklogItemType.Spike:
                return "Spike";
            case BacklogItemType.TechnicalDebt:
                return "Technical Debt";
            default:
                throw new Error("Invalid Type value");
        }

    }
    private convertBacklogItemStatusToString(backlogItemStatus: BacklogItemStatus) :string {
        switch (backlogItemStatus) {
            case BacklogItemStatus.TODO:
                return "New";
            case BacklogItemStatus.DOING:
                return "Active";
            case BacklogItemStatus.RESOLVED:
                return "Resolved";
            case BacklogItemStatus.DONE:
                return "Closed";
            case BacklogItemStatus.REMOVED:
                return "Removed";
            default:
                throw new Error("Invalid State value");
        }
    }

    WriteSprintMovements(backlogItems: Map<number, BacklogItem>): void {
        var values = [
            [
                'Work Item ID',
                'Sprint',
                'Data',
                'Entrada/Saída',
                'Mov. Story Points'
            ]
        ];

        backlogItems.forEach((backlogItem: BacklogItem) => {
            values.push.apply(values, this.ConvertSprintMovementToRow(backlogItem));
        });

        var rowsNum = values.length;
        var colsNum = values[0].length;
        
        this.sprintMovementsDataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);
    }

    ConvertSprintMovementToRow(backlogItem: BacklogItem): string[] {
        var sprintMovementRows = [];

        for (var i=0; i < backlogItem.sprintMovements.length; i++) {
            var row = []
            row[0] = backlogItem.id.toString();
            row[1] = backlogItem.sprintMovements[i].sprint;
            row[2] = Utilities.formatDate(backlogItem.sprintMovements[i].date, 'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss');
            row[3] = backlogItem.sprintMovements[i].action.toString();
            row[4] = (backlogItem.storyPoints * backlogItem.sprintMovements[i].action).toString();
            sprintMovementRows.push(row);
        }

        return sprintMovementRows;
    }

    ConvertRowToSprintMovement(row: string[]): SprintMovement {
        var sprintMovement = SprintMovementFactory.CreateSprintMovementFromStrings(
            row[0],
            row[1],
            row[2],
            row[3]
        );

        return sprintMovement;
    }


}
