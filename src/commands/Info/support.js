const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Join our support server for help."),
    category: "Info",
    async execute(interaction) {
        const { guild, client, user, channel } = interaction;

        // Check if the bot has permissions to send links
        if (!channel.permissionsFor(guild.members.resolve(client.user)).has("EMBED_LINKS")) {
            // Try to send the message in DMs
            try {
                await user.send("https://discord.gg/ZuPHXurZvn");
                await interaction.reply("I have sent you a DM with the support server link.");
                return;
            } catch (err) {
                console.log(err);
                return interaction.reply("I couldn't send you a DM with the support server link.");
            }
        } else {
            await interaction.reply("https://discord.gg/ZuPHXurZvn");
            return;
        }
    },
};