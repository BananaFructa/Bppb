const fs = require("fs");
const fetch = require("node-fetch");
const cron = require("cron");
let Items = JSON.parse(fs.readFileSync("../ItemList.json"));

if (!fs.existsSync("./Data/WHEAT.json")) CreateDatabse();

let Job = new cron.CronJob("59 1-23/2 * * *",AddData,null,true,"Europe/London");
Job.start();

function AddData() {
    fetch("https://api.hypixel.net/skyblock/bazaar").then((response) => {
        response.text().then((Data_) => {
            let Data = JSON.parse(Data_);
            Items.forEach(element => {
                let buy = Data["products"][element]["buy_summary"][0]["pricePerUnit"];
                let sell = Data["products"][element]["sell_summary"][0]["pricePerUnit"];
                let StoredData = JSON.parse(fs.readFileSync("./Data/"+element.replace(":","")+".json").toString());
                StoredData["buy"].push(buy);
                StoredData["sell"].push(sell);
                StoredData["buyCount"]++;
                StoredData["sellCount"]++;
                fs.writeFileSync("./Data/"+element.replace(":","")+".json",JSON.stringify(StoredData),() => {});
            });
        });
    });
}

function CreateDatabse() {
    Items.forEach(element => {
        fs.writeFileSync("./Data/"+element.replace(":","")+".json",JSON.stringify({buy:[],sell:[],buyCount:0,sellCount:0}));
    });
}