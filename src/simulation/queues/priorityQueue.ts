


export class PriorityQueue<T>{


 defaultcomparator : Function  = function (a, b) {
    return a < b;
};


    array:Array<T>;
    size:number;
    compare:Function;



    constructor(comparator:Function){
        
        this.array = [];
        this.size = 0;
        this.compare = comparator || this.defaultcomparator;

    }



// Add an element the the queue
// runs in O(log n) time
add(myval:T) {
    var i = this.size;
    this.array[this.size] = myval;
    this.size += 1;
    var p;
    var ap;
    while (i > 0) {
        p = (i - 1) >> 1;
        ap = this.array[p];
        if (!this.compare(myval, ap)) {
             break;
        }
        this.array[i] = ap;
        i = p;
    }
    this.array[i] = myval;
};

// replace the content of the heap by provided array and "heapifies it"
heapify(arr) {
    this.array = arr;
    this.size = arr.length;
    var i;
    for (i = (this.size >> 1); i >= 0; i--) {
        this._percolateDown(i);
    }
};

// for internal use
percolateUp(i) {
    var myval = this.array[i];
    var p;
    var ap;
    while (i > 0) {
        p = (i - 1) >> 1;
        ap = this.array[p];
        if (!this.compare(myval, ap)) {
            break;
        }
        this.array[i] = ap;
        i = p;
    }
    this.array[i] = myval;
};


// for internal use
_percolateDown(i) {
    var size = this.size;
    var hsize = this.size >>> 1;
    var ai = this.array[i];
    var l;
    var r;
    var bestc;
    while (i < hsize) {
        l = (i << 1) + 1;
        r = l + 1;
        bestc = this.array[l];
        if (r < size) {
            if (this.compare(this.array[r], bestc)) {
                l = r;
                bestc = this.array[r];
            }
        }
        if (!this.compare(bestc, ai)) {
            break;
        }
        this.array[i] = bestc;
        i = l;
    }
    this.array[i] = ai;
};

// Look at the top of the queue (a smallest element)
// executes in constant time
//
// Calling peek on an empty priority queue returns
// the "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
peek():T {
    if(this.size == 0) return undefined;
    return this.array[0];
};

// remove the element on top of the heap (a smallest element)
// runs in logarithmic time
//
// If the priority queue is empty, the function returns the
// "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
// For long-running and large priority queues, or priority queues
// storing large objects, you may  want to call the trim function
// at strategic times to recover allocated memory.
poll() :T {
    if (this.size == 0) 
        return undefined;
    var ans = this.array[0];
    if (this.size > 1) {
        this.array[0] = this.array[--this.size];
        this._percolateDown(0 | 0);
    } else {
        this.size -= 1;
    }
    return ans;
};


// recover unused memory (for long-running priority queues)
trim() {
    this.array = this.array.slice(0, this.size);
};

// Check whether the heap is empty
isEmpty() {
    return this.size === 0;
};


}



