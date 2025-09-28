import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";

export class RefreshBacklogItemsUseCase {
    execute(sourceBacklogItemRepository: BacklogItemRepository,destinationBacklogItemRepository: BacklogItemRepository): void {
        var workItems = sourceBacklogItemRepository.GetAllBacklogItems();
        destinationBacklogItemRepository.WriteBacklogItems(workItems);
        console.log("Started to write movements: " + Date.now().toLocaleString);
        destinationBacklogItemRepository.WriteSprintMovements(workItems);
        console.log("Finished to write movements: " + Date.now().toLocaleString);
    }
}