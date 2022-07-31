const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder().setName('site').setDescription('notifies you of the site'),
	async execute(interaction) {
		await interaction.reply('https://cheaptft.wixsite.com/cheaptft');
	},
};
