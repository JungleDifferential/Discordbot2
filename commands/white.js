const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder().setName("white").setDescription("lets you know if you\'re white"),
    async execute(interaction) {
        // sees if they have the @white role
        if (await interaction.member._roles.includes("921904281530015744")) {
            await interaction.reply("yes");
            await interaction.followUp("+ ratio");
            return;
        }
        await interaction.reply("no");
    }
};