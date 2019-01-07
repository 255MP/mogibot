module.exports = {
  name: 'tag',
  aliases: ['notify'],
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (mogi.isCollecting || mogi.players.size > 0)
			{
				if (!hasRole(message))
				{
					message.channel.send(nickname(message) + " does not have permission to tag/notify -- ask a moderator to tag the room").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					var notification = '';
					var playerslist = mogi.players.keyArray();
					for (var i = 0; i < playerslist.length; i++)
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
				message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
  }
}