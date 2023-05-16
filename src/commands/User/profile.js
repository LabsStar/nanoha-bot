const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");
const userSchema = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Shows your profile or someone elses profile.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user you want to see the profile of.")
                .setRequired(false)
        ),
    category: "User",
    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.options.getUser("user") || interaction.user;

        userSchema.findOne({ userId: user.id }).then(async (data) => {
            if (!data) return interaction.reply({ content: `It seems like this user has not linked their account.`, ephemeral: true });


            const formatNumbers = (number) => {
                if (!number) return '0';

                return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');


            }

            function convertTimeToRaw(time) {
                return Math.floor(Date.parse(time) / 1000);
            }

            const embed = new MessageEmbed()
                .setColor(data.color || "RANDOM")
                .setTitle(`${data.displayName || user.username}'s Profile`)
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }), url: `${process.env.website_url}/user/${user.id}` })
                .setDescription(`${data.bio}`)
                .setImage(data.banner)

                .addFields(
                    {
                        name: "Messages Sent",
                        value: `${formatNumbers(data.messages)}`,
                        inline: true
                    },
                    {
                        name: "Account Created",
                        value: `<t:${convertTimeToRaw(data.createdAt)}:R>`,
                        inline: true
                    },
                    {
                        name: "Account Updated",
                        value: `<t:${convertTimeToRaw(data.updatedAt)}:R>`,
                    },
                    {
                        name: "Anime's Saved",
                        value: `${formatNumbers(data.anime.length)}`,
                        inline: true
                    }
                )

                .setFooter(
                    {
                        text: `${data.pronouns ? data.pronouns : "No pronouns set."}`
                    }
                )


            interaction.reply({ embeds: [embed] });
        });
    },
};