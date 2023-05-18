const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Access detailed statistics about the bot.'),

    category: "Info",

    async execute(interaction) {

        const { guilds, users, uptime } = interaction.client;
        const bot_embed = new MessageEmbed()
            .setTitle('Bot Stats')
            .setDescription('Current stats of the bot:')
            .setColor('#00FF00')
            .setTimestamp()
            .addFields(
                { name: 'Guilds', value: `${guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${users.cache.size}`, inline: true },
                { name: 'Uptime', value: getFormattedUptime(uptime), inline: true },
                { name: 'Memory Usage', value: getMemoryUsage(), inline: true },
                { name: 'Node.js Version', value: process.version, inline: true },
                { name: 'Discord.js Version', value: `v${require('discord.js').version}`, inline: true },
                { name: 'Bot Version', value: `v${require('../../../package.json').version}`, inline: true },
            );

        await interaction.reply({ embeds: [bot_embed] });
    },
};

function getFormattedUptime(uptime) {
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getMemoryUsage() {
    return `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
}
