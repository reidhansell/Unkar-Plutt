import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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

    toButtons() {
        if (this.status == "OPEN") {
            return new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setCustomId(this.accept_id)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(this.cancel_id)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger)
                ]);
        }
        if (this.status == "IN PROGRESS") {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(this.vendors_id)
                        .setLabel("Vendors")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(this.complete_id)
                        .setLabel('Complete')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(this.unaccept_id)
                        .setLabel('Unaccept')
                        .setStyle(ButtonStyle.Danger),
                );
        }
        if (this.status == "COMPLETE") {
            return new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setCustomId(this.confirm_id)
                        .setLabel('Confirm')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(this.uncomplete_id)
                        .setLabel('Uncomplete')
                        .setStyle(ButtonStyle.Danger),

                ]);
        }
    }
}

export default Contract;