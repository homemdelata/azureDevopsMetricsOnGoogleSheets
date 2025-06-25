import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";
import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";
import { BacklogItemStatus } from "../../domain/BacklogItem/BacklogItemStatus";
import { BacklogItemType } from "../../domain/BacklogItem/BacklogItemType";

export class GoogleSheetsBacklogItemRepository implements BacklogItemRepository{
    private backlogItemsSheetName: string;
    private holidays: Date[];

    constructor (backlogItemsSheetName: string, holidaysSheetName?:string){
        this.backlogItemsSheetName = backlogItemsSheetName;
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
        throw new Error("Method not implemented.");
    }

    WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void {
        
        var dataSheet = SpreadsheetApp.getActive().getSheetByName(this.backlogItemsSheetName);

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
                'Ordem Geral'
                ]
            ];

        var workItemsArray = Array.from(backlogItems.values());
        var rowsNum = workItemsArray.length+1;
        var colsNum = values[0].length;

        for (var i=0; i < workItemsArray.length; i++) {
            values[i+1] = this.ConvertBacklogItemToRow(workItemsArray[i]);
        }

        dataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);
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

        return row;
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

}
