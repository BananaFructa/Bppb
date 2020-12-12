import {ArgumentMode} from "./ArgsUtils"

import {CPing} from "./CPing"
import { CPredict } from "./CPredict";
import { CPyPing } from "./CPyPing";

export class CommandManager {
    static Commands = [];
    static Prefix;

    /** Loads the commands */
    static LoadCommands() {
        this.Commands.push(new CPyPing);
        this.Commands.push(new CPing);
        this.Commands.push(new CPredict);
    }

    /** Sets the prefix
     * @param Prefix The prefix
     */
    static SetPrefix(Prefix :String) {
        this.Prefix = Prefix;
    }

    /** Inputs a string and an undefined number of arguments
     * @param Args[0] The message that was sent
     * @param Args[1] The cannel in which the message was sent
     */
    static RunCommand(...Args : any[]) {
        let CommandQuerry = Args.shift();
        CommandQuerry = CommandQuerry.toLowerCase();
        if (CommandQuerry.startsWith(this.Prefix)) {

            CommandQuerry = CommandQuerry.replace(this.Prefix,"");
            
            for (let i = 0;i < this.Commands.length;i++) {
                if (CommandQuerry.startsWith(this.Commands[i].Name)) {
                    if (this.Commands[i].ArgumentMode === ArgumentMode.SPLIT) { 
                        let CommandArguments = CommandQuerry.split(" ");
                        for (let j = 1;j < CommandArguments.length;j++) {
                            Args.push(CommandArguments[j]);
                            
                        }
                    } else if (this.Commands[i].ArgumentMode === ArgumentMode.WHOLE && CommandQuerry.startsWith(this.Commands[i].Name + " ")) {
                        let CommandArgument = CommandQuerry.replace(this.Commands[i].Name + " ","");
                        Args.push(CommandArgument);
                    }

                    try {
                        this.Commands[i].Run(Args);
                    } catch (err) {
                        console.log(err);
                    }

                    break;

                }
            }
        }
    }
}