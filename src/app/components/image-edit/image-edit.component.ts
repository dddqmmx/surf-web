import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ImageCropperComponent} from "ngx-image-cropper";
import {NgIf} from "@angular/common";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-image-edit',
  standalone: true,
  imports: [
    ImageCropperComponent,
    NgIf
  ],
  templateUrl: './image-edit.component.html',
  styleUrl: './image-edit.component.css'
})
export class ImageEditComponent {
  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件
  @Output() confirm = new EventEmitter<any>();
  croppedImage: any = '';
  @Input() file!: File;
  constructor(private sanitizer: DomSanitizer) {
  }

  imageCropped(event: any) {
    this.croppedImage = event.blob;
  }

  onConfirm() {
    this.confirm.emit(this.croppedImage);
  }

  onClose() {
    this.close.emit(); // ← 发出关闭事件
  }

}
