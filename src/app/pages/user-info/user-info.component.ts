import {Component, OnInit} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {FileService, FileType} from "../../services/file.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf
  ],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent implements OnInit {
  constructor(protected commonDataService: CommonDataService,protected router: ActivatedRoute,protected file: FileService) {
  }

  protected readonly FileType = FileType;
  protected user :string= ""

  ngOnInit(): void {
    const userId = this.router.snapshot.queryParamMap.get('user_id');
    if (userId){
      this.user = userId
    }
  }
}
