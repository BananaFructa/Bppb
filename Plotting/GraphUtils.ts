import * as Utils from "./Utils"
import * as fs from "fs"
import * as Canvas from "canvas"

const BaseValueDisplayFactor = 2.3/2;
const BaseValueDisplayFactor_N = 2.6/2;

const GraphMode = Object.freeze({ "POSITIVE_ONLY":0 , "POSITIVE_NEGATIVE":1  });

let ImageCanvas : Canvas.Canvas;
let ImageContext : Canvas.CanvasRenderingContext2D;

interface PlotData {
    ValueSet : number[];
    Color : number;
};

let Plots : PlotData[] = [];

Init();

function ClearCanvas() {
    Plots = [];
    Init();
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

function DrawGraph(Image,ImageContext,Color,ValueSet,BaseValueOnDisplay,GMode) {

    let height;

    if (GMode === GraphMode.POSITIVE_ONLY) height = Image.height;
    else if (GMode === GraphMode.POSITIVE_NEGATIVE) height = Image.height/2;

    ImageContext.beginPath();

    let R = (Color & 0xff0000) >>> 16;
    let G = (Color & 0x00ff00) >>> 8;
    let B = Color & 0x0000ff;

    ImageContext.strokeStyle = "rgba(" + R +  "," + G + "," + B + ",1)";
            
    let SpaceBetweenValues = Image.width / (ValueSet.length - 1);
    
    for (let i = 0;i < ValueSet.length;i++) {
        if (i == 0) ImageContext.moveTo(i * SpaceBetweenValues,height * (1 - ValueSet[i]/BaseValueOnDisplay));
        else ImageContext.lineTo(i * SpaceBetweenValues,height * (1 - ValueSet[i]/BaseValueOnDisplay));
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

export function DisplayValueLine(Value : number,BaseValueOnDisplay : number,GMode) : void {
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
    ImageContext.font = "bold 23pt Sans";
    ImageContext.fillText(ValueTxt,1,height * (1 - Value/BaseValueOnDisplay) - 5);
    ImageContext.moveTo(0,height * (1 -Value/BaseValueOnDisplay))
    ImageContext.lineTo(ImageCanvas.width,height * (1 -Value/BaseValueOnDisplay));
    ImageContext.lineWidth = 1;
    ImageContext.stroke();
    ImageContext.closePath();
}

/** 
* @param ValueSet An array of values that will be translated into a graph, index 0 being the origin
* @param Color A 3 byte couple that represents the RGB values of the color you want
*/
export async function Plot(ValueSet,Color) : Promise<void> {
    Plots.push({ValueSet,Color});
}

export function SaveGraph(PictureResultPath,GMode = GraphMode.POSITIVE_ONLY) {
    ImageContext.beginPath();

    let BaseValue : number = 0;

    if (GMode === GraphMode.POSITIVE_ONLY) {
        for (let i = 0;i < Plots.length;i++) {
            let Temp : number = Utils.GetMaxFromList(Plots[i].ValueSet);
            if (BaseValue < Temp) {
                BaseValue = Temp;
            }
        }
    } else if (GMode === GraphMode.POSITIVE_NEGATIVE) {
        for (let i = 0;i < Plots.length;i++) {
            let Temp : number = Utils.GetMaxAbsFromList(Plots[i].ValueSet);
            if (BaseValue < Temp) {
                BaseValue = Temp;
            }
        }
    }

    let BaseValueOnDisplay : number = BaseValue; // This is used as the value which coresponds to the top of the image, is it larger so the graph doesnt reach the top

    if (GMode === GraphMode.POSITIVE_ONLY) {
        BaseValueOnDisplay *= BaseValueDisplayFactor;

        DisplayValueLine(BaseValue,BaseValueOnDisplay,GMode);
        DisplayValueLine(BaseValue/2,BaseValueOnDisplay,GMode);
        DisplayValueLine(BaseValue*3/4,BaseValueOnDisplay,GMode);
        DisplayValueLine(BaseValue/4,BaseValueOnDisplay,GMode);
    } else if (GMode === GraphMode.POSITIVE_NEGATIVE) {
        BaseValueOnDisplay *= BaseValueDisplayFactor_N;

        DisplayValueLine(BaseValue,BaseValueOnDisplay,GMode);
        DisplayValueLine(BaseValue/2,BaseValueOnDisplay,GMode);
        DisplayValueLine(-BaseValue/2,BaseValueOnDisplay,GMode);
        DisplayValueLine(-BaseValue,BaseValueOnDisplay,GMode);
    }

    for (let i = 0;i < Plots.length;i++) {
        DrawGraph(ImageCanvas,ImageContext,Plots[i].Color,Plots[i].ValueSet,BaseValueOnDisplay,GMode);
    }

    let Base64Image = ImageCanvas.toDataURL().split(";base64,").pop();

    fs.writeFileSync(PictureResultPath, Base64Image, { encoding: "base64" });
}