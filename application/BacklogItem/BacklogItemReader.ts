import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";
import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";

export class BacklogItemReader {

    private repository: BacklogItemRepository;

    constructor(repository: BacklogItemRepository) {
        this.repository = repository;
    }

    public GetAllBacklogItems(): Map<number, BacklogItem> {
        return this.repository.GetAllBacklogItems();
    }
}