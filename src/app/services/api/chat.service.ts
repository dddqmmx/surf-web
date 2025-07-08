import { Injectable } from '@angular/core';
import {SocketService} from "../socket.service";
import {catchError, firstValueFrom, map, Observable, of, switchMap, tap} from "rxjs";
import {CommonDataService} from "../common-data.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http: HttpClient,
    private socket: SocketService,
    private commonData: CommonDataService
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

  public async uploadImage(file: File): Promise<string | null> {
    const url = `${this.commonData.httpPrefix}/chat/upload_image`;

    try {
      const res = await firstValueFrom(
        this.http.put<{ hash: string }>(url, file, {
          headers: {
            'Content-Type': file.type
          },
          responseType: 'json'
        })
      );

      console.log('[Image] 文件上传成功，hash:', res.hash);
      return res.hash;

    } catch (err) {
      console.error('[Image] 上传失败:', err);
      return null;
    }
  }


  public async sendImage(channelId: string | null, content: string, w: number, h: number){
    this.socket.send("chat","send_image",{
      "channel_id": channelId,
      "content":content,
      "w": w,
      "h": h
    })
  }

}
