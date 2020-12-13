import * as Discord from "discord.js"
import * as fs from "fs"
import * as Graph from "../Plotting/GraphUtils"
import {Command} from "./Command"
import {ArgumentIndexes,ArgumentMode} from "./ArgsUtils"
import * as AI from "../AI/AiApi"
import * as DataApi from "../DataApi"
import { ifError } from "assert"

const BUY_INDEX : number = 0;
const SELL_INDEX : number = 1;

export class CPredict extends Command {

    Items : string[];
    ItemToName : {} = {};
    NameToItem : {} = {};

    constructor() {
        super("predict",ArgumentMode.WHOLE);
        this.Items = JSON.parse(fs.readFileSync("./ItemList.json").toString());
        this.ItemToName = JSON.parse(fs.readFileSync("./Dictionaries/SpecialNames.json").toString());
        for (var key in this.ItemToName) {
            this.NameToItem[this.ItemToName[key]] = key;
        }
    }

    ItemTextToNormal(Item : string) : string {
        if (Item in this.ItemToName) {
            Item = this.ItemToName[Item];
            let arr : string[] = Item.split("");
            arr[0] = arr[0].toUpperCase();
            for (let i : number = 0;i < arr.length;i++) {
                if (arr[i] === " ") {
                    arr[i+1] = arr[i+1].toUpperCase();
                }
            }
            Item = arr.join("");
        } else {
            let arr : string[] = Item.toLowerCase().split("");
            arr[0] = arr[0].toUpperCase();
            for (let i : number = 0;i < arr.length;i++){
                if (arr[i] === "_") {
                    arr[i+1] = arr[i+1].toUpperCase();
                    arr[i] = " ";
                }
            }
            Item = arr.join("");
        }
        return Item;
    }

    NormalToItemText(Item : string) : string {
        Item = Item.toLowerCase();
        if (Item.startsWith("e!")) {
            Item = "enchanted " + Item.replace("e!",""); 
        }
        if (Item in this.NameToItem) {
            Item = this.NameToItem[Item];
        } else {
            Item = Item.replace(/ /g,"_");
            Item = Item.toUpperCase();
        }
        return Item;
    }

    Run = async function(Args)  {

        let Embed :Discord.MessageEmbed = new Discord.MessageEmbed().setColor("#327fa8");
        let Message :Discord.Message =  Args[ArgumentIndexes.MESSAGE];

        let Item : string = this.NormalToItemText(Args[1]);

        if (this.Items.includes(Item)) {

            Graph.ClearCanvas();
            let info = [];
            for (let i = -20;i <= 19;i++) info[i+20] = (i*6) + "h";
            let Prediction : DataApi.ItemData = DataApi.GetPredictionForItem(Item);
            let HistoricData : DataApi.ItemData = DataApi.GetLast126HoursItemData(Item);
            Graph.Plot(Prediction.BuyData,0xffd49d08,20);
            Graph.Plot(Prediction.SellData,0xff0c9196,20);
            Graph.Plot(HistoricData.BuyData,0xffc45b10);
            Graph.Plot(HistoricData.SellData,0xff0c3696);
            Graph.SetHorizontalUnist(info);
            Graph.SaveGraph("out.png",10);

            Embed.setTitle("Prediction for " + this.ItemTextToNormal(Item));
            Embed.attachFiles(["out.png"]).setImage("attachment://out.png");

        } else {
            Embed.setTitle("Unknown Item");
        }

        Message.channel.send(Embed);

    } 
}