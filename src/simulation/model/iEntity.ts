
export interface IEntity{
    name;

    type:string;

    enqueue(timestamp:number);
    dequeue(timestamp:number);
}