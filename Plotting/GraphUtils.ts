import * as Utils from "./Utils"
import * as fs from "fs"
import * as Canvas from "canvas"

const BaseValueDisplayFactor = 2.3/2;
const BaseValueDisplayFactor_N = 2.6/2;
const BottomMargin = 50;
const RightMargin = 350;
const LeftMargin = 50;

const GraphMode = Object.freeze({ "POSITIVE_ONLY":0 , "POSITIVE_NEGATIVE":1  });

let ImageCanvas : Canvas.Canvas;
let ImageContext : Canvas.CanvasRenderingContext2D;

let HorizontalInfo : string[] = [];

interface PlotData {
    ValueSet : number[];
    EmptyUnits : number;
    Color : number;
};

let Plots : PlotData[] = [];

Init();

export function ClearCanvas() {
    Plots = [];
    Init();
    HorizontalInfo = [];
}

async function Init() {
    await Canvas.loadImage("./Plotting/DefaultGraphTemplate.png").then(function (Image) {
        ImageCanvas = Canvas.createCanvas(Image.width,Image.height);
        ImageContext = ImageCanvas.getContext("2d");

        ImageContext.drawImage(Image,0,0,Image.width,Image.height);
    });
}

/**
 * @param  Image The image object
 * @param  ImageContext The image context object which is used for drawing
 * @param  Color A 3 byte couple that represents the RGB values of the color you want
 * @param  ValueSetAn array of values that will be translated into a graph, index 0 being the origin
 * @param  BaseValueOnDisplay The value of the graph which coresponds to the top of the image
 */

function DrawGraph(plot : PlotData,BaseValueOnDisplay : number,GMode : number,Spacing : number) : void {

    let height;

    if (GMode === GraphMode.POSITIVE_ONLY) height = ImageCanvas.height;
    else if (GMode === GraphMode.POSITIVE_NEGATIVE) height = ImageCanvas.height/2;

    ImageContext.beginPath();

    let R = (plot.Color & 0xff0000) >>> 16;
    let G = (plot.Color & 0x00ff00) >>> 8;
    let B = plot.Color & 0x0000ff;

    ImageContext.strokeStyle = "rgba(" + R +  "," + G + "," + B + ",1)";
            
    let SpaceBetweenValues : number = (ImageCanvas.width - (LeftMargin + RightMargin)) / Spacing;
    
    for (let i = 0;i < plot.ValueSet.length;i++) {
        if (i == 0) ImageContext.moveTo((i+plot.EmptyUnits) * SpaceBetweenValues + RightMargin,height * (1 - plot.ValueSet[i]/BaseValueOnDisplay));
        else ImageContext.lineTo((i+plot.EmptyUnits) * SpaceBetweenValues + RightMargin,height * (1 - plot.ValueSet[i]/BaseValueOnDisplay));
    }

    ImageContext.lineWidth = 3;

    ImageContext.stroke();
    ImageContext.closePath();
}

/**
 * @param  Image The image object
 * @param  ImageContext The image context object which is used for drawing
 * @param  Value The value that you want to be displayed as an level display line
 * @param  BaseValueOnDisplay The value of the graph which coresponds to the top of the image
 */

function DisplayValueLine(Value : number,BaseValueOnDisplay : number,GMode) : void {
    let ValueTxt : string = Value.toFixed(2);
  
    let height;

    if (GMode === GraphMode.POSITIVE_ONLY) {
        height = ImageCanvas.height;
    } else if (GMode === GraphMode.POSITIVE_NEGATIVE) {
        height = ImageCanvas.height/2;
    }
 
    ImageContext.beginPath();
    ImageContext.strokeStyle = "rgba(255,255,255,1)";
    ImageContext.fillStyle = "#ccc";
    ImageContext.font = "bold 18pt Sans";
    ImageContext.textAlign = "left";
    ImageContext.textBaseline = "bottom";
    ImageContext.fillText(ValueTxt,1,height * (1 - Value/BaseValueOnDisplay) - 5);
    ImageContext.moveTo(0,height * (1 -Value/BaseValueOnDisplay))
    ImageContext.lineTo(ImageCanvas.width,height * (1 -Value/BaseValueOnDisplay));
    ImageContext.lineWidth = 1;
    ImageContext.stroke();
    ImageContext.closePath();
}

function DisplayVerticaLines(PlotHorizontalUnits : number,Info : string[]) {
    ImageContext.strokeStyle = "rgba(255,255,255,1)";
    ImageContext.fillStyle = "#ccc";
    ImageContext.font = "bold 15pt Sans";
    ImageContext.textAlign = "center";
    ImageContext.textBaseline = "top";

    let SpaceBetweenValues : number = (ImageCanvas.width-(LeftMargin+RightMargin)) / PlotHorizontalUnits;

    for (let i = 0;i < PlotHorizontalUnits;i++) {
        ImageContext.beginPath();
        if (Info.length == 0 || Info.length <= i) {
            ImageContext.moveTo(i * SpaceBetweenValues + RightMargin,0);
        } else {
            ImageContext.fillText(Info[i],i * SpaceBetweenValues + RightMargin,0);
            ImageContext.moveTo(i * SpaceBetweenValues + RightMargin,30);
        }
        ImageContext.lineTo(i * SpaceBetweenValues + RightMargin,ImageCanvas.height);
        ImageContext.stroke();
        ImageContext.closePath();
    }

}

/** 
* @param ValueSet An array of values that will be translated into a graph, index 0 being the origin
* @param Color A 3 byte couple that represents the RGB values of the color you want
*/
export async function Plot(ValueSet,Color,EmptyUnits = 0) : Promise<void> {
    Plots.push({ValueSet,EmptyUnits,Color});
}

export function SetHorizontalUnist(Info : string[]) {
    HorizontalInfo = Info;
}

export function SaveGraph(PictureResultPath,yLines : number,GMode = GraphMode.POSITIVE_ONLY) {
    ImageContext.beginPath();

    let BaseValue : number = 0;

    if (GMode === GraphMode.POSITIVE_ONLY) {
        for (let i : number = 0;i < Plots.length;i++) {
            let Temp : number = Utils.GetMaxFromList(Plots[i].ValueSet);
            if (BaseValue < Temp) {
                BaseValue = Temp;
            }
        }
    } else if (GMode === GraphMode.POSITIVE_NEGATIVE) {
        for (let i : number = 0;i < Plots.length;i++) {
            let Temp : number = Utils.GetMaxAbsFromList(Plots[i].ValueSet);
            if (BaseValue < Temp) {
                BaseValue = Temp;
            }
        }
    }

    let BaseValueOnDisplay : number = BaseValue; // This is used as the value which coresponds to the top of the image, is it larger so the graph doesnt reach the top

    if (GMode === GraphMode.POSITIVE_ONLY) {
        BaseValueOnDisplay *= BaseValueDisplayFactor;
        for (let i : number = 0;i <= yLines;i++) {
            DisplayValueLine(BaseValue * (i/yLines),BaseValueOnDisplay,GMode);
        }
    } else if (GMode === GraphMode.POSITIVE_NEGATIVE) {
        BaseValueOnDisplay *= BaseValueDisplayFactor_N;

        for (let i : number = 0;i <= yLines/2;i++) {
            DisplayValueLine(BaseValue * (i/yLines),BaseValueOnDisplay,GMode);
            DisplayValueLine(-BaseValue * (i/yLines),BaseValueOnDisplay,GMode);
        }
    }

    let LargestGraphLenght : number = 0;

    for (let i = 0;i < Plots.length;i++) {
        if (LargestGraphLenght < Plots[i].ValueSet.length + Plots[i].EmptyUnits) {
            LargestGraphLenght = Plots[i].ValueSet.length + Plots[i].EmptyUnits;
        }
    }

    DisplayVerticaLines(LargestGraphLenght,HorizontalInfo);

    for (let i = 0;i < Plots.length;i++) {
        DrawGraph(Plots[i],BaseValueOnDisplay,GMode,LargestGraphLenght);
    }

    let Base64Image = ImageCanvas.toDataURL().split(";base64,").pop();

    fs.writeFileSync(PictureResultPath, Base64Image, { encoding: "base64" });
}