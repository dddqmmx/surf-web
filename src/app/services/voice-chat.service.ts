import { Injectable } from "@angular/core";
import { RequestService } from "./request.service";
import { CommonDataService } from "./common-data.service";
import { SocketService } from "./socket.service";
import {Subject} from "rxjs";
import {ChatService} from "./api/chat.service";

@Injectable({
  providedIn: 'root',
})
export class VoiceChatService {
  private channelId: string | undefined;
  private subject: any;
  public isRecording = false;
  private pc?: RTCPeerConnection;
  private localStream?: MediaStream;
  private remoteStream = new MediaStream();

  onRemoteStream = new Subject<MediaStream>();


  constructor(
    private requestService: RequestService,
    private socketService: SocketService,
    private chatService:ChatService,
    private common: CommonDataService
  ) {
  }

  /** 初始化录音器 */
  async initializeRecorder(channelId: string) {
    this.channelId = channelId;
    this.isRecording = true;
    this.subject = this.socketService.getMessageSubject("chat", "webrtc").subscribe(data => {
      const type = data["type"]
      const from = data["from"]
      if (type == "offer") {
        this.handleOffer(JSON.parse(data["sdp"]),from)
      }else if (type == "answer") {
        this.handleAnswer(JSON.parse(data["sdp"]))
      }else if (type == "handleIce"){
        this.handleIce(JSON.parse(data["candidate"]))
      }
    });
  }

  async join(user_id: string) {
    this.pc = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun.miwifi.com'},
        {urls: 'stun:stun.chat.bilibili.com'},
        {urls: 'stun:turn.cloudflare.com'}
      ]
    });

    // add local mic track
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));

    // collect remote tracks
    this.pc.ontrack = ev => {
      ev.streams[0].getTracks().forEach(t => this.remoteStream.addTrack(t));
      this.onRemoteStream.next(this.remoteStream);
    };

    // ICE candidates
    this.pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.chatService.sendIceCandidate(user_id, ev.candidate.toJSON())
      }
    };

    // create & send offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.chatService.sendOffer(user_id, offer);
  }

  leave() {
    this.requestService.requestDisconnectToVoiceChannel(this.channelId);
    this.isRecording = false;
    this.pc?.close();
    this.remoteStream.getTracks().forEach(t => t.stop());
    this.localStream?.getTracks().forEach(t => t.stop());
    this.pc = undefined;
    this.localStream = undefined;
    this.remoteStream = new MediaStream();
  }

  private async handleOffer(sdp:any,from:string) {
    if (!this.pc) {
      this.pc = new RTCPeerConnection({
        iceServers: [
          {urls: 'stun:stun.l.google.com:19302'},
          {urls: 'stun:stun.miwifi.com'},
          {urls: 'stun:stun.chat.bilibili.com'},
          {urls: 'stun:turn.cloudflare.com'}
        ]
      });

      // 这里要重复绑定 ontrack、onicecandidate
      this.pc.ontrack = ev => {
        ev.streams[0].getTracks().forEach(t => this.remoteStream.addTrack(t));
        this.onRemoteStream.next(this.remoteStream);
      };

      this.pc.onicecandidate = ev => {
        if (ev.candidate) {
          this.chatService.sendIceCandidate(from, ev.candidate.toJSON());
        }
      };

      // 加入 mic track
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.chatService.sendAnswer(from, answer);
  }


  private async handleAnswer(sdp:any) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIce(candidate: any) {
    if (!this.pc || !candidate) return;
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

}
