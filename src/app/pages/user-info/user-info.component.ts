import {Component, OnInit, OnDestroy} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {FileService, FileType} from "../../services/file.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from 'rxjs';

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
export class UserInfoComponent implements OnInit, OnDestroy {
  protected readonly FileType = FileType;
  protected user: string = "";
  private routeSub!: Subscription;

  constructor(
    protected commonDataService: CommonDataService,
    protected router: ActivatedRoute,
    protected file: FileService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.router.queryParamMap.subscribe(params => {
      const userId = params.get('user_id');
      if (userId) {
        this.user = userId;
        // 你可以在这里调用某个方法加载数据
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
