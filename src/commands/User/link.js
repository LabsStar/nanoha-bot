const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const userSchema = require("../../models/user.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your account!'),
    category: "User",
    async execute(interaction) {
        const discord = interaction.user;

        const user = await userSchema.findOne({ userId: discord.id });


        if (user) {
            const embed = new MessageEmbed()
                .setTitle(`Linking Error`)
                .setDescription(`You are already linked!`)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    url: `${process.env.website_url}/user/${interaction.user.id}`
                })
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setColor("RED")
                .setTimestamp();

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Your Profile')
                        .setStyle('LINK')
                        .setURL(`${process.env.website_url}/user/${interaction.user.id}`)
                        .setEmoji("🤼")
                );

            return await interaction.reply({ embeds: [embed], components: [row] });
        }


        const newUser = new userSchema({
            userId: discord.id,
            username: discord.username,
            discriminator: discord.discriminator,
            avatar: discord.displayAvatarURL({ dynamic: true }),
            bio: "This user has not set a bio yet!",
            badges: [],
            color: "#000000",
            banner: "https://thicc.mywaifulist.moe/series/magical-girl-lyrical-nanoha/Y8KHgqrP0NEEKWgrXlawz3EloEFaxghKlq7pwqPp.png",
        });

        await newUser.save().catch(e => console.log(e));

        const embed = new MessageEmbed()
            .setTitle(`Linking Success`)
            .setDescription(`You have successfully linked your account!`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                url: `${process.env.website_url}/user/${interaction.user.id}`
            })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setColor("GREEN")
            .setImage("https://thicc.mywaifulist.moe/series/magical-girl-lyrical-nanoha/Y8KHgqrP0NEEKWgrXlawz3EloEFaxghKlq7pwqPp.png")
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Your Profile')
                    .setStyle('LINK')
                    .setURL(`${process.env.website_url}/user/${interaction.user.id}`)
                    .setEmoji("🤼")
            );

        return await interaction.reply({ embeds: [embed], components: [row] });




    },
};
