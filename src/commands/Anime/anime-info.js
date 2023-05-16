const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const malScraper = require("mal-scraper");
const userSchema = require("../../models/user.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime-info')
        .setDescription('Get information about an anime.')
        .addIntegerOption(option =>
            option.setName('anime')
                .setDescription('The anime you want to get information about. (ID)')
                .setRequired(true)
        ),

    category: "Anime",
    async execute(interaction) {

        const anime = interaction.options.getInteger('anime');

        malScraper.getInfoFromURL(`https://myanimelist.net/anime/${anime}`).then(async (data) => {
            if (!data) return interaction.reply({ content: `I could not find any information about this anime.`, ephemeral: true });

            const randomCharacter = data.characters[Math.floor(Math.random() * data.characters.length)];

            const main_embed = new MessageEmbed()
                .setTitle(`${data.title}`)
                .setDescription(`${data.synopsis.slice(0, 200)}...`)
                .setURL(`${process.env.website_url}/anime/${data.id}`)
                .setAuthor({
                    name: `${randomCharacter.name} - ${randomCharacter.role}`,
                    iconURL: randomCharacter.picture,
                    url: `${randomCharacter.link}`
                })
                .setThumbnail(data.picture)

                .addFields(
                    { name: 'Type', value: `${data.type}`, inline: true },
                    { name: 'Episodes', value: `${data.episodes}`, inline: true },
                    { name: 'Status', value: `${data.status}`, inline: true },
                    { name: 'Aired', value: `${data.aired}`, inline: true },
                    { name: 'Premiered', value: `${data.premiered}`, inline: true },
                    { name: 'Broadcast', value: `${data.broadcast}`, inline: true },
                    { name: 'Ranked', value: `${data.ranked}`, inline: true },
                    { name: 'Source', value: `${data.source}`, inline: true },
                    { name: 'Genres', value: `${data.genres.join(", ")}`, inline: true },
                    { name: 'Popularity', value: `${data.popularity}`, inline: true },
                )
                .setFooter({
                    text: `${data.englishTitle} | ${data.japaneseTitle}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setColor('RANDOM')
                .setTimestamp()




            return interaction.reply({ embeds: [main_embed] });
        });

    },
};