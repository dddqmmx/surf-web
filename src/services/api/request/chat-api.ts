import { socketService } from '../../socket';

export class ChatRequestApi {
  sendMessage(sessionId: string | null | undefined, messageContent: string): void {
    socketService.send('chat', 'send_message', {
      channel_id: sessionId,
      content: messageContent,
    });
  }

  async getMessage(channelId: string | null, lastMsg?: any): Promise<any[]> {
    const payload: Record<string, unknown> = { channel_id: channelId };

    if (lastMsg) {
      payload.last_msg = {
        id: lastMsg._id.$oid,
        time: lastMsg.chat_time.$date.$numberLong,
      };
    }

    const response = await socketService.request('chat', 'get_message', payload);
    return response.messages ?? [];
  }

  sendAudio(channelId: string | undefined, data: unknown): void {
    socketService.send('chat', 'send_audio', {
      channel_id: channelId,
      data,
    });
  }
}
