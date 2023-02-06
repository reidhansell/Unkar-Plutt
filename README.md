# SWG-SHADE Bot 1.0!

A Discord bot made for crafters in Star Wars Galaxies!

This bot will enable the following commands in your Discord server (press TAB to navigate through parameters when using commands)

## Commands

### /contract_help
Get help with contract commands!

### /register_vendor {name} {location}
This command registers your vendor as a drop-off location

### /unregister_vendor {name}
This command unregisters a vendor with the provided name (only works if the vendor is under your Discord ID)

### /contract {name} {quantity} {cpu}
This command opens a contract which can be accepted, cancelled, unaccepted, complete, uncomplete, and confirmed. ONLY the Crafter and the Miner may interact with the contract. Select "Vendors" while "IN PROGRESS" to see a list of drop-off locations!

CANCELLED <- OPEN <-> IN PROGRESS <-> COMPLETE -> CONFIRMED

### /my_contracts
See a list of your open contracts along with their current status and a link to the original post!

### /toggle_notifications
Toggle notifications for contract status changes!

## More

### This bot will be maintained until I quit playing SWG
Want a new feature? Found a bug? Let me know ASAP and I'll get on it :thumbsup:

### Config
1. Remove "example" from "exampleconfig.js"
2. Fill in the config file accordingly. All you need is a Guild ID (otherwise known as a Server ID), Client ID, and Token (both of the latter come from Discord's Developer section)
3. Run "npm start" in your CLI (this will install necessary dependencies, register the bot commands, and run the bot)

### Contributing
Anyone is welcome to contribute. Please see the ZenHub tab of this repository for issue tracking and more. Message me to become an official Collaborator
