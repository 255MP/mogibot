/**
 * MogiBot
 * 
 * @author 255MP
 * 
 */

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();

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
	const command = args.shift().toLowerCase();

	switch (command) {
		case "start":
			if (mogi.isCollecting)
			{
				message.channel.send("Mogi has " + mogi.players.size + " players -- type `!can`, `!drop`, `!list`").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			else
			{
				message.channel.send(nickname(message) + " has started a mogi -- type `!can`, `!drop`, or `!list`")
				mogi.isCollecting = true;
				mogi.isRoomHalfFullSet = false;
				mogi.isRoomAlmostFullSet = false;
				mogi.isRoomFullSet = false;
				mogi.dateFull = null;
				mogi.players.clear();
				mogi.notification.clear();
			}
			break;
		case "end":
			if (mogi.isCollecting)
			{
				if (!hasRole(message) && (mogi.players.size < config.room_size || (mogi.players.size >= config.room_size && mogi.isRoomFullSet && (now - mogi.dateFull < config.minimum_time_to_end_after_full))))
				{
					message.channel.send(nickname(message) + " does not have permission to end the mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					message.channel.send(nickname(message) + " has ended the mogi");
					mogi.isCollecting = false;
				}
			}
			else
			{
				message.channel.send("Mogi has already ended").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "can":
		case "c":
			if (mogi.isCollecting)
			{
				if (mogi.players.has(message.author.id))
				{
					message.channel.send(nickname(message) + " is already in the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else if (mogi.players.size < config.max_room_size)
				{
					var player = new Player();
					player.id = message.author.id;
					player.username = message.author.username;
					if (message.member === null)
					{
						player.nickname = null;
					}
					else
					{
						player.nickname = message.member.nickname;
					}
					player.joinDate = now;
					player.lastMessageDate = now;
					mogi.players.set(message.author.id, player);
					message.channel.send(nickname(message) + " has joined the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

					if (!mogi.isRoomHalfFullSet && mogi.players.size == roomSizeHalf)
					{
						message.channel.send("@here +" + (config.room_size - roomSizeHalf));
						mogi.isRoomHalfFullSet = true;
					}
					else if (!mogi.isRoomAlmostFullSet && mogi.players.size == (config.room_size - 1))
					{
						message.channel.send("@here +1");
						mogi.isRoomAlmostFullSet = true;
					}
					else if (mogi.players.size == config.room_size)
					{
						mogi.notification.clear();
						message.channel.send('There are ' + config.room_size + ' players in the mogi\nType `!list` to get a list of the players\nType `!end` to end the mogi');
						var notification = '';
						var playerslist = mogi.players.keyArray();
						for (i = 0; i < playerslist.length; i++)
						{
							notification += '<@' + playerslist[i] + '> '
						}
						notification += ' mogi has ' + config.room_size + ' players';
						message.channel.send(notification);

						if (!mogi.isRoomFullSet)
						{
							mogi.isRoomFullSet = true;
							mogi.dateFull = now;
						}
					}
				}
				else
				{
					message.channel.send(nickname(message) + " cannot join because the mogi is full").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
			}
			else
			{
				message.channel.send(nickname(message) + " cannot join because a mogi has not been started -- type `!start` to start a mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "drop":
		case "d":
			if (mogi.isCollecting)
			{
				if (!mogi.players.has(message.author.id))
				{
					message.channel.send(nickname(message) + " is not in the mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var player = mogi.players.get(message.author.id);
					mogi.players.delete(message.author.id);
					mogi.notification.delete(message.author.id);

					message.channel.send(nickname(message) + " has dropped from the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

					if (mogi.players.size == config.room_size - 1)
					{
						var playerslist = mogi.players.keyArray();
						for (i = 0; i < playerslist.length; i++)
						{
							mogi.players.get(playerslist[i]).lastMessageDate = now;
						}
					}
					else if (mogi.players.size <= 1)
					{
						mogi.isRoomHalfFullSet = false;
						mogi.isRoomAlmostFullSet = false;
						mogi.isRoomFullSet = false;
						mogi.dateFull = null;
					}
				}
			}
			else
			{
				message.channel.send(nickname(message) + " cannot be dropped because a mogi has not been started").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "tag":
		case "notify":
			if (mogi.isCollecting || mogi.players.size > 0)
			{
				if (!hasRole(message))
				{
					message.channel.send(nickname(message) + " does not have permission to tag/notify -- ask a moderator to tag the room").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var notification = '';
					var playerslist = mogi.players.keyArray();
					for (i = 0; i < playerslist.length; i++)
					{
						notification += '<@' + playerslist[i] + '> '
						if (i == 11)
						{
							break;
						}
					}
					notification += args.join(' ');
					message.channel.send(notification);
				}
			}
			else
			{
				message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "remove":
		case "r":
			if (mogi.isCollecting)
			{
				if (!hasRole(message))
				{
					message.channel.send(nickname(message) + " does not have permission to remove -- ask a moderator to remove a player").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var index = args[0];
					if (!isNaN(index))
					{
						if (mogi.players.size == 0)
						{
							message.channel.send("There are no players in the mogi to remove").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
						}
						else
						{
							index = parseInt(index);
							if (index >= 1 && index <= mogi.players.size)
							{
								index = parseInt(index);
								var playerslist = mogi.players.sort((a, b) => a.joinDate - b.joinDate).keyArray();
								var player = mogi.players.get(playerslist[index-1]);
								mogi.players.delete(playerslist[index-1]);
								mogi.notification.delete(playerslist[index-1]);

								message.channel.send(moginickname(player.nickname, player.username) + " has been removed from the mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

								if (mogi.players.size == config.room_size - 1)
								{
									playerslist = mogi.players.keyArray();
									for (i = 0; i < playerslist.length; i++)
									{
										mogi.players.get(playerslist[i]).lastMessageDate = now;
									}
								}
								else if (mogi.players.size <= 1)
								{
									mogi.isRoomHalfFullSet = false;
									mogi.isRoomAlmostFullSet = false;
									mogi.isRoomFullSet = false;
									mogi.dateFull = null;
								}
							}
							else
							{
								if (mogi.players.size == 1)
								{
									message.channel.send("You can remove the first player by typing `!remove 1`").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
								}
								else
								{
									message.channel.send("You can remove the player by typing `!remove #` where # is from 1 to " + mogi.players.size).then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
								}
							}
						}
					}
					else
					{
						message.channel.send("Invalid input -- you must use `!remove <player # on list>`, type `!list` to get list of players").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
					}
				}
			}
			else
			{
				message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "lineup":
		case "list":
		case "lu":
		case "l":
			if (mogi.isCollecting || mogi.players.size > 0)
			{
				if (mogi.players.size == 0)
				{
					message.channel.send("There are no players in the mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var list = '`Mogi List`\n';
					var rng = '';
					var playerslist = mogi.players.sort((a, b) => a.joinDate - b.joinDate).keyArray();
					for (i = 0; i < playerslist.length; i++)
					{
						var player = mogi.players.get(playerslist[i]);
						list += '`' + (i+1) + '.` ' + moginickname(player.nickname, player.username) + '\n';
						if (i < 12)
						{
							rng += ' ' + trim(moginickname(player.nickname, player.username));
						}
					}
					list += '\n\n';
					list += 'RandomBot command: `!teams  # ' + rng + '`';
					message.channel.send(list);
				}
			}
			else
			{
				message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			break;
		case "status":
		case "s":
		if (mogi.isCollecting || mogi.players.size > 0)
		{
			if (mogi.players.size == 0)
			{
				message.channel.send("There are no players in the mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			else
			{
				var list = '`Mogi List`\n';
				var rng = '';
				var playerslist = mogi.players.sort((a, b) => a.joinDate - b.joinDate).keyArray();
				for (i = 0; i < playerslist.length; i++)
				{
					var player = mogi.players.get(playerslist[i]);
					list += '`' + (i+1) + '.` ' + moginickname(player.nickname, player.username) + '\n';
					if (i < 12)
					{
						rng += ' ' + trim(moginickname(player.nickname, player.username));
					}
				}
				list += '\n\n';
				list += 'RandomBot command: `!teams  # ' + rng + '`';
				message.channel.send(list).then(msg => {msg.delete(config.long_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
		}
		else
		{
			message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
		}
		break;
		case "mogilist":
		if (!hasRole(message))
		{
			message.channel.send(nickname(message) + " does not have permission to view info").then(msg => {msg.delete(config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
		}
		else
		{
			var collecting = 0;
			var full = 0;
			var list = '';
			mogichannel.forEach((mogi, channel, map) =>
			{
				if (mogi.isCollecting && mogi.players.size > 0)
				{
					collecting++;
					if (mogi.players.size >= config.room_size)
					{
						full++;
					}

					list += channel + " - " + mogi.players.size + "/" + config.room_size + "\n";
				}

			});
			message.channel.send("There are " + collecting + " active mogi and " + full + " full mogi\n\n" + list).then(msg => {msg.delete(config.long_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
		}
		break;
		case "shutdown":
		if (config.owner == message.author.id)
		{
			var total = 0;
			var count = 0;
			mogichannel.forEach((mogi, channel, map) => 
			{
				process.exit();
			});
		}
		break;
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
			for (i = 0; i < playerslist.length; i++)
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
			for (j = 0; j <notificationlist.length; j++)
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
