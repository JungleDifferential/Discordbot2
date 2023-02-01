const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./config.json");
const { generateDependencyReport, joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

// setup the client and the external (idk if thats the right word) commands
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// audio player
const player = createAudioPlayer();

let currentChannel = null;

// IDs of specific important members
const bigB = "392518224589225985";
const bigC = "364090299519336448";
const bigN = "317117364623900673";
const dictatorN = "237267637212676096";
const kai = "236236380982870017";

// The Ids of the "default" and mute/deafen channels
const stdChnl = "692194432887422978";
const muteChnl = "692196640349487175";

// the state of the bot; disabled, mute, or deafen
let crime = "disabled";

// how many voice status updates there have been
let voiceStatusUpdateNum = 0
let voiceStatusUpdateBool = false

// maps user Ids to the channel Id that they were in before they were moved to the mute/deffen channel.
// used for moving them back to where they were
let memberChnls = new Map();

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

	if (command == "mode") {
		if (!args[0]) {
			await message.reply(crime);
			return;
		}
		if (args[0] == "disable" || args[0] == "mute" || args[0] == "deafen") {
			crime = args[0];
			await message.reply(`mode is now: ${crime}`);
			return;
		}
	}

	if (command == "join") {
		if (message.member.voice.channel.id == null) {
			await message.reply("I can't join a voice channel if youre not in one");
			return;
		}
		joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			selfDeaf: false,
			adapterCreator: message.guild.voiceAdapterCreator
		})
		currentChannel = message.member.voice.channel.id;
		console.log(currentChannel);
		return;
	}

	if (command == "leave") {
		const connection = getVoiceConnection(message.guild.id);

		if (!connection) {
			await message.reply("Dawg I'm not in a voice channel🤓");
			return;
		}
		connection.destroy();
		currentChannel = null;
		return;
	}

	if (command == "play") {
		const connection = getVoiceConnection(message.guild.id);

		if (!connection) {
			await message.reply("Dawg I'm not in a voice channel🤓")
			return;
		}
		player.play(createAudioResource(`audio/whats up big c.wav`));
		connection.subscribe(player);
		return;
	}

});

// when someone updates a their voicestate (join/leave chnl, mute/unmute/deafen/undeafen)
// it will move them to mute/deffeners if they violated the "crime"
client.on("voiceStateUpdate", async (oldState, newState) => {
	console.log(`voice status update ${voiceStatusUpdateNum}`);
	voiceStatusUpdateNum++;
	if (voiceStatusUpdateBool) {
		voiceStatusUpdateBool = false;
		return;
	}
	let channelId = newState.channelId;
	if (channelId == null) {
		return;
	}

	// dealing with moving people who are/arent muted/deafened
	if (channelId == muteChnl && ((crime == "mute" && !newState.selfMute) || (crime == "deafen" && !newState.selfDeaf))) {
		voiceStatusUpdateBool = true;
		if (memberChnls.has(newState.member.id)) {
			newState.setChannel(client.channels.cache.get(memberChnls.get(newState.member.id)));
			memberChnls.delete(newState.member.id);
			return;
		}
		newState.setChannel(client.channels.cache.get(stdChnl), "non deffeners dont belong there");
		return;
	}

	if ((crime == "mute" && newState.selfMute) || (crime == "deafen" && newState.selfDeaf)) {
		voiceStatusUpdateBool = true;
		memberChnls.set(newState.member.id, channelId);
		newState.setChannel(client.channels.cache.get(muteChnl), "if you are muted/deafened, you belong in Mute/Deffeners!! OwO");
		return;
	}
	
	// when specific individuals join, and mute/deffeners is in the call, greet them
	if (currentChannel != null && oldState.channelId != currentChannel && channelId == currentChannel) {
		const connection = getVoiceConnection(newState.guild.id);
		switch (newState.member.id) {
			case bigB:
				player.play(createAudioResource(`audio/whats up big b.wav`));
				connection.subscribe(player);
				return;
			case bigC:
				player.play(createAudioResource(`audio/whats up big c.wav`));
				connection.subscribe(player);
				return;
			case bigN:
				player.play(createAudioResource(`audio/sup sup big n.wav`));
				connection.subscribe(player);
				return;
			case dictatorN:
				player.play(createAudioResource(`audio/whats poppin dictator n.wav`));
				connection.subscribe(player);
				return;
			case kai:
				player.play(createAudioResource(`audio/what up the big kairoqo.wav`));
				connection.subscribe(player);
				return;
		}
	}
});

// to deal with when the player has an error
player.on("error", error => {
	console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
	player.play(getNextResource());
})

// Login to Discord with your client's token (useless comment tbh)
console.log(token);
client.login(token);
