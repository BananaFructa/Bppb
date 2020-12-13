import {spawn} from "child_process"

let Command : string = "python";

if (process.platform.startsWith("win")) {
    Command = "py"; // Windows
    console.log("Platform: Windows")
} else if (process.platform.startsWith("linux"))  {
    Command = "python3"; // Linux
    console.log("Platform: Linux");
}

let AiProcess = spawn(Command,["./AI/AiRunner.py"]);

export function PredictFromTensor(Input,Callback) {
    try {
        AiProcess.stdin.write(Input + "\n");
        new Promise((resolve) => {
            AiProcess.stdout.on("data",R => {
                resolve(R);
            });
        }).then(R => {
            Callback(R);
        });
    } catch (err) {
        console.log(err);
    }
}