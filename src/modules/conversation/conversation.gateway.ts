import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageEntity } from './entities/message.entity';
import { MessageDto } from './dtos/message.dto';
import { ConversationSummaryEntity } from './entities/conversation.entity';
import { ConversationSummaryDto } from './dtos/conversation.dto';

/**
 * WebSocket Gateway responsible for handling conversation-related socket events.
 *
 * Namespace: `/conversation`
 * CORS: Allows all origins
 */
@WebSocketGateway({
  namespace: '/conversation',
  cors: {
    origin: '*',
  },
})
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtService: JwtService) {}
  /**
   * Maps user IDs to their corresponding socket client IDs.
   */
  clients = new Map<number, string>();

  /**
   * Reference to the Socket.IO server instance.
   */
  @WebSocketServer()
  server: Server;

  /**
   * Called automatically when a new client connects.
   * Verifies the JWT from the client's query params and stores the mapping.
   *
   * @param client The connected socket client
   */
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token;
      const payload = this.jwtService.verify(token as string);
      const userId = payload['id'];
      this.clients.set(userId, client.id);
    } catch (_) {
      void _;
      client.disconnect(true);
    }
  }
  /**
   * Called automatically when a client disconnects.
   * Removes the associated client ID from the internal clients map.
   *
   * @param client The disconnected socket client
   */
  handleDisconnect(client: Socket) {
    for (const [userId, clientId] of this.clients.entries()) {
      if (clientId === client.id) {
        this.clients.delete(userId);
        break;
      }
    }
  }

  addMessage(userId: number, message: MessageEntity) {
    const clientId = this.clients.get(userId);
    if (!clientId) {
      return;
    }
    this.server
      .to(clientId)
      .emit('add_message', MessageDto.fromEntity(message));
  }

  refreshConversation(userId: number, conversation: ConversationSummaryEntity) {
    const clientId = this.clients.get(userId);
    if (!clientId) {
      return;
    }
    this.server
      .to(clientId)
      .emit(
        'refresh_conversation',
        ConversationSummaryDto.fromEntity(conversation),
      );
  }
}
