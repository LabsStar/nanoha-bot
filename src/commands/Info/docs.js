const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");
const userSchema = require("../../models/user.js");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("docs")
        .setDescription("Refer to our official documentation for guidance."),
    category: "Info",
    async execute(interaction) {
       
        const embed = new MessageEmbed()
            .setTitle("Documentation")
            .setDescription(`You can find the documentation for this bot [here](https://docs.nanoha.live).`)
            .setImage("https://d35fo82fjcw0y8.cloudfront.net/2020/02/05081844/technical-documentation-post-header1.jpg")
            .setColor("RANDOM")
            .setTimestamp()


        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel("View Documentation")
                    .setStyle("LINK")
                    .setURL("https://docs.nanoha.live")
            )

        return interaction.reply({ embeds: [embed], components: [row] });

    },
};