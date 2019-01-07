module.exports = {
  name: 'remove',
  aliases: ['r'],
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (mogi.isCollecting)
			{
				if (!hasRole(message))
				{
					message.channel.send(nickname(message) + " does not have permission to remove -- ask a moderator to remove a player").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var index = args[0];
					if (!isNaN(index))
					{
						if (mogi.players.size == 0)
						{
							message.channel.send("There are no players in the mogi to remove").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
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

								message.channel.send(moginickname(player.nickname, player.username) + " has been removed from the mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

								if (mogi.players.size == client.config.room_size - 1)
								{
									playerslist = mogi.players.keyArray();
									for (var i = 0; i < playerslist.length; i++)
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
									message.channel.send("You can remove the first player by typing `!remove 1`").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
								}
								else
								{
									message.channel.send("You can remove the player by typing `!remove #` where # is from 1 to " + mogi.players.size).then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
								}
							}
						}
					}
					else
					{
						message.channel.send("Invalid input -- you must use `!remove <player # on list>`, type `!list` to get list of players").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
					}
				}
			}
			else
			{
				message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
  }
}