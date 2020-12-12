import * as Discord from "discord.js"
import * as fs from "fs"
import {Command} from "./Command"
import {ArgumentIndexes,ArgumentMode} from "./ArgsUtils"
import * as AI from "../AI/AiApi"

const BUY_INDEX : number = 0;
const SELL_INDEX : number = 1;

export class CPredict extends Command {
    constructor() {
        super("predict",ArgumentMode.WHOLE);
    }

    Run = async function(Args)  {

        let Embed :Discord.MessageEmbed = new Discord.MessageEmbed().setColor("#327fa8");
        let Message :Discord.Message =  Args[ArgumentIndexes.MESSAGE];

        let Items : string[] = JSON.parse(fs.readFileSync("./ItemList.json").toString());
        let InputTensor = [];

        for (let i : number = 0;i < Items.length;i++) {
            InputTensor[i] = [];
            let PriceData = JSON.parse(fs.readFileSync("./TestDataset/" + Items[i].replace(":","") + ".json").toString());
            InputTensor[i][BUY_INDEX] = PriceData[BUY_INDEX].slice(0,21);
            InputTensor[i][SELL_INDEX] = PriceData[SELL_INDEX].slice(0,21);
        }

        AI.PredictFromTensor("INPUT_"+JSON.stringify(InputTensor),Response => {
            let OutputTensor = JSON.parse(Response.toString().replace(/ /g,"").replace(/\n/g,""));
            fs.writeFileSync("yes.json",JSON.stringify(OutputTensor));
        });
    } 
}