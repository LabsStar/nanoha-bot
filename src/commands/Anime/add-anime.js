const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const malScraper = require("mal-scraper");
const userSchema = require("../../models/user.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-anime')
        .setDescription('Add an anime to your list!')
        .addStringOption(option =>
            option.setName('anime')
                .setDescription('The anime you want to add')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of anime you want to add')
                .setRequired(true)
                .addChoices(
                    { name: 'Watching', value: 'watching' },
                    { name: 'Completed', value: 'completed' },
                    { name: 'On Hold', value: 'onhold' },
                    { name: 'Dropped', value: 'dropped' },
                    { name: 'Plan to Watch', value: 'plantowatch' }
                )
        ),
    category: "Anime",
    async execute(interaction) {

        const anime = interaction.options.getString('anime');

        const user = await userSchema.findOne({ userId: interaction.user.id });

        if (!user) return await interaction.reply({ content: `You are not linked. Please run \`/link\` to link your account!`, ephemeral: true });

        const typeOfAnime = interaction.options.getString('type');

        malScraper.getInfoFromName(anime).then(async (data) => {

            if (!data) return await interaction.reply({ content: `I could not find that anime!`, ephemeral: true });

            if (user.anime.includes(data.id)) return await interaction.reply({ content: `You already have that anime in your list!`, ephemeral: true });

            console.log(interaction.options.getString('type'));


            const embed = new MessageEmbed()
                .setTitle(`${data.title}`)
                .setDescription(`${data.synopsis.slice(0, 200)}...`)
                .setURL(data.url)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    url: `${process.env.website_url}/user/${interaction.user.id}`
                })

                .setThumbnail(data.picture)
                .addFields(
                    { name: 'Type', value: `${data.type}`, inline: true },
                    { name: 'Episodes', value: `${data.episodes}`, inline: true },
                    { name: 'Status', value: `${data.status}`, inline: true },
                    { name: 'Aired', value: `${data.aired}`, inline: true },
                    { name: 'Score', value: `${data.score}`, inline: true },
                    { name: 'Rank', value: `${data.ranked}`, inline: true },
                    { name: 'Popularity', value: `${data.popularity}`, inline: true },
                )
                .setColor("RANDOM")
                .setFooter({
                    text: `${data.genres.join(", ")}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('add')
                        .setLabel('Add')
                        .setStyle('SUCCESS')
                        .setEmoji("<:5639checkmark:1107498466978054266>"),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
                        .setEmoji("<:5639x:1107498468437671948>"),
                );

            await interaction.reply({ embeds: [embed], components: [row] });

            interaction.client.on('interactionCreate', async interaction => {
                if (!interaction.isButton()) return;

                if (interaction.customId === 'add') {
                    await interaction.deferUpdate();
                    //! An Error SHOULD NOT occur here, but if it does, it will be caught by the try/catch block

                    try {
                        user.anime.push({ _id: data.id, _type: typeOfAnime });
                    }
                    catch (e) {
                        user.anime = [{ _id: data.id, _type: typeOfAnime }];
                    }
                    await user.save();

                    await interaction.editReply({ content: `Added \`${data.title}\` to your \`${typeOfAnime.toUpperCase()}\` list!\n${process.env.website_url}/anime/${data.id}`, embeds: [], components: [] });
                }
            });
        });

    },
};