class Vendor {
    ownerID = ""
    name = "";
    location = "";
    discounts = "";
    constructor(ownerID, name, location, discounts) {
        this.ownerID = ownerID;
        this.name = name;
        this.location = location;
        this.discounts = discounts;
    }
}

module.exports = Vendor;