import { playerConnectionsDb } from '../database/playerConnections.js';
import { playersDb } from '../database/players.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { ServerMessageType } from '../types.js';
import { roomsDb } from '../database/rooms.js';
import { PlayerInRoom } from '../models/Room.js';

export const updateRoom = () => {
  const roomsFromDb = roomsDb.getAvailableRooms();
  const rooms = roomsFromDb.map((room) => {
    const roomId = room.getId();
    const roomPlayers: PlayerInRoom[] = room.getRealPlayers();
    const roomUsers = roomPlayers.map((player) => ({
      name: playersDb.getPlayerById(player.playerId)?.name || '',
      index: player.playerId,
    }));

    return {
      roomId,
      roomUsers,
    };
  });

  const roomsMessage = makeResponseMessageString({
    type: ServerMessageType.UpdateRoom,
    data: rooms,
    id: 0,
  });

  const connections = playerConnectionsDb.getAllConnections();

  connections.forEach((connection) => {
    const [playerId, wsConnection] = connection;
    console.log(`Rooms list sent to ${playerId}`);
    wsConnection.send(roomsMessage);
  });
};
