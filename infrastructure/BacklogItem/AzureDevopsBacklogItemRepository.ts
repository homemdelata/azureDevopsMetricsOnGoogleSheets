import { BacklogItem } from "../../domain/BacklogItem/BacklogItem";
import { BacklogItemFactory } from "../../domain/BacklogItem/BacklogItemFactory";
import { BacklogItemRepository } from "../../domain/BacklogItem/BacklogItemRepository";
import { SprintMovement } from "../../domain/SprintMovement/SprintMovement";
import { SprintMovementAction } from "../../domain/SprintMovement/SprintMovementAction";
import { SprintMovementFactory } from "../../domain/SprintMovement/SprintMovementFactory";

export class AzureDevopsBacklogItemRepository implements BacklogItemRepository {

    private headers: GoogleAppsScript.URL_Fetch.HttpHeaders;
    private data: { query: string; };
    private options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
    private url: string;

    constructor (user: string,
        token: string,
        baseURL: string,
        wiql: string)
    {
        this.headers = this.createHttpHeaders(user, token);
        this.data = {
            "query" : wiql
        }

        this.options = this.createRequestOptions(this.headers, this.data);

        this.url = baseURL + '_apis/wit/wiql?api-version=6.0';

        

    }
    WriteSprintMovements(backlogItems: Map<number, BacklogItem>): void {
        throw new Error("Method not implemented.");
    }
    
    WriteBacklogItems(backlogItems: Map<number, BacklogItem>): void {
        throw new Error("Method not implemented.");
    }

    private createHttpHeaders(user: string, token: string) : GoogleAppsScript.URL_Fetch.HttpHeaders {
        var headers: GoogleAppsScript.URL_Fetch.HttpHeaders = {
            'Authorization': 'Basic ' + Utilities.base64Encode(user + ':' + token)
        }
    
        return headers;
    }

    private createRequestOptions(headers: GoogleAppsScript.URL_Fetch.HttpHeaders, paylod: any) : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
        var options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            'method' : 'post',
            'headers': headers,
            'payload': JSON.stringify(paylod),
            'contentType': 'application/json',
            'muteHttpExceptions': true
        }

        return options;
    }

    private convertAzureStateStringToBacklogItemStateString(azureStateString: string) :string {
        switch (azureStateString) {
            case "New":
                return "TODO";
            case "Active":
                return "DOING";
            case "Resolved":
                return "RESOLVED";
            case "Closed":
                return "DONE";
            case "Removed":
                return "REMOVED";
            default:
                throw new Error("Invalid State value");
        }

    }

    private fetchAllWithRetriesInChunks(
        requests: any[],
        chunkSize: number,
        maxAttempts: number = 3
    ): GoogleAppsScript.URL_Fetch.HTTPResponse[] {
        const allResponses: GoogleAppsScript.URL_Fetch.HTTPResponse[] = [];
        for (let i = 0; i < requests.length; i += chunkSize) {
            const chunk = requests.slice(i, i + chunkSize);
            let responses: GoogleAppsScript.URL_Fetch.HTTPResponse[] = [];
            let attempts = 0;
            let success = false;
            while (attempts < maxAttempts && !success) {
                try {
                    responses = UrlFetchApp.fetchAll(chunk);
                    success = true;
                } catch (e) {
                    attempts++;
                    if (attempts === maxAttempts) {
                        throw new Error(`Failed to fetch chunk after ${maxAttempts} attempts: ${e}`);
                    }
                    Utilities.sleep(1000);
                }
            }
            allResponses.push(...responses);
            Utilities.sleep(1000);
        }
        return allResponses;
    }

    GetAllBacklogItems(): Map<number, BacklogItem> {
        console.log('Starting to get the list of work items: ' + Date.now().toLocaleString());

        var response = UrlFetchApp.fetch(this.url, this.options);
        var responseJSON = JSON.parse(response.getContentText());

        var workItemsURLs = responseJSON['workItems'];

        var requests = []

        console.log('Parsing all urls to call: ' + Date.now().toLocaleString());

        for(var i = 0; i < workItemsURLs.length; i++) {

        requests[i] = {
            'headers': this.headers,
            'url': workItemsURLs[i]['url'] + '?$expand=all',
            'muteHttpExceptions': true
        }
        }

        console.log('Starting fetch all: ' + Date.now().toLocaleString());

        const chunkSize = 100;

        const workItemsResponses = this.fetchAllWithRetriesInChunks(requests, chunkSize);

        console.log('Starting to create the list in memory: ' + Date.now().toLocaleString());

        var backlogItems = new Map<number, BacklogItem>();
        var updates = [];

        for(var i = 0; i < workItemsResponses.length; i++) {
            
            var jsonBacklogItem = JSON.parse(workItemsResponses[i].getContentText());

            var idString = jsonBacklogItem.id;

            var fixedTypeString = jsonBacklogItem.fields['System.WorkItemType'].replace(/\s/g, "");
            var fixedStateString = this.convertAzureStateStringToBacklogItemStateString(jsonBacklogItem.fields['System.State']);
            var startDateString = jsonBacklogItem.fields['Custom.FixStartDate'] ? jsonBacklogItem.fields['Custom.FixStartDate'] : jsonBacklogItem.fields['Microsoft.VSTS.Common.ActivatedDate'];
            var resolvedDateString = jsonBacklogItem.fields['Custom.FixResolvedDate'] ? jsonBacklogItem.fields['Custom.FixResolvedDate'] : jsonBacklogItem.fields['Microsoft.VSTS.Common.ResolvedDate'];
            var doneDateString = jsonBacklogItem.fields['Custom.FixDoneDate'] ? jsonBacklogItem.fields['Custom.FixDoneDate'] : jsonBacklogItem.fields['Microsoft.VSTS.Common.ClosedDate'];

            var removedDateString = (jsonBacklogItem.fields['System.State'] == "Removed") ? jsonBacklogItem.fields['Microsoft.VSTS.Common.StateChangeDate'] : null;

            var newBacklogItem = BacklogItemFactory.CreateBacklogItemFromStrings(
                idString,
                fixedTypeString,
                jsonBacklogItem.fields['System.Title'],
                fixedStateString,
                jsonBacklogItem.fields['System.CreatedDate'],
                startDateString,
                resolvedDateString,
                doneDateString,
                removedDateString,
                jsonBacklogItem.fields['Microsoft.VSTS.Scheduling.StoryPoints'],
                jsonBacklogItem.fields['System.Tags'],
                jsonBacklogItem.fields['System.IterationPath'],
                jsonBacklogItem.fields['Microsoft.VSTS.Common.StackRank'],
                jsonBacklogItem.fields['System.BoardColumn']
            );
            backlogItems.set(parseInt(idString), newBacklogItem);

            updates[i] = {
                'headers': this.headers,
                'url': jsonBacklogItem._links.workItemUpdates.href + '?$expand=all',
                'muteHttpExceptions': true
            }

        }

        console.log('Finished processing the Work Items: ' + Date.now().toLocaleString());

        console.log('Starting processing updates: ' + Date.now().toLocaleString());

        const updatesChunkSize = 100;

        const updatesResponses = this.fetchAllWithRetriesInChunks(updates, updatesChunkSize);

        for(var i = 0; i < updatesResponses.length; i++) {
            var jsonUpdates = JSON.parse(updatesResponses[i].getContentText());
            var backlogItemId = jsonUpdates.value[0].workItemId;
            backlogItems.get(backlogItemId).sprintMovements = this.parseSprintMovementsFromUpdates(jsonUpdates);
        }
        console.log('Finished: ' + Date.now().toLocaleString());

        return backlogItems;
    }

    parseSprintMovementsFromUpdates(jsonUpdates: any): SprintMovement[] {
        var sprintMovements: SprintMovement[] = [];

        for (var i = 0; i < jsonUpdates.count; i++) {

            var update = jsonUpdates.value[i];

            var workItemId = update.workItemId;

            if (update.fields)
            {
                var updateDate = update.fields['System.ChangedDate'].newValue;

                //verifica entradas e saídas dos sprints
                if (update.fields['System.IterationPath'])
                {
                    var oldIterationPath = update.fields['System.IterationPath'].oldValue;
                    var newIterationPath = update.fields['System.IterationPath'].newValue;

                    if (oldIterationPath != undefined)
                        sprintMovements.push(SprintMovementFactory.CreateSprintMovementFromStrings(workItemId, oldIterationPath, updateDate, "REMOVED"));
                    
                    if (newIterationPath != "")
                        sprintMovements.push(SprintMovementFactory.CreateSprintMovementFromStrings(workItemId, newIterationPath, updateDate, "INSERTED"));
                }

                //verifica data de remoção
                if (update.fields['System.State'])
                {
                    var oldState = update.fields['System.State'].oldValue;
                    var newState = update.fields['System.State'].newValue;

                    if (oldState && oldState == "Removed")
                    {
                        //verifica se estava em um sprint para adicionar de novo
                        if (sprintMovements[sprintMovements.length - 1] && sprintMovements[sprintMovements.length - 1].action == SprintMovementAction.INSERTED)
                        {
                            var iterationPath = sprintMovements[sprintMovements.length - 1].sprint;
                            sprintMovements.push(SprintMovementFactory.CreateSprintMovementFromStrings(workItemId, iterationPath, updateDate, "INSERTED"));
                        }
                    }

                    if (newState == "Removed")
                    {
                        //verifica se estava em um sprint para remover do sprint
                        if (sprintMovements[sprintMovements.length - 1] && sprintMovements[sprintMovements.length - 1].action == SprintMovementAction.INSERTED)
                        {
                            var iterationPath = sprintMovements[sprintMovements.length - 1].sprint;
                            sprintMovements.push(SprintMovementFactory.CreateSprintMovementFromStrings(workItemId, iterationPath, updateDate, "REMOVED"));
                        }
                    }
                }
        
            }

        }

        return sprintMovements;
    }
}
