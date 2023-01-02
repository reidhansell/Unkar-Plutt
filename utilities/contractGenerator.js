function generateContract(contract) {
    const contractContent = "**Mining Contract**\n" +
        "Status: OPEN" + "\n" +
        "Buyer: <@" + contract.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + contract.options.getString('resource') + "\n" +
        "Quantity: " + contract.options.getString('quantity') + "\n" +
        "CPU: " + contract.options.getString('cpu') + "\n";
    return contractContent;
}

function acceptContract(contract, initialMinerInteraction) {
    const acceptedContractContent = "**Mining Contract**\n" +
        "Status: IN PROGRESS by <@" + initialMinerInteraction.user.id + ">\n" +
        "Buyer: <@" + contract.user.id + ">\n" +
        "Resource: https://swgtracker.com/?r=" + contract.options.getString('resource') + "\n" +
        "Quantity: " + contract.options.getString('quantity') + "\n" +
        "CPU: " + contract.options.getString('cpu') + "\n";
    return acceptedContractContent;
}

module.exports = { generateContract, acceptContract }