import {Component, OnInit, OnDestroy} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {FileService, FileType} from "../../services/file.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from 'rxjs';
import {AvatarComponent} from "../../components/avatar/avatar.component";

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    AvatarComponent
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
    protected activatedRoute: ActivatedRoute,
    private router: Router,
    protected file: FileService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.queryParamMap.subscribe(params => {
      const userId = params.get('user_id');
      if (userId) {
        this.user = userId;
        // 你可以在这里调用某个方法加载数据
      }
    });
  }

  toUserProfileEditor(){
    this.router.navigate(['/main/user_profile_editor']).then();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
