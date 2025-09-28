import { BacklogItem } from "./BacklogItem"

export interface BacklogItemRepository{
    GetAllBacklogItems(): Map<number, BacklogItem>;

    GetLastUpdatedBacklogItems(lastUpdateDate: Date): Map<number, BacklogItem>;

    MergeBacklogItems(destinationWorkItems: Map<number, BacklogItem>, sourceLastUpdatedWorkItems: Map<number, BacklogItem>): Map<number, BacklogItem>;

    WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void;

    WriteSprintMovements(backlogItems: Map<number, BacklogItem>): void;

}