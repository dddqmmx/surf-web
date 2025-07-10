import {Component, EventEmitter, Output} from '@angular/core';
import {NgForOf} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {RequestService} from "../../services/request.service";

@Component({
  selector: 'app-create-server-dialog',
  standalone: true,
    imports: [
        NgForOf
    ],
  templateUrl: './create-server-dialog.component.html',
  styleUrl: './create-server-dialog.component.css'
})
export class CreateServerDialogComponent {
  constructor(protected commonData:CommonDataService,protected request:RequestService) {
  }
  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件

  onClose() {
    this.close.emit(); // ← 发出关闭事件
  }
}
