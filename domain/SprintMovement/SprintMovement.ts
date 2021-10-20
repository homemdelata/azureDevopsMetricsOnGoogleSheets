import{SprintMovementAction} from "./SprintMovementAction"

export class SprintMovement {

    backlogItemID: number;
    sprint: string;
    date: Date;
    action: any;

    constructor(
        backlogItemID: number,
        sprint: string,
        recordDate: Date,
        action: SprintMovementAction) {

        this.backlogItemID = backlogItemID;
    
        this.sprint = sprint;
    
        this.date = recordDate;
    
        this.action = action;
    }
}