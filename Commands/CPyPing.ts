import * as Discord from "discord.js"
import {Command} from "./Command"
import {ArgumentIndexes,ArgumentMode} from "./ArgsUtils"
import * as AI from "../AI/AiApi"

export class CPyPing extends Command {
    constructor() {
        super("py-ping",ArgumentMode.WHOLE);
    }

    Run = async function(Args)  {

        let Embed :Discord.MessageEmbed = new Discord.MessageEmbed().setColor("#327fa8");
        let Message :Discord.Message =  Args[ArgumentIndexes.MESSAGE];

        AI.PredictFromTensor("PING",Response => {
            Embed.setTitle(Response);
            Message.channel.send(Embed);
        });
    } 
}