import * as fs from "fs";
import * as Discord from "discord.js"
import {CommandManager} from "./Commands/CommandManager"
import * as Graph from "./Plotting/GraphUtils"

const Bot : Discord.Client = new Discord.Client();

Bot.login(fs.readFileSync("auth").toString());

Bot.on("ready",() => {
    Graph.Plot([7,8,10,2,7],0xff327fa8);
    Graph.Plot([20,9,1,5,6,7,6,5,2],0xffff9900);
    Graph.SaveGraph("out.png");
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