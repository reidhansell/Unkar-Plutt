//TODO: instead of separate functions, use one with a status param

function generateContract(contract) {
    const contractContent = "**Mining Contract**\n" +
        "Status: OPEN" + "\n" +
        "Buyer: <@" + contract.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + contract.options.getString('resource') + "\n" +
        "Quantity: " + contract.options.getString('quantity') + "\n" +
        "CPU: " + contract.options.getString('cpu') + "\n";
    return contractContent;
}

function acceptContract(contract, minerID) {
    const acceptedContractContent = "**Mining Contract**\n" +
        "Status: IN PROGRESS by <@" + minerID + ">\n" +
        "Buyer: <@" + contract.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + contract.options.getString('resource') + "\n" +
        "Quantity: " + contract.options.getString('quantity') + "\n" +
        "CPU: " + contract.options.getString('cpu') + "\n";
    return acceptedContractContent;
}

function completeContract(contract, completerInteraction) {
    const completedContractContent = "**Mining Contract**\n" +
        "Status: COMPLETED by <@" + completerInteraction.user.id + ">\n" +
        "Buyer: <@" + contract.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + contract.options.getString('resource') + "\n" +
        "Quantity: " + contract.options.getString('quantity') + "\n" +
        "CPU: " + contract.options.getString('cpu') + "\n";
    return completedContractContent;
}

module.exports = { generateContract, acceptContract, completeContract }