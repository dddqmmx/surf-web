import { Injectable } from "@angular/core";
import { RequestService } from "./request.service";
import { CommonDataService } from "./common-data.service";
import { SocketService } from "./socket.service";
import { Subject } from "rxjs";
import { ChatService } from "./api/chat.service";

@Injectable({ providedIn: 'root' })
export class VoiceChatService {
  private channelId?: string;
  private subject: any;
  public isRecording = false;
  private localStream?: MediaStream;
  private pcMap: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();

  onRemoteStream = new Subject<{ userId: string; stream: MediaStream }>();
  onRemoteLeave = new Subject<{ userId: string }>();

  constructor(
    private requestService: RequestService,
    private socketService: SocketService,
    private chatService: ChatService,
    private common: CommonDataService
  ) {}

  async initializeRecorder(channelId: string) {
    this.channelId = channelId;
    this.isRecording = true;
    if (this.subject) return;
    this.subject = this.socketService
      .getMessageSubject("chat", "webrtc")
      .subscribe(data => {
        console.log(data)
        const { type, from, sdp, candidate } = data;
        if (type === 'offer') this.handleOffer(JSON.parse(sdp), from);
        else if (type === 'answer') this.handleAnswer(JSON.parse(sdp), from);
        else if (type === 'ice_candidate') this.handleIce(JSON.parse(candidate), from);
      });
  }

  async join(userId: string) {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({  audio: {
          noiseSuppression: true,    // 开启降噪
          echoCancellation: true,    // 回声消除
          autoGainControl: true      // 自动增益
        } });
    }
    const pc = this.createPeerConnection(userId);
    this.localStream.getTracks().forEach(t => pc.addTrack(t, this.localStream!));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.chatService.sendOffer(userId, offer);
  }

  leave(userId: string) {
    const pc = this.pcMap.get(userId);
    if (pc) {
      pc.close();
      this.pcMap.delete(userId);
    }
    const stream = this.remoteStreams.get(userId);
    stream?.getTracks().forEach(t => t.stop());
    this.remoteStreams.delete(userId);
    if (this.pcMap.size === 0) {
      this.isRecording = false;
      this.localStream?.getTracks().forEach(t => t.stop());
      this.localStream = undefined;
    }
    this.onRemoteLeave.next({ userId });
  }

  stop() {
    this.requestService.requestDisconnectToVoiceChannel(this.channelId);
    for (const [, pc] of this.pcMap) {
      pc.close();
    }
    for (const stream of this.remoteStreams.values()) {
      stream.getTracks().forEach(t => t.stop());
    }
    this.pcMap.clear();
    this.remoteStreams.clear();
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = undefined;
    this.isRecording = false;
  }

  private createPeerConnection(userId: string): RTCPeerConnection {
    if (this.pcMap.has(userId)) return this.pcMap.get(userId)!;
    const pc = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun.miwifi.com'},
        {urls: 'stun:stun.chat.bilibili.com'},
        {urls: 'stun:turn.cloudflare.com'}
      ]
    });
    pc.onicecandidate = ev => {
      if (ev.candidate) this.chatService.sendIceCandidate(userId, ev.candidate.toJSON()).then();
    };
    pc.ontrack = ev => {
      let stream = this.remoteStreams.get(userId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(userId, stream);
      }
      ev.streams[0].getTracks().forEach(t => stream!.addTrack(t));
      this.onRemoteStream.next({ userId, stream });

      // === 这里加 getStats 调试 ===
      pc.getStats().then(stats => {
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && !report.isRemote) {
            console.log(`[ontrack][${userId}] bytesReceived: ${report.bytesReceived}`);
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

  private async handleOffer(sdp: any, from: string) {
    const pc = this.createPeerConnection(from);

    if (pc.signalingState === 'have-local-offer') {
      await pc.setLocalDescription({ type: 'rollback' });
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({   audio: {
          noiseSuppression: true,    // 开启降噪
          echoCancellation: true,    // 回声消除
          autoGainControl: true      // 自动增益
        } });
    }
    this.localStream.getTracks().forEach(t => pc.addTrack(t, this.localStream!));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this.chatService.sendAnswer(from, answer);
  }

  private async handleAnswer(sdp: any, from: string) {
    const pc = this.pcMap.get(from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIce(candidate: any, from: string) {
    const pc = this.pcMap.get(from);
    if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}
