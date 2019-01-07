/**
 * MogiBot
 * 
 * @author 255MP
 * 
 */

const Discord = require('discord.js');
const fs = require('fs')
const config = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.config = config

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

const roomSizeHalf = Math.floor(config.room_size / 2);

const mogichannel = new Map();
const boottime = timestamp();

var BrowserConsole = function ()
{
}

BrowserConsole.out = function(message)
{
	console.log("[" + new Date().toUTCString() + "] " + message);
};

function Mogi()
{
	this.isCollecting = false,
	this.isRoomHalfFullSet = false,
	this.isRoomAlmostFullSet = false,
	this.isRoomFullSet = false,
	this.dateFull = null,
	this.players = new Discord.Collection(),
	this.notification = new Discord.Collection();
}

function Notification()
{
	this.id = 0,
	this.sent = 0;
}

function Player()
{
	this.id = 0,
	this.nickname = null,
	this.username = null,
	this.joinDate = null,
	this.lastMessageDate = null;
}

function nickname(message)
{
	if (message.member === null || message.member.nickname === null)
	{
		return message.author.username.replace(/`/g, '');
	}
	else
	{
		return message.member.nickname.replace(/`/g, '');
	}
}

function moginickname(nickname, username)
{
	if (nickname === null)
	{
		return username.replace(/`/g, '');
	}
	else
	{
		return nickname.replace(/`/g, '');
	}
}

function trim(name)
{
	return name.replace(/`/g, '').replace(/ /g, '');
}

function hasRole(message)
{
	return hasRoleName(message, 'MogiBot') ||
			hasRoleName(message, 'Updater') ||
			hasRoleName(message, 'Updaters') ||
			hasRoleName(message, 'Reporter') ||
			hasRoleName(message, 'Reporters') ||
			hasRoleName(message, 'Bronze Arbitrator') ||
			hasRoleName(message, 'Gold Arbitrator') ||
			hasRoleName(message, 'Diamond Arbitrator') ||
			hasRoleName(message, 'Lower Tier Arbitrator') ||
			hasRoleName(message, 'Higher Tier Arbitrator') ||
			hasRoleName(message, 'Arbitrator') ||
			hasRoleName(message, 'Arbitrator') ||
			hasRoleName(message, 'Arbitrators') ||
			hasRoleName(message, 'Boss') ||
			hasRoleName(message, 'Admin') ||
			hasRoleName(message, 'Administrator') ||
			hasRoleName(message, 'Administrators');
}

function hasRoleName(message, name)
{
	var mogirole = message.guild.roles.find("name", name);
	if (mogirole != null && message.member != null)
	{
		return message.member.roles.has(message.guild.roles.find("name", name).id);
	}
}

function timestamp()
{
	return new Date().getTime();
}

client.on('ready', () => {
	BrowserConsole.out(`Logged in as ${client.user.tag}!`);
});

client.on('reconnecting', () => {
	BrowserConsole.out(`Reconnecting as ${client.user.tag}!`);
});

client.on('error', error => {
	BrowserConsole.out("There was an error" + error.message);
});

client.on('message', message => {
	if (message.author.bot) return;

	if (!mogichannel.has(message.channel))
	{
		mogichannel.set(message.channel, new Mogi());
	}

	var now = timestamp();
	var mogi = mogichannel.get(message.channel);
	if (mogi.isCollecting && mogi.players.size < config.room_size)
	{
		if (mogi.players.has(message.author.id))
		{
			mogi.players.get(message.author.id).lastMessageDate = now;
			if (mogi.notification.has(message.author.id))
			{
				mogi.notification.delete(message.author.id);
			}
		}
	}

	if (!message.content.startsWith(config.prefix)) return;

	const args = message.content.slice(config.prefix.length).trim().replace(/`/g, '').split(/ +/g);
	const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }
  const time = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 0) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (time < expirationTime) {
      return
    }
  }
  timestamps.set(message.author.id, time);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  try {
    command.execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim);
  }
  catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

process.on('unhandledRejection', error => { BrowserConsole.out(error); });

client.login(config.token);

// mogi room clean up
function cleanMogi()
{
	var now = timestamp();
	var hasMogi = false;
	mogichannel.forEach((mogi, channel, map) => 
	{
		if (mogi.isCollecting && mogi.players.size > 0)
		{
			hasMogi = true;
		}
	});

	var uptime = now - boottime;
	if (!hasMogi && uptime >= config.minimum_uptime)
	{
		uptime = uptime / 60000;
		BrowserConsole.out("Rebooting because there are no active mogi with an uptime of " + uptime + " minutes");
		process.exit();
		return;
	}

	mogichannel.forEach((mogi, channel, map) => 
	{
		if (mogi.isCollecting && mogi.players.size > 0 && mogi.players.size < config.room_size)
		{
			var playerslist = mogi.players.keyArray();
			for (var i = 0; i < playerslist.length; i++)
			{
				var player = mogi.players.get(playerslist[i]);
				var timelapse = now - player.lastMessageDate;

				if (timelapse >= config.inactive_message_after && timelapse <= config.remove_from_mogi_after)
				{
					if (!mogi.notification.has(player.id))
					{
						var notice = new Notification();
						notice.id = player.id;
						notice.sent = 0;

						mogi.notification.set(player.id, notice);
					}
				}

				if (timelapse > config.remove_from_mogi_after)
				{
					if (mogi.notification.has(player.id))
					{
						var notice = mogi.notification.get(player.id);
						mogi.notification.delete(player.id);
						mogi.players.delete(player.id);

						channel.send(moginickname(player.nickname, player.username) + " has been removed due to inactivity").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
					}
				}
			}

			var found = false;
			var notification = '';
			var notificationlist = mogi.notification.keyArray();
			for (var j = 0; j <notificationlist.length; j++)
			{
				var notice = mogi.notification.get(notificationlist[j]);
				if (notice.sent == 0)
				{
					notification += '<@' +notice.id + '> '
					notice.sent = 1;
					found = true;
				}
			}

			if (found)
			{
				notification += ' please type something in the chat within 5 minutes to keep your spot in the mogi';
				channel.send(notification).then(msg => {msg.delete(config.inactive_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
		}
	});
}

setInterval(function() { cleanMogi() }, config.inactive_check_rate);
