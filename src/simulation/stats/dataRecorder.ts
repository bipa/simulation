import {Simulation} from '../simulation';
import {DataRecord} from './DataRecord';


export class PopulationRecord{
  current:number;
  sizeRecord:DataRecord;
  durationRecord:DataRecord;
}




export class DataSeries {


    name:string;
    Count:number;
    W :  number;
    A : number;
    Q: number;
    Max:number;
    Min:number;
    Sum:number;




  constructor(name:string = null) {
    this.name = name;
    this.reset();
  }

  reset() {
    this.Count = 0;
    this.W = 0.0;
    this.A = 0.0;
    this.Q = 0.0;
    this.Max = -Infinity;
    this.Min = Infinity;
    this.Sum = 0;

  }


  record(value : number, weight : number = 1) {

    const w = weight;

        // document.write("Data series recording " + value + " (weight = " + w + ")\n");

    if (value > this.Max) this.Max = value;
    if (value < this.Min) this.Min = value;
    this.Sum += value;
    this.Count ++;
   
   

        // Wi = Wi-1 + wi
    this.W = this.W + w;

    if (this.W === 0) {
      return;
    }

        // Ai = Ai-1 + wi/Wi * (xi - Ai-1)
    const lastA = this.A;

    this.A = lastA + (w / this.W) * (value - lastA);

        // Qi = Qi-1 + wi(xi - Ai-1)(xi - Ai)
    this.Q = this.Q + w * (value - lastA) * (value - this.A);
        // print("\tW=" + this.W + " A=" + this.A + " Q=" + this.Q + "\n");
  }

  get count() {
    return this.Count;
  }

  get min() {
    return this.Min;
  }

  get max() {
    return this.Max;
  }

  get range() {
    return this.Max - this.Min;
  }

  get sum() {
    return this.Sum;
  }

  get sumWeighted() {
    return this.A * this.W;
  }

 get average() {
    return this.A;
  }

  get variance() {
    return this.Q / this.W;
  }

  get deviation() {
    return Math.sqrt(this.variance);
  }


  report() : DataRecord{
    let rec = new DataRecord();

    rec.average = this.average;
    rec.count = this.count;
    rec.deviation = this.deviation;
    rec.max = this.max;
    rec.min = this.min;
    rec.range = this.range;
    rec.sum = this.sum;
    rec.sumWeighted = this.sumWeighted;
    rec.variance = this.variance;





    return rec;
  }
}

export class TimeSeries {


    dataSeries:DataSeries;
    lastValue:number;
    lastTimestamp: number;


  constructor(name:string = null) {
    this.dataSeries = new DataSeries(name);
  }

  reset() {
    this.dataSeries.reset();
    this.lastValue = NaN;
    this.lastTimestamp = NaN;
  }





  record(value, timestamp) {
      

    if (!isNaN(this.lastTimestamp)) {
      this.dataSeries.record(this.lastValue, timestamp - this.lastTimestamp);
    }

    this.lastValue = value;
    this.lastTimestamp = timestamp;
  }

  finalize(timestamp) {
      

    this.record(NaN, timestamp);
  }

  get count() {
    return this.dataSeries.count;
  }

  get min() {
    return this.dataSeries.min;
  }

  get max() {
    return this.dataSeries.max;
  }

  get range() {
    return this.dataSeries.range;
  }

  get sum() {
    return this.dataSeries.sum;
  }

  get average() {
    return this.dataSeries.average;
  }

  get deviation() {
    return this.dataSeries.deviation;
  }

  get variance() {
    return this.dataSeries.variance;
  }


  report() : DataRecord {
      return this.dataSeries.report();
  }
}

export class Population {

    sizeSeries:TimeSeries;
    durationSeries:DataSeries;
    name:string;
    population:number;

  constructor(name:string = null) {
    this.name = name;
    this.population = 0;
    this.sizeSeries = new TimeSeries(name);
    this.durationSeries = new DataSeries(name);
  }

  reset() {
    this.sizeSeries.reset();
    this.durationSeries.reset();
    this.population = 0;
  }

  enter(timestamp) {

    this.population ++;
    this.sizeSeries.record(this.population, timestamp);
  }

  leave(arrivalAt, leftAt) {

    this.population --;
    this.sizeSeries.record(this.population, leftAt);
    this.durationSeries.record(leftAt - arrivalAt);
  }

  get current() {
    return this.population;
  }

  finalize(timestamp) {
    this.sizeSeries.finalize(timestamp);
  }

  report() : PopulationRecord {

    let pR = new PopulationRecord();
    pR.current = this.current;
    pR.sizeRecord = this.sizeSeries.report();
    pR.durationRecord = this.durationSeries.report();
    return pR;
  }
 
}

// export { DataSeries, TimeSeries, Population };

module.exports.DataSeries = DataSeries;
module.exports.TimeSeries = TimeSeries;
module.exports.Population = Population;