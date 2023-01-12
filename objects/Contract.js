class Contract {
    crafter_id = "";
    miner_id = "";
    status = "";
    url = "";
    resource = "";
    quantity = "";
    cpu = "";

    // For Discord interaction:
    message_id = "";
    channel_id = "";
    accept_id = "";
    cancel_id = "";
    unaccept_id = "";
    vendors_id = "";
    complete_id = "";
    uncomplete_id = "";
    confirm_id = "";

    constructor(contractObject) {
        this.crafter_id = contractObject.crafter_id;
        this.miner_id = contractObject.miner_id;
        this.status = contractObject.status;
        this.url = contractObject.url;
        this.resource = contractObject.resource;
        this.quantity = contractObject.quantity;
        this.cpu = contractObject.cpu;
        this.message_id = contractObject.message_id;
        this.channel_id = contractObject.channel_id;
        this.accept_id = contractObject.accept_id;
        this.cancel_id = contractObject.cancel_id;
        this.unaccept_id = contractObject.unaccept_id;
        this.vendors_id = contractObject.vendors_id;
        this.complete_id = contractObject.complete_id;
        this.uncomplete_id = contractObject.uncomplete_id;
        this.confirm_id = contractObject.confirm_id;
    }

    setMiner(miner_id) {
        this.miner_id = miner_id;
    }

    setStatus(status) {
        this.status = status;
    }

    setURL(url) {
        this.url = url;
    }

    toString() {
        var minerLine = "";
        if (this.miner_id != "") {
            minerLine = "Miner: <@" + this.miner_id + ">\n"
        }
        const contractContent = "**MINING CONTRACT**\n"
            + "Status: " + this.status + "\n"
            + "Crafter: <@" + this.crafter_id + ">\n"
            + minerLine
            + "Resource: https://swgtracker.com/?r=" + this.resource + "\n"
            + "Quantity: " + this.quantity + "\n"
            + "CPU: " + this.cpu + "\n";
        return contractContent;
    }
}

module.exports = Contract;