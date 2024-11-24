import { BadRequestException } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class PlanningPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  selectedCards: Map<string, Map<number, number>> = new Map();

  handleConnection(client: Socket) {
    const { projectId, userId, username } = client.handshake.auth.payload;

    if (!this.selectedCards.has(projectId)) {
      this.selectedCards.set(projectId, new Map());
    }
    this.selectedCards.get(projectId).set(userId, 0);

    client.join(projectId);
    this.server.to(projectId).emit('user_joined', { userId, username });
  }

  handleDisconnect(client: Socket) {
    client.rooms.forEach((projectId) => {
      client.leave(projectId);
    });

    this.selectedCards.forEach((projectCards) => {
      projectCards.delete(client.data.userId);
    });

    this.broadcastToOthers(client, 'user_left', { userId: client.data.userId });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, payload: { projectId: string }) {
    const { projectId } = payload;
    const userId = client.data.user.id;
    client.leave(projectId);

    this.getProjectCardsOrThrow(projectId).delete(userId);

    this.broadcastToOthers(client, 'user_left', { userId });
  }

  @SubscribeMessage('select_card')
  handleSelectCard(client: Socket, payload: { projectId: string; cardId: number }) {
    const { projectId, cardId } = payload;
    const userId = client.data.user.id;

    const projectCardMap = this.getProjectCardsOrThrow(projectId);

    projectCardMap.set(userId, cardId);

    this.broadcastToOthers(client, 'card_selected', { userId });
  }

  @SubscribeMessage('reveal_card')
  handleRevealCard(client: Socket, payload: { projectId: string }) {
    const { projectId } = payload;
    const projectCards = this.getProjectCardsOrThrow(projectId);

    const cardDetails = Array.from(projectCards.entries()).map(([userId, cardId]) => ({
      userId,
      cardId,
    }));

    this.server.to(projectId).emit('card_revealed', cardDetails);
  }

  @SubscribeMessage('reset_card')
  handleResetCard(client: Socket, payload: { projectId: string }) {
    const { projectId } = payload;
    const projectCards = this.getProjectCardsOrThrow(projectId);

    projectCards.forEach((_, userId) => {
      projectCards.set(userId, 0);
    });

    this.broadcastToOthers(client, 'card_reset');
  }

  private getProjectCardsOrThrow(projectId: string) {
    const projectCards = this.selectedCards.get(projectId);
    if (!projectCards) {
      throw new BadRequestException('Project not found');
    }

    return projectCards;
  }

  private broadcastToOthers(client: Socket, event: string, data?: any) {
    const room = Array.from(client.rooms).find((r) => r !== client.id);
    if (room) {
      this.server.to(room).emit(event, data);
    }
  }
}
