import {BacklogItemStatus} from "./BacklogItemStatus";
import { BacklogItemType } from "./BacklogItemType";
import { SprintMovement } from "../SprintMovement/SprintMovement"

export class BacklogItem
{
    id: number;
    type: BacklogItemType;
    title: string;
    state: BacklogItemStatus;
    createDate: Date;
    startDate: Date;
    resolvedDate: Date;
    doneDate: Date;
    removedDate: Date;
    storyPoints: number;
    tags: string;
    sprintMovements: SprintMovement[];
  
    constructor(id: number,
                type: BacklogItemType,
                title: string,
                state: BacklogItemStatus,
                createDate: Date,
                startDate: Date,
                resolvedDate: Date,
                doneDate: Date,
                removedDate: Date,
                storyPoints: number,
                tags: string
    )
    {
        this.id = id;

        this.type = type;

        this.title = title;

        this.state = state;

        this.createDate = createDate;
        
        this.startDate = startDate;

        this.resolvedDate = resolvedDate;

        this.doneDate = doneDate;

        if (!this.resolvedDate && this.doneDate)
            this.resolvedDate = this.doneDate;

        if (!this.startDate && this.resolvedDate)
            this.startDate = this.resolvedDate;

        this.removedDate = removedDate;

        this.storyPoints = storyPoints;

        this.tags = tags;

        this.sprintMovements = [];


    }

    cycleTime(holidays: Date[]) {
        if (!this.startDate || !this.resolvedDate)
            return undefined;

        return this.workingDaysDiff(this.startDate, this.resolvedDate, holidays);
    }

    leadTime(holidays: Date[]){
        if (!this.doneDate)
            return undefined;

        return this.workingDaysDiff(this.createDate, this.doneDate, holidays);
    }

    private workingDaysDiff(startDate: Date, endDate: Date, holidays: Date[])
    {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var days = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));

        // remove fins de semana de semanas inteiras
        var weeks = Math.floor(days / 7);
        days -= weeks * 2;

        // casos especiais
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();

        if (startDay - endDay > 1)
        {
            days -= 2;
        }

        if (startDay == 0 && endDay != 6)
        {
            days--;
        }

        if (endDay == 6 && startDay != 0)
        {
            days--;
        }

        holidays.forEach(day => {
            if ((day >= startDate) && (day <= endDate)) {
            /* If it is not saturday (6) or sunday (0), substract it */
            if ((day.getDay() % 6) != 0) {
                days--;
            }
        }
    });

  return days;
}


}