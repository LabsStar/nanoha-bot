const mongoose = require("mongoose");
const { MessageEmbed, MessageActionRow, MessageButton, MessageCollector } = require("discord.js");

const wait = require('util').promisify(setTimeout);

const webServer = require("../webServer.js");

const cron = require("node-cron");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {

        console.clear();
        client.logger.log(`Logged in as ${client.user.tag}!`, "Discord API");


        client.user.setActivity(`/help | ${client.guilds.cache.size} servers`, { type: "WATCHING" });


        client.user.setStatus("online");

        mongoose.connect(process.env.mongo_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        client.logger.log(`Servers that are connected: ${client.guilds.cache.size}`, "Discord API");

        const db = mongoose.connection;

        db.on("error", (err) => {
            console.error(err);
        });

        db.once("open", () => {
            client.logger.log("Connected to MongoDB", "MongoDB");
        });


        webServer(client);



    },
};