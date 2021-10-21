import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";
import { SprintMovement } from "../../domain/SprintMovement/SprintMovement";
import { SprintMovementAction } from "../../domain/SprintMovement/SprintMovementAction";
import { SprintMovementRepository } from "../../domain/SprintMovement/SprintMovementRepository";

export class GoogleSheetsSprintMovementRepository implements SprintMovementRepository {
    
    private sprintMovementsDataSheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor(sprintMovementsSheetName: string) {
        this.sprintMovementsDataSheet = SpreadsheetApp.getActive().getSheetByName(sprintMovementsSheetName);
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
            values.push.apply(values, this.ConvertBacklogItemToRow(backlogItem));
        });

        var rowsNum = values.length;
        var colsNum = values[0].length;
        
        this.sprintMovementsDataSheet.getRange(1,1,rowsNum, colsNum).setValues(values);
    }

    ConvertBacklogItemToRow(backlogItem: BacklogItem): string[] {
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

}