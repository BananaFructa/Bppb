import * as fs from "fs";
import * as Discord from "discord.js";
import * as AI from "./AI/AiApi"
import * as DataApi from "./DataApi"
import * as Graph from "./Plotting/GraphUtils";
import { CronJob } from 'cron';
import { CommandManager } from "./Commands/CommandManager";

const Bot : Discord.Client = new Discord.Client();

Predict(); // Just as a first run
let Job : CronJob = new CronJob("0 */2 * * *",Predict,null,true,"Europe/London");
Job.start();

Bot.login(fs.readFileSync("auth").toString());

Bot.on("ready",async function () {
    CommandManager.LoadCommands();
    CommandManager.SetPrefix("->");
    Bot.user.setActivity("numbers go brrr",{ type: "WATCHING" });
    console.log("Logged in as " + Bot.user.tag);
});

Bot.on("message",Message => {
    if (Message.author.id !== Bot.user.id) {
        CommandManager.RunCommand(Message.content,Message);
    }
});

function Predict() {

    const BUY_INDEX : number = 0;
    const SELL_INDEX : number = 1;

    let Items : string[] = JSON.parse(fs.readFileSync("./ItemList.json").toString());
    let InputTensor = DataApi.GetLast126Hours();

    AI.PredictFromTensor("INPUT_"+JSON.stringify(InputTensor),Response => {

        if (Response === "EXEC_1") {

            let OutputTensor = JSON.parse(fs.readFileSync("./PythonOutput.json").toString().replace(/ /g,"").replace(/\n/g,""));
            let PredictedPrices = [];
            for (let i : number = 0;i < Items.length;i++) {
                PredictedPrices[i] = [];
                PredictedPrices[i][BUY_INDEX] = [];
                PredictedPrices[i][SELL_INDEX] = [];
                PredictedPrices[i][BUY_INDEX][0] = InputTensor[i][BUY_INDEX][20];
                PredictedPrices[i][SELL_INDEX][0] = InputTensor[i][SELL_INDEX][20];
                // calculated the prices based on the given derivatives
                for (let j : number = 0;j < 19;j++) { // there are 19 points in the prediction
                    PredictedPrices[i][BUY_INDEX][j+1] = PredictedPrices[i][BUY_INDEX][j] + OutputTensor[i][BUY_INDEX][j]; 
                    PredictedPrices[i][SELL_INDEX][j+1] = PredictedPrices[i][SELL_INDEX][j] + OutputTensor[i][SELL_INDEX][j]; 
                }
            }

            fs.writeFileSync("./Prediction.json",JSON.stringify(PredictedPrices));
            console.log("Initial Prediction was Runned");
        }

    });
}