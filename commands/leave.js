const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder().setName("leave").setDescription("makes Mute/Deffeners 2.0 leave the voice chnl its in"),
    async execute(interaction) {
        await interaction.reply("sorry darius is lazy af and hasn\'t implemented this yet");
    }
}