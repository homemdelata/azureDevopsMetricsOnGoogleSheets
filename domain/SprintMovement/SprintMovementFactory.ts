import { SprintMovement } from "./SprintMovement";
import { SprintMovementAction } from "./SprintMovementAction";

export class SprintMovementFactory{

    public static CreateSprintMovementFromStrings(
        backlogItemIdString: string,
        sprint: string,
        movementDateString: string,
        movementActionString: string
    ) : SprintMovement {

        var backlogItemId : number = parseInt(backlogItemIdString);
        var movementDate : Date = new Date(movementDateString);
        var action : SprintMovementAction = SprintMovementAction[movementActionString];

        var sprintMovement = new SprintMovement(
            backlogItemId,
            sprint,
            movementDate,
            action
        )

        return sprintMovement;

    }
}