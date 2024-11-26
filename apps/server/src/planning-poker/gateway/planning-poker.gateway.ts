import { BadRequestException } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '@/account/user.service';

@WebSocketGateway()
export class PlanningPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}

  @WebSocketServer()
  server: Server;

  selectedCards: Map<
    string,
    { isRevealed: boolean; users: Map<number, { username: string; card: string }> }
  > = new Map();

  async handleConnection(client: Socket) {
    const { projectId } = client.handshake.auth;
    const { id, username } = client.data.user;
    const { profileImage } = await this.userService.getOne(id);

    if (!this.selectedCards.has(projectId)) {
      this.selectedCards.set(projectId, { isRevealed: false, users: new Map() });
    }
    this.selectedCards.get(projectId).users.set(id, { username, card: '' });

    client.join(projectId);

    const userDetails = await this.getUserDetails(projectId);

    client.emit('users_fetched', userDetails);
    this.broadcastToOthers(client, 'user_joined', { userId: id, username, profileImage });
  }

  private async getUserDetails(projectId: string) {
    const getCardStatus = (card: string, isRevealed: boolean) => {
      if (isRevealed) {
        return card;
      }
      return card === '' ? '' : 'SELECTED';
    };

    const projectCards = this.getProjectCardsOrThrow(projectId);

    const users = await Promise.all(
      Array.from(projectCards.users.entries()).map(async ([userId, { username, card }]) => {
        const user = await this.userService.getOne(userId);
        return {
          userId,
          username,
          card: getCardStatus(card, projectCards.isRevealed),
          profileImage: user.profileImage,
        };
      })
    );

    return {
      isRevealed: projectCards.isRevealed,
      users,
    };
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user.id;
    const projectId = Array.from(this.selectedCards.entries()).find(([_, projectCards]) =>
      projectCards.users.has(userId)
    )?.[0];

    if (!projectId) {
      return;
    }

    this.server.to(projectId).emit('user_left', { userId });

    this.getProjectCardsOrThrow(projectId).users.delete(userId);

    const roomSize = this.server.sockets.adapter.rooms.get(projectId)?.size || 0;
    if (roomSize === 0) {
      this.selectedCards.delete(projectId);
    }
  }

  @SubscribeMessage('select_card')
  handleSelectCard(client: Socket, payload: { projectId: string; card: string }) {
    const { projectId, card } = payload;
    const userId = client.data.user.id;

    const projectCards = this.getProjectCardsOrThrow(projectId);

    projectCards.users.get(userId).card = card;

    this.broadcastToOthers(client, 'card_selected', { userId });
  }

  @SubscribeMessage('reveal_card')
  handleRevealCard(client: Socket, payload: { projectId: string }) {
    const { projectId } = payload;
    const projectCards = this.getProjectCardsOrThrow(projectId);

    const hasNonEmptyCards = Array.from(projectCards.users.entries()).some(
      ([_, data]) => data.card !== ''
    );
    if (!hasNonEmptyCards) {
      return;
    }

    projectCards.isRevealed = true;

    const cardDetails = Array.from(projectCards.users.entries()).map(([userId, data]) => ({
      userId,
      card: data.card,
    }));

    this.server.to(projectId).emit('card_revealed', cardDetails);
  }

  @SubscribeMessage('reset_card')
  handleResetCard(client: Socket, payload: { projectId: string }) {
    const { projectId } = payload;
    const projectCards = this.getProjectCardsOrThrow(projectId);

    projectCards.users.forEach((userDetail, userId) => {
      projectCards.users.set(userId, { ...userDetail, card: '' });
    });

    projectCards.isRevealed = false;

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
      client.to(room).emit(event, data);
    }
  }
}
