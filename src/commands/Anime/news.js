const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const malScraper = require("mal-scraper");
const userSchema = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime-news')
        .setDescription('Get the latest anime news!'),
    category: "Anime",
    async execute(interaction) {

        const data = await malScraper.getNewsNoDetails();

        const random = data[Math.floor(Math.random() * data.length)];

        console.log(random);


        const embed = new MessageEmbed()
            .setTitle(random.title)
            .setURL(`${process.env.website_url}/news`)
            .setDescription(random.text)
            .setThumbnail(random.image)

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel("Read More on Nanoha")
                    .setStyle("LINK")
                    .setURL(`${process.env.website_url}/news`)
            )

        await interaction.reply({ embeds: [embed], components: [row] });




    },
};
