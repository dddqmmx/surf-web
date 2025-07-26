import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom, from, map, Observable, of, switchMap} from "rxjs";
import CryptoJS from "crypto-js";
import {CommonDataService} from "../common-data.service";

interface CreateServerResponse {
  server_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(
    private http: HttpClient,
    private commonData: CommonDataService) {
  }

  public async createServer(servername: string | undefined): Promise<string> {
    const url = `${this.commonData.httpPrefix}/server/create_server`;
    try {
      const response = await firstValueFrom(
        this.http.post<CreateServerResponse>(url, {
          session_id: this.commonData.sessionId,
          servername: servername,
        })
      );
      return response.server_id ?? "";
    } catch (error) {
      console.error("Create server failed:", error);
      return "";
    }
  }

}
