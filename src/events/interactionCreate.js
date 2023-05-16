const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");


module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);

            } catch (error) {
                console.error(error);

                const errorEmbed = new MessageEmbed()
                    .setTitle(`Command Error - ${interaction.commandName}`)
                    .setDescription(`There was an error while executing this command!`)
                    .addField(`Error`, `\`\`\`js\n${error}\`\`\``)
                    .setColor("RED")
                    .setTimestamp();

                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }

        if (interaction.isButton()) {
           
        }


    },
};