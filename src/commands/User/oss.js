const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");
const userSchema = require("../../models/user.js");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("oss")
        .setDescription("Check out the open source code for this bot."),
    category: "User",
    async execute(interaction) {
        const github_repo = await octokit.repos.get({
            owner: "0xhylia",
            repo: "Basic-Webserver",
        });

        const embed = new MessageEmbed()
            .setTitle("Open Source")
            .setDescription(`You can find the open source code for this bot [here](${github_repo.data.html_url}).`)
            .setImage("https://socialify.git.ci/0xhylia/Basic-Webserver/image?font=Source%20Code%20Pro&language=1&name=1&pattern=Floating%20Cogs&theme=Dark")
            .setColor("RANDOM")
            .setTimestamp()

        

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel(`${github_repo.data.stargazers_count}`)
                    .setStyle("PRIMARY")
                    .setEmoji("⭐")
                    .setCustomId("star_count")
                    .setDisabled(true),
                new MessageButton()
                    .setLabel(`${github_repo.data.forks_count}`)
                    .setStyle("PRIMARY")
                    .setEmoji("🍴")
                    .setCustomId("fork_count")
                    .setDisabled(true),
                new MessageButton()
                    .setLabel(`${github_repo.data.open_issues_count}`)
                    .setStyle("PRIMARY")
                    .setEmoji("🐛")
                    .setCustomId("issue_count")
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("View on Github")
                    .setStyle("LINK")
                    .setURL(github_repo.data.html_url)
            )

        return interaction.reply({ embeds: [embed], components: [row] });

    },
};