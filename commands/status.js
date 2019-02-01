module.exports = {
  name: 'status',
  aliases: ['s'],
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (mogi.isCollecting || mogi.players.size > 0)
		{
			if (mogi.players.size == 0)
			{
				message.channel.send("There are no players in the mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
			else
			{
				var list = '`Mogi List`\n';
				var rng = '';
				var playerslist = mogi.players.sort((a, b) => a.joinDate - b.joinDate).keyArray();
				for (var i = 0; i < playerslist.length; i++)
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
				message.channel.send(list).then(msg => {msg.delete(client.config.long_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
		}
		else
		{
			message.channel.send("Mogi is not started -- type `!start` to start a mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
		}
  }
}