module.exports = {
  name: 'mogilist',
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (!hasRole(message))
		{
			message.channel.send(nickname(message) + " does not have permission to view info").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
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
					if (mogi.players.size >= client.config.room_size)
					{
						full++;
					}

					list += channel + " - " + mogi.players.size + "/" + client.config.room_size + "\n";
				}

			});
			message.channel.send("There are " + collecting + " active mogi and " + full + " full mogi\n\n" + list).then(msg => {msg.delete(client.config.long_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
		}
  }
}