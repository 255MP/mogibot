module.exports = {
  name: 'drop',
  aliases: ['d'],
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (mogi.isCollecting)
			{
				if (!mogi.players.has(message.author.id))
				{
					message.channel.send(nickname(message) + " is not in the mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var player = mogi.players.get(message.author.id);
					mogi.players.delete(message.author.id);
					mogi.notification.delete(message.author.id);

					message.channel.send(nickname(message) + " has dropped from the mogi -- " + mogi.players.size + " players").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });

					if (mogi.players.size == client.config.room_size - 1)
					{
						var playerslist = mogi.players.keyArray();
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
			}
			else
			{
				message.channel.send(nickname(message) + " cannot be dropped because a mogi has not been started").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
  }
}