import { BacklogItem } from "./BacklogItem";
import { BacklogItemStatus } from "./BacklogItemStatus";
import { BacklogItemType } from "./BacklogItemType";

export class BacklogItemFactory {

    public static CreateBacklogItemFromStrings(
        idString: string,
        typeString: string, 
        title: string, 
        stateString: string, 
        createDateString: string, 
        startDateString: string, 
        resolvedDateString: string,
        doneDateString: string,
        removedDateString: string,
        storyPointsString: string,
        tags: string,
        currentSprint: string,
        orderRankString:string,
        boardColumn: string,
        parentId: string) : BacklogItem{

        var id : number = parseInt(idString);
        var type : BacklogItemType = BacklogItemType[typeString];
        var state : BacklogItemStatus = BacklogItemStatus[stateString];
        var createDate : Date = new Date(createDateString);
        var startDate : Date = startDateString ? new Date(startDateString) : null;
        var resolvedDate : Date = resolvedDateString ? new Date(resolvedDateString) : null;
        var doneDate : Date = doneDateString ? new Date(doneDateString) : null;
        var removedDate : Date = removedDateString ? new Date(removedDateString) : null;
        var storyPoints : number = storyPointsString ? parseInt(storyPointsString) : null;
        var orderRank : number = orderRankString ? parseInt(orderRankString) : null;
        var boardColumn : string = boardColumn ? boardColumn : "";
        var parentIdNum : number = parentId ? parseInt(parentId) : null;

        var backlogItem : BacklogItem = new BacklogItem(
            id,
            type,
            title,
            state,
            createDate,
            startDate,
            resolvedDate,
            doneDate,
            removedDate,
            storyPoints,
            tags,
            currentSprint,
            orderRank,
            boardColumn,
            parentIdNum
        )

        return backlogItem;

    }

}