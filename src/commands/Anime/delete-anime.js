const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const malScraper = require("mal-scraper");
const userSchema = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-anime')
        .setDescription('Delete an anime from your list')
        .addIntegerOption(option =>
            option.setName('anime')
                .setDescription('The anime you want to delete')
                .setRequired(true)
        ),
    category: "Anime",
    async execute(interaction) {
        const animeId = interaction.options.getInteger('anime');
        const user = await userSchema.findOne({ userId: interaction.user.id });

        if (!user) {
            return await interaction.reply({ content: `You are not linked. Please run \`/link\` to link your account!`, ephemeral: true });
        }

        // Check if the anime exists in the user's list
        const animeIndex = user.anime.findIndex(a => a._id === animeId);
        if (animeIndex === -1) {
            return await interaction.reply({ content: `You do not have that anime in your list!`, ephemeral: true });
        }

        const data = await malScraper.getInfoFromURL(`https://myanimelist.net/anime/${animeId}`);

        const embed = new MessageEmbed()
            .setTitle(`${data.title}`)
            .setDescription(`${data.synopsis.slice(0, 200)}...`)
            .setURL(`${process.env.website_url}/anime/${data.id}`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                url: `${process.env.website_url}/user/${interaction.user.id}`
            })
            .setThumbnail(data.picture);

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setURL(`${process.env.website_url}/anime/${data.id}`)
                    .setLabel('View on Nanoha')
                    .setStyle('LINK')
            );

        user.anime.splice(animeIndex, 1);
        await user.save();

        await interaction.reply({ embeds: [embed], components: [row], content: `Deleted anime from your list!` });
    },
};
