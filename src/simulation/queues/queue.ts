
export enum QueueTypes{

    fifo=0,
    filo,
    priority

}

export class Queue<T> {

    private head:Array<T>;
    private tail:Array<T>;
    private index:number;
    private headLength:number;
    public  length:number;
    




 

    constructor(){
        this.head = [];
        this.tail = [];
        
        this.index = 0;
        this.headLength = 0;
        this.length = 0;
    }
public leave(item :T){

}

public enqueue(item : T){
      this.push(item);
}

public peek() : T{
   if (this.index >= this.headLength) {
    // When the head is empty, swap it with the tail to get fresh items.
    var t = this.head;
    t.length = 0;
    this.head = this.tail;
    this.tail = t;
    this.index = 0;
    this.headLength = this.head.length;
    if (!this.headLength) {
      return;
    }


  }

  // There was an item in the head, let's pull it out.
  var value = this.head[this.index];


  return value;
}

public dequeue() :T {

    return this.shift();
}

// Get an item from the front of the queue.
private shift() : T {
  if (this.index >= this.headLength) {
    // When the head is empty, swap it with the tail to get fresh items.
    var t = this.head;
    t.length = 0;
    this.head = this.tail;
    this.tail = t;
    this.index = 0;
    this.headLength = this.head.length;
    if (!this.headLength) {
      return;
    }
  }

  // There was an item in the head, let's pull it out.
  var value = this.head[this.index];
  // And remove it from the head
  if (this.index < 0) {
    delete this.head[this.index++];
  }
  else {
    this.head[this.index++] = undefined;
  }
  this.length--;
  return value;
};

// Insert a new item at the front of the queue.
private unshift(item : T) : Queue<T>{
  this.head[--this.index] = item;
  this.length++;
  return this;
};

// Push a new item on the end of the queue.
private push(item : T) : Queue<T>{
  // Pushes always go to the write-only tail
  this.length++;
  this.tail.push(item);
  return this;
};
  
}
