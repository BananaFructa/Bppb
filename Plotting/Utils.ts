
/**
* @param Array Any set of numerical values
* @returns The biggest value in the set
*/
    
export function  GetMaxFromList(Array : number[]) : number {
     let max = Array[0];
     for (let i = 1;i < Array.length;i++) {
        if (max < Array[i]) max = Array[i];
    }
    return max;
}

export function GetMaxAbsFromList(Array : number []) : number {
    let max = Array[0];
    for (let i = 1;i < Array.length;i++) {
       if (max < Abs(Array[i])) max = Abs(Array[i]);
   }
   return max;
}

/**
 * @param Array Any set if numerical values
 * @returns An array of the differences between each element of the input array
 */

export function GetDeltaArray(Array : number[]) : number[] {

    let DeltaArray = [];
    for (let i = 1;i < Array.length;i++) {
        DeltaArray[i-1] = Array[i] - Array[i-1];
    }
    return DeltaArray;
        
}

export function Abs(Value : number) : number {
    if (Value >= 0) return Value;
    else return -Value;
}