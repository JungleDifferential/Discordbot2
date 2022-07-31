const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder().setName("join").setDescription("makes Mute/Deffeners 2.0 join your current voice channel"),
    async execute(interaction) {
        await interaction.reply("sorry darius is lazy af and hasn\'t implemented this yet");
    }
}