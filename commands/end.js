module.exports = {
  name: 'end',
  execute(client, message, args, mogi, nickname, BrowserConsole, hasRole, now, Player, roomSizeHalf, moginickname, mogichannel, trim) {
   if (mogi.isCollecting)
			{
				if (!hasRole(message) && (mogi.players.size < client.config.room_size || (mogi.players.size >= client.config.room_size && mogi.isRoomFullSet && (now - mogi.dateFull < client.config.minimum_time_to_end_after_full))))
				{
					message.channel.send(nickname(message) + " does not have permission to end the mogi").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
				}
				else
				{
					message.channel.send(nickname(message) + " has ended the mogi");
					mogi.isCollecting = false;
				}
			}
			else
			{
				message.channel.send("Mogi has already ended").then(msg => {msg.delete(client.config.normal_message_delete_rate)}).catch(error => { BrowserConsole.out(error); });
			}
  }
}