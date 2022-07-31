const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./config.json");
const { generateDependencyReport } = require("@discordjs/voice");

// setup the client and the external (idk if thats the right word) commands
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// The Ids of the "default" and mute/deafen channels
const stdChnl = "692568922360119326";
const muteChnl = "692196640349487175";
// the state of the bot; disabled, mute, or deafen
var crime = "disabled";
// maps user Ids to the channel Id that they were in before they were moved to the mute/deffen channel.
// used for moving them back to where they were
var memberChnls = new Map();

// When the client is ready, run this code (only once)
client.once("ready", () => {
	// check dependencies (mostly for voice related things)
	console.log(generateDependencyReport());
	client.user.setActivity("ITS ABOUT DRIVE 😤ITS ABOUT POWER 🔥WE STAY HUNGRY😈WE DEVOUR 👹PUT IN THE WORK 💪PUT IN THE HOURS ⌚");
	console.log("WE ARE BACK, DON\'T FORGET IT");
});

// this is used for slash commands right now, I don't like slash commands so I think I will get rid of this
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName);
	if(!command) {
		return;
	}

	try {
		await command.execute(interaction);
	} catch (e) {
		console.error(e);
		await interaction.reply("yeah idk something went wrong");
	}
});

// I like using ? as a prefix for commands more than / (I hate pressing enter twice to enter), 
// so this will be the main spot for commands later
client.on("messageCreate", async message => {
	if (!message.content.startsWith("?")) {
		return;
	}

	const args = message.content.slice(1).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command == "disable") {
		crime = "disabled";
		return;
	}
	if (command == "mute") {
		crime = "mute";
		return;
	}
	if (command == "deafen") {
		crime = "deafen";
		return;
	}
	if (command == "mode") {
		await message.reply(crime);
		return;
	}
});

// when someone updates a their voicestate (join/leave chnl, mute/unmute/deafen/undeafen)
// it will move them to mute/deffeners if they violated the "crime"
client.on("voiceStateUpdate", async (oldState, newState) => {
	let chnl = null;
	if (newState.channel != null) {
		chnl = newState.channel.name;
	}
	if (chnl != null) {
		if (chnl != "Mute/Deffeners" && ((crime == "mute" && newState.selfMute) || (crime == "deafen" && newState.selfDeaf))) {
			memberChnls.set(newState.member.id, newState.channelId);
			newState.setChannel(client.channels.cache.get(muteChnl), "if you are muted/deafened, you belong in Mute/Deffeners!! OwO");
		}
		if (chnl == "Mute/Deffeners" && ((crime == "mute" && !newState.selfMute) || (crime == "deafen" && !newState.selfDeaf))) {
			if (memberChnls.has(newState.member.id)) {
				newState.setChannel(client.channels.cache.get(memberChnls.get(newState.member.id)));
				memberChnls.delete(newState.member.id);
				return;
			}
			newState.setChannel(client.channels.cache.get(stdChnl), "non deffeners dont belong there");
		}
	}
});

// Login to Discord with your client's token (useless comment tbh)
console.log(token);
client.login(token);
