module.exports = {
  name: 'can',
  aliases: ['c'],
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (mogi.isCollecting)
			{
				if (mogi.players.has(message.author.id))
				{
					message.channel.send(nickname(message) + " is already in the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else if (mogi.players.size < client.config.max_room_size)
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
					message.channel.send(nickname(message) + " has joined the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

					if (!mogi.isRoomHalfFullSet && mogi.players.size == roomSizeHalf)
					{
						message.channel.send("@here +" + (client.config.room_size - roomSizeHalf));
						mogi.isRoomHalfFullSet = true;
					}
					else if (!mogi.isRoomAlmostFullSet && mogi.players.size == (client.config.room_size - 1))
					{
						message.channel.send("@here +1");
						mogi.isRoomAlmostFullSet = true;
					}
					else if (mogi.players.size == client.config.room_size)
					{
						mogi.notification.clear();
						message.channel.send('There are ' + client.config.room_size + ' players in the mogi\nType `!list` to get a list of the players\nType `!end` to end the mogi');
						var notification = '';
						var playerslist = mogi.players.keyArray();
						for (var i = 0; i < playerslist.length; i++)
						{
							notification += '<@' + playerslist[i] + '> '
						}
						notification += ' mogi has ' + client.config.room_size + ' players';
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
					message.channel.send(nickname(message) + " cannot join because the mogi is full").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
			}
			else
			{
				message.channel.send(nickname(message) + " cannot join because a mogi has not been started -- type `!start` to start a mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
  }
}