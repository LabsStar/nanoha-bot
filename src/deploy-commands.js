const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require("dotenv");
const serverSchema = require("./models/server.js");

dotenv.config();

const commands = [];

const commandFolders = fs.readdirSync(path.join(__dirname, "commands"));

for (const folder of commandFolders) {

    const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(path.join(__dirname, "commands", folder, file));

        commands.push(command.data.toJSON());


    }
}

const rest = new REST({ version: '9' }).setToken(process.env.token);
const args = process.argv.slice(2);

const clientID = args[0] || "1107467362212528189"
const guildID = args[1] || null;

if (!clientID) return console.log("Please provide a client ID");
if (!guildID) {
    console.warn("No guild ID provided, registering global commands.");
    rest.put(Routes.applicationCommands(clientID), { body: commands })
        .then(() => {
            console.log('Successfully registered application commands. (GLOBAL)');
        }).catch(console.error);
} else {
    rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
        .then(() => {

            console.log(`Successfully registered application commands. (GUILD: ${guildID})`);
        }).catch(console.error);
}
