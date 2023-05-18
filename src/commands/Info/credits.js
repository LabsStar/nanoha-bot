const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("credits")
        .setDescription("Discover the individuals behind the development of Nanoha Bot."),
    category: "Info",
    async execute(interaction) {
       
        const { guild, client, user, channel } = interaction;
        
        const staff = client.guilds.cache.get(process.env.guildId).roles.cache.get(process.env.staffRoleId).members.map(m => {
            return {
                id: m.id,
                username: m.user.username,
                topRole: m.roles.highest.name,
            }
        });

        const githubContributors = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
            owner: "0xhylia",
            repo: "Basic-Webserver",
        });

        const contributors = githubContributors.data.map(c => {
            return {
                username: c.login,
                url: c.html_url,
                contributions: c.contributions,
            }
        });

        const embed = new MessageEmbed()
            .setTitle("Credits")
            .setDescription(`Here are the individuals behind the development of Nanoha Bot. (Discord Staff)`)
            .setColor("RANDOM")
            .setTimestamp()
            
            for (const staffMember of staff) {
                embed.addField(`${staffMember.topRole}`, `[${staffMember.username}](${process.env.website_url}/user/${staffMember.id})`, true)
            }

            const embed2 = new MessageEmbed()
            .setTitle("Credits")
            .setDescription(`Here are the individuals behind the development of Nanoha Bot. (Github Contributors)`)
            .setColor("RANDOM")
            .setTimestamp()

            for (const contributor of contributors) {
                embed2.addField(`${contributor.contributions} contributions`, `[${contributor.username}](${contributor.url})`, true)
            }

            await interaction.reply({ embeds: [embed, embed2] });

            

    },
};