import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";

export class RefreshBacklogItemsUseCase {
    execute(sourceBacklogItemRepository: BacklogItemRepository,destinationBacklogItemRepository: BacklogItemRepository, lastUpdateDate: Date): void {
        var destinationWorkItems = destinationBacklogItemRepository.GetAllBacklogItems();
        var sourceLastUpdatedWorkItems = sourceBacklogItemRepository.GetLastUpdatedBacklogItems(lastUpdateDate);
        var mergedWorkItems = destinationBacklogItemRepository.MergeBacklogItems(destinationWorkItems, sourceLastUpdatedWorkItems);
        destinationBacklogItemRepository.WriteBacklogItems(mergedWorkItems);
        console.log("Started to write movements: " + Date.now().toLocaleString);
        destinationBacklogItemRepository.WriteSprintMovements(mergedWorkItems);
        console.log("Finished to write movements: " + Date.now().toLocaleString);
    }
}