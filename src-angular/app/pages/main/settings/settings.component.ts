import {Component} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    RouterOutlet,
    NgClass,
    NgForOf
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  selectedIndex: number = 0; // 默认没有选中按钮
  sidebarItems = [
    {icon: '/images/icon/gpp_maybe.svg', label: '登录设置', url: '/main/settings/account_manage'},
    {icon: '/images/icon/gpp_maybe.svg', label: '常规设置', url: '/main/settings/general_settings'},
    {icon: '/images/icon/gpp_maybe.svg', label: '通知管理'},
    {icon: '/images/icon/gpp_maybe.svg', label: '安全设置'},
    {icon: '/images/icon/gpp_maybe.svg', label: '存储管理'}
  ];

  constructor(private router: Router) {
    this.selectItem(this.selectedIndex)
  }

  selectItem(index: number): void {
    this.selectedIndex = index;
    const item = this.sidebarItems[index];
    if ('url' in item) {
      this.router.navigate([item.url]).then();
    }
  }
}
