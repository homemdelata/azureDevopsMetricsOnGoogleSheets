import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";
import { SprintMovementRepository } from "../../domain/SprintMovement/SprintMovementRepository";

export class SprintMovementWriter {

    private sprintMovementRepository: SprintMovementRepository;

    constructor(sprintMovementRepository: SprintMovementRepository) {

        this.sprintMovementRepository = sprintMovementRepository;
    }

    public WriteSprintMovements(backlogItems: Map<number, BacklogItem>) {
        this.sprintMovementRepository.WriteSprintMovements(backlogItems);

    }
}