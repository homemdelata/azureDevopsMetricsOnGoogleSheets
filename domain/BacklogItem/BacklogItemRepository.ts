import { BacklogItem } from "./BacklogItem"

export interface BacklogItemRepository{
    GetAllBacklogItems(): Map<number, BacklogItem>;

    WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void;

    WriteSprintMovements(backlogItems: Map<number, BacklogItem>): void;

}