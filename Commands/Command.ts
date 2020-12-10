/** Base class for all commands */
export class Command {

    Name :string;
    ArgumentMode :Number;

    constructor(Name :string,ArgumentMode :number) {
        this.Name = Name;
        this.ArgumentMode = ArgumentMode;
    }

    /**
     * The method that runs when the command needs to be executed
     * @param args[0] The channel from which the command was sent
     * @param args[1] The embeded template
     */
    async Run(Args) {
        
    }
}