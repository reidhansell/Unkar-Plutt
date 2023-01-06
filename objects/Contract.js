class Contract {
    crafterID = "";
    minerID = "";
    status = "";
    url = "";
    resource = "";
    quantity = "";
    cpu = "";

    constructor(crafterID, minerID, status, url, resource, quantity, cpu) {
        this.crafterID = crafterID;
        this.minerID = minerID;
        this.status = status;
        this.url = url;
        this.resource = resource;
        this.quantity = quantity;
        this.cpu = cpu;
    }

    setMiner(minerID) {
        this.minerID = minerID;
    }

    setStatus(status) {
        this.status = status;
    }

    setURL(url) {
        this.url = url;
    }

    toString() {
        var minerLine = "";
        if (this.minerID != "") {
            minerLine = "Miner: <@" + this.minerID + ">\n"
        }
        const contractContent = "**MINING CONTRACT**\n"
            + "Status: " + this.status + "\n"
            + "Crafter: <@" + this.crafterID + ">\n"
            + minerLine
            + "Resource: https://swgtracker.com/?r=" + this.resource + "\n"
            + "Quantity: " + this.quantity + "\n"
            + "CPU: " + this.cpu + "\n";
        return contractContent;
    }
}

module.exports = Contract;