import * as fs from "fs"
import { prependListener } from "process";

let Items : string[] = JSON.parse(fs.readFileSync("./ItemList.json").toString());

const BUY_INDEX : number = 0;
const SELL_INDEX : number = 1;

export interface ItemData {
    BuyData : number[];
    SellData : number[];
} 

export function GetItemData(Item : string) : ItemData {
    let Data : object = JSON.parse(fs.readFileSync("./Data/Data/" + Item.replace(":","")+".json").toString());
    return {BuyData : Data["buy"], SellData : Data["sell"]};
}

function AvregeDatapointSet(Points : number[]) : number[] { // From each point every 3h to every 6h by avreging
    let Result : number[] = [];
    for (let i : number = 0;i < Points.length/3;i++) {
        Result[i] = (Points[i*3] + Points[i*3 + 1] + Points[i*3 + 2]) /3;
    }
    return Result;
}

export function GetLast126HoursItemData(Item : string) : ItemData {
    let PriceData : ItemData = GetItemData(Item);
    return {
        BuyData: AvregeDatapointSet(PriceData.BuyData.slice(PriceData.BuyData.length - 63,PriceData.BuyData.length)),
        SellData: AvregeDatapointSet(PriceData.SellData.slice(PriceData.SellData.length - 63,PriceData.SellData.length))
    }
}

export function GetLast126Hours() : number[][][] {
    let InputTensor = [];

    for (let i : number = 0;i < Items.length;i++) {
        InputTensor[i] = [];
        let PriceData : ItemData = GetLast126HoursItemData(Items[i]); 
        InputTensor[i][BUY_INDEX] = PriceData.BuyData;
        InputTensor[i][SELL_INDEX] = PriceData.SellData;
    }

    return InputTensor;
}

export function GetPredictionForItem(Item : string) : ItemData {
    let Prediction : number[][][] = JSON.parse(fs.readFileSync("./Prediction.json").toString());
    let Index : number = Items.indexOf(Item);
    return {
        BuyData: Prediction[Index][BUY_INDEX],
        SellData: Prediction[Index][SELL_INDEX]
    };
}