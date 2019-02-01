module.exports = {
  name: 'shutdown',
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
    if (client.config.owner == message.author.id)
		{
			var total = 0;
			var count = 0;
			mogichannel.forEach((mogi, channel, map) => 
			{
				process.exit();
			});
		}
  }
}