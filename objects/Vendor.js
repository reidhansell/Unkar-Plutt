class Vendor {
    ownerID = ""
    name = "";
    location = "";
    constructor(ownerID, name, location) {
        this.ownerID = ownerID;
        this.name = name;
        this.location = location;
    }
}

module.exports = Vendor;