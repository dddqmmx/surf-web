import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonDataService} from "../common-data.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private commonData: CommonDataService) {
  }


}
