"use strict";


function argCheck(found, expMin, expMax) {
  if (found.length < expMin || found.length > expMax) {   // argCheck
    throw new Error('Incorrect number of arguments');   // argCheck
  }   // argCheck


  for (let i = 0; i < found.length; i++) {   // argCheck

    if (!arguments[i + 3] || !found[i]) continue;   // argCheck

//    print("TEST " + found[i] + " " + arguments[i + 3]   // argCheck
//    + " " + (found[i] instanceof Event)   // argCheck
//    + " " + (found[i] instanceof arguments[i + 3])   // argCheck
//    + "\n");   // ARG CHECK


    if (!(found[i] instanceof arguments[i + 3])) {   // argCheck
      throw new Error(`parameter ${i + 1} is of incorrect type.`);   // argCheck
    }   // argCheck
  }   // argCheck
}   // argCheck


module.exports = argCheck;