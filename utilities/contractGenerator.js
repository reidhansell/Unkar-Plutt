function generateContract(initialCrafterInteraction) {
    const contract = "**Mining Contract**\n" +
        "Status: OPEN" + "\n" +
        "Buyer: <@" + initialCrafterInteraction.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + initialCrafterInteraction.options.getString('resource') + "\n" +
        "Quantity: " + initialCrafterInteraction.options.getString('quantity') + "\n" +
        "CPU: " + initialCrafterInteraction.options.getString('cpu') + "\n";
    return contract;
}

function acceptContract(initialCrafterInteraction, initialMinerInteraction) {
    const acceptedContract = "**Mining Contract**\n" +
        "Status: IN PROGRESS by <@" + initialMinerInteraction.user.id + ">\n" +
        "Buyer: <@" + initialCrafterInteraction.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + initialCrafterInteraction.options.getString('resource') + "\n" +
        "Quantity: " + initialCrafterInteraction.options.getString('quantity') + "\n" +
        "CPU: " + initialCrafterInteraction.options.getString('cpu') + "\n";
    return acceptedContract;
}