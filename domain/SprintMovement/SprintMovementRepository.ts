import { BacklogItem } from "../BacklogItem/BacklogItem";

export interface SprintMovementRepository {

    WriteSprintMovements(backlogItems: Map<number, BacklogItem>): void;

}