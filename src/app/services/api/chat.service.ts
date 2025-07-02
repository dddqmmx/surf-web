import { Injectable } from '@angular/core';
import {SocketService} from "../socket.service";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private socket: SocketService,
  ) { }

  public async sendOffer(target_user_id:string,sdp: any = {}){
    this.socket.send("chat","send_offer",{
      "target_user_id":target_user_id,
      "sdp":JSON.stringify(sdp)
    })
  }

  public async sendAnswer(target_user_id:string,sdp: any = {}){
    this.socket.send("chat","send_answer",{
      "target_user_id":target_user_id,
      "sdp":JSON.stringify(sdp)
    })
  }

  public async sendIceCandidate(target_user_id:string,candidate: any = {}){
    this.socket.send("chat","send_ice_candidate",{
      "target_user_id":target_user_id,
      "candidate":JSON.stringify(candidate)
    })
  }

}
