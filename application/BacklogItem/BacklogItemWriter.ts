import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";
import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";

export class BacklogItemWriter {
    private backlogItemRepository: BacklogItemRepository;

    constructor (backlogItemRepository: BacklogItemRepository)
    {
        this.backlogItemRepository = backlogItemRepository;
    }

    public WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void {
        this.backlogItemRepository.WriteBacklogItems(backlogItems);
    }

    WriteSprintMovements(backlogItems: Map<number, BacklogItem>) {
        this.backlogItemRepository.WriteSprintMovements(backlogItems);
    }


}