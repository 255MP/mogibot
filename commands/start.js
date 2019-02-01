module.exports = {
  name: 'start',
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
      if (mogi.isCollecting)
			{
				message.channel.send("Mogi has " + mogi.players.size + " players -- type `!can`, `!drop`, `!list`").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
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
  }
}