const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const userSchema = require("../models/user.js");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const { client, author, guild, channel, content } = message;

        if (message.content === "^^donate") {
            const embed = new MessageEmbed()
                .setTitle("Donate")
                .setDescription("You can donate to the bot by clicking the buttons below.")
                .setColor("RANDOM")
                .setTimestamp()

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Paypal")
                        .setStyle("LINK")
                        .setURL("https://www.paypal.com/paypalme/stelladevlol"),
                    new MessageButton()
                        .setLabel("Ko-fi")
                        .setStyle("LINK")
                        .setURL("https://ko-fi.com/0xhylia"),
                    new MessageButton()
                        .setLabel("Patreon")
                        .setStyle("LINK")
                        .setURL("https://www.patreon.com/0xhylia")
                )

            channel.send({ embeds: [embed], components: [row] });

        }

        if (author.bot) return;

        const user = await userSchema.findOne({ userId: author.id });

        if (!user) return;

        const MAX_NUM = 2147483647;

        // If the user has reached the maximum number of messages, return
        const userMessagesCount = user.messages;

        if (userMessagesCount >= MAX_NUM) {
            client.logger.warn(`User ${author.tag} has reached the maximum number of messages (${client.formatNumber(MAX_NUM)})`, "Int32 Overflow");
            return;
        }

        user.messages = userMessagesCount + 1;

        await user.save();

        client.logger.log(`User ${author.tag} has sent a message. (${client.formatNumber(userMessagesCount + 1)})`, "Message Create");

    },
};
