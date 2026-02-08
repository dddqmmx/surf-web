import { Subject } from 'rxjs';
import { requestService } from './request';
import { socketService } from './socket';
import { chatService } from './api/chat';
import { voiceState } from './state';

export class VoiceChatService {
  private channelId?: string;
  private subject: any;
  public isRecording = false;
  private localStream?: MediaStream;
  private pcMap: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();

  onRemoteStream = new Subject<{ userId: string; stream: MediaStream }>();
  onRemoteLeave = new Subject<{ userId: string }>();

  async initializeRecorder(channelId: string) {
    this.channelId = channelId;
    this.isRecording = true;
    if (this.subject) return;
    this.subject = socketService.getMessageSubject('chat', 'webrtc').subscribe((data) => {
      const { type, from, sdp, candidate } = data;
      if (type === 'offer') this.handleOffer(JSON.parse(sdp), from.user_id, from.client_id);
      else if (type === 'answer') this.handleAnswer(JSON.parse(sdp), from.user_id, from.client_id);
      else if (type === 'ice_candidate') this.handleIce(JSON.parse(candidate), from.user_id, from.client_id);
    });
  }

  async join(userId: string, clientId: string) {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    }
    const pc = this.createPeerConnection(userId, clientId);
    this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await chatService.sendOffer(userId, clientId, offer);
  }

  leave(userId: string) {
    const pc = this.pcMap.get(userId);
    if (pc) {
      pc.close();
      this.pcMap.delete(userId);
    }
    const stream = this.remoteStreams.get(userId);
    stream?.getTracks().forEach((t) => t.stop());
    this.remoteStreams.delete(userId);
    if (this.pcMap.size === 0) {
      this.isRecording = false;
      this.localStream?.getTracks().forEach((t) => t.stop());
      this.localStream = undefined;
    }
    this.onRemoteLeave.next({ userId });
  }

  stop() {
    requestService.requestDisconnectToVoiceChannel();
    for (const [, pc] of this.pcMap) {
      pc.close();
    }
    for (const stream of this.remoteStreams.values()) {
      stream.getTracks().forEach((t) => t.stop());
    }
    this.pcMap.clear();
    this.remoteStreams.clear();
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = undefined;
    this.isRecording = false;
    voiceState.voiceChatting = false;
  }

  private createPeerConnection(userId: string, clientId: string): RTCPeerConnection {
    if (this.pcMap.has(userId)) return this.pcMap.get(userId)!;
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.miwifi.com' },
        { urls: 'stun:stun.chat.bilibili.com' },
        { urls: 'stun:turn.cloudflare.com' },
      ],
    });
    pc.onicecandidate = (ev) => {
      if (ev.candidate) chatService.sendIceCandidate(userId, clientId, ev.candidate.toJSON()).then();
    };
    pc.ontrack = (ev) => {
      let stream = this.remoteStreams.get(userId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(userId, stream);
      }
      ev.streams[0].getTracks().forEach((t) => stream!.addTrack(t));
      this.onRemoteStream.next({ userId, stream });
      pc.getStats().then((stats) => {
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && !(report as any).isRemote) {
            console.log(`[ontrack][${userId}] bytesReceived: ${(report as any).bytesReceived}`);
          }
        });
      });
    };
    pc.oniceconnectionstatechange = () => {
      console.log(`[ICE] ${userId}: ${pc.iceConnectionState}`);
    };

    this.pcMap.set(userId, pc);
    return pc;
  }

  private async handleOffer(sdp: any, user_id: string, client_id: string) {
    const pc = this.createPeerConnection(user_id, client_id);

    if (pc.signalingState === 'have-local-offer') {
      await pc.setLocalDescription({ type: 'rollback' });
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    }
    this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await chatService.sendAnswer(user_id, client_id, answer);
  }

  private async handleAnswer(sdp: any, user_id: string, client_id: string) {
    const pc = this.pcMap.get(user_id);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIce(candidate: any, user_id: string, client_id: string) {
    const pc = this.pcMap.get(user_id);
    if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

export const voiceChatService = new VoiceChatService();
