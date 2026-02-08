import { socketService } from '../socket';
import { networkConfig } from '../state';

export class ChatService {
  async sendOffer(target_user_id: string, target_client_id: string, sdp: any = {}) {
    socketService.send('chat', 'send_offer', {
      target_user_id,
      target_client_id,
      sdp: JSON.stringify(sdp),
    });
  }

  async sendAnswer(target_user_id: string, target_client_id: string, sdp: any = {}) {
    socketService.send('chat', 'send_answer', {
      target_user_id,
      target_client_id,
      sdp: JSON.stringify(sdp),
    });
  }

  async sendIceCandidate(target_user_id: string, target_client_id: string, candidate: any = {}) {
    socketService.send('chat', 'send_ice_candidate', {
      target_user_id,
      target_client_id,
      candidate: JSON.stringify(candidate),
    });
  }

  async uploadImage(file: File): Promise<string | null> {
    const url = `${networkConfig.httpPrefix}/chat/upload_image`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = (await res.json()) as { hash: string };
      return data.hash ?? null;
    } catch (err) {
      console.error('[Image] 上传失败:', err);
      return null;
    }
  }

  async sendImage(channelId: string | null, content: string, w: number, h: number) {
    socketService.send('chat', 'send_image', {
      channel_id: channelId,
      content,
      w,
      h,
    });
  }
}

export const chatService = new ChatService();
