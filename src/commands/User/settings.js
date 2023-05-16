const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageAttachment } = require("discord.js");
const userSchema = require("../../models/user.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Edit your profile settings.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("bio")
                .setDescription("Change your bio.")
                .addStringOption((option) =>
                    option
                        .setName("bio")
                        .setDescription("Change your bio.")
                        .setRequired(true)
                ))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("banner")
                .setDescription("Change your banner.")
                .addAttachmentOption((option) =>
                    option
                        .setName("banner")
                        .setDescription("Change your banner.")
                        .setRequired(true)
                ))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("displayname")
                .setDescription("Change your display name.")
                .addStringOption((option) =>
                    option
                        .setName("username")
                        .setDescription("Change your display name.")
                        .setRequired(true)
                ))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("color")
                .setDescription("Change your color.")
                .addStringOption((option) =>
                    option
                        .setName("color")
                        .setDescription("Change your color.")
                        .setRequired(true)
                ))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("pronouns")
                .setDescription("Change your pronouns.")
                .addStringOption((option) =>
                    option
                        .setName("pronouns")
                        .setDescription("Change your pronouns.")
                        .setRequired(true)
                )),

    category: "User",
    async execute(interaction) {
        const { guild, user } = interaction;
        const subcommand = interaction.options.getSubcommand();

        const bio = interaction.options.getString("bio");
        const banner = interaction.options.getAttachment("banner");
        const username = interaction.options.getString("displayname");
        const color = interaction.options.getString("color");
        const pronouns = interaction.options.getString("pronouns");


        const checkForValidColor = async (color) => {
            if (color.length !== 7 || color.charAt(0) !== "#") return false;

            return true;
        };


        const dataExists = await userSchema.findOne({ userId: user.id });
        if (!dataExists) return interaction.reply({ content: `It seems like you have not linked your account. Please do so by typing \`/link\` in the chat.`, ephemeral: true });


        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Profile Settings`)
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }), url: `${process.env.website_url}/user/${user.id}` })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        switch (subcommand) {
            case "bio":
                if (bio.length > 100) return interaction.reply({ content: `Your bio cannot be longer than 100 characters.`, ephemeral: true });
                dataExists.bio = bio;
                dataExists.save();
                embed.setDescription(`Your \`bio\` has been updated.`);
                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            case "banner":
                dataExists.banner = banner.url;
                dataExists.save();
                embed.setDescription(`Your \`banner\` has been updated.`);
                embed.setImage(banner.url);
                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            case "display-name":
                if (username.length > 32) return interaction.reply({ content: `Your display name cannot be longer than 32 characters.`, ephemeral: true });
                dataExists.username = username;
                dataExists.save();
                embed.setDescription(`Your \`display name\` has been updated.`);
                embed.addField("Display Name", username);
                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            case "color":
                await checkForValidColor(color).then((res) => {
                    if (!res) return interaction.reply({ content: `That color is not valid. Please use a vaild **HEX (#)** color code.... \n\n<https://htmlcolorcodes.com/>`, ephemeral: true });
                    dataExists.color = color;
                    dataExists.save();
                    embed.setDescription(`Your \`color\` has been updated.`);
                    embed.addField("Color", color);
                    interaction.reply({ embeds: [embed], ephemeral: true });
                })
                break;
            case "pronouns":
                if (pronouns.length > 23) return interaction.reply({ content: `Your pronouns cannot be longer than 23 characters.`, ephemeral: true });
                dataExists.pronouns = pronouns;
                dataExists.save();
                embed.setDescription(`Your \`pronouns\` have been updated.`);
                embed.addField("Pronouns", pronouns);
                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            default:
                interaction.reply({ content: "Invalid subcommand.", ephemeral: true });
        }
    },
};