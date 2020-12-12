import * as fs from "fs";
import * as Discord from "discord.js"
import * as Graph from "./Plotting/GraphUtils"
import {CommandManager} from "./Commands/CommandManager"

const Bot : Discord.Client = new Discord.Client();

Bot.login(fs.readFileSync("auth").toString());

Bot.on("ready",() => {
    let a = [];
    for (let i = 0;i < 40;i++) a[i] = Math.floor(Math.random() * 40);
    let info = [];
    for (let i = -20;i <= 19;i++) info[i+20] = (i*6) + "h";
    Graph.Plot(a,0xff327fa8);
    Graph.SetHorizontalUnist(info);
    Graph.SaveGraph("out.png",10);
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