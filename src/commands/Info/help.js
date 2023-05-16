const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
  
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with the bot!'),

  category: "Info",

  async execute(interaction) {
    const commands = interaction.client.commands;

    const categories = new Set(commands.map(command => command.category));

    const embed = new MessageEmbed()
      .setTitle('Help')
      .setColor("AQUA")
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        url: `${process.env.website_url}/user/${interaction.user.id}`
      })
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp();

    categories.forEach(category => {
      const commandsInCategory = commands.filter(command => command.category === category);
      const commandList = commandsInCategory.map(command => `**/${command.data.name}**: ${command.data.description}`).join('\n');
      embed.addFields({ name: category, value: commandList });
    });

    const selectMenuOptions = Array.from(categories).map(category => {
      return {
        label: category,
        value: category
      };
    });

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('help')
          .setPlaceholder('Select a category')
          .addOptions(selectMenuOptions)
      );

    await interaction.reply({ embeds: [embed], components: [row] });

    interaction.client.on('interactionCreate', async interaction => {
      if (!interaction.isSelectMenu()) return;

      if (interaction.customId === 'help') {
        const category = interaction.values[0];
        const commandsInCategory = commands.filter(command => command.category === category);
        const commandList = commandsInCategory.map(command => `**/${command.data.name}**: ${command.data.description}`).join('\n');

        const embed = new MessageEmbed()
          .setTitle(`${category} Commands`)
          .setColor("AQUA")
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            url: `${process.env.website_url}/user/${interaction.user.id}`
          })
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setDescription(commandList)
          .setTimestamp();

        await interaction.update({ embeds: [embed] });
      }
    });
  },
};
