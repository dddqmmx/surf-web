import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";

@Component({
  selector: 'app-chat-image',
  standalone: true,
    imports: [
        NgIf
    ],
  templateUrl: './chat-image.component.html',
  styleUrl: './chat-image.component.css'
})
export class ChatImageComponent {

  constructor(    protected commonData: CommonDataService ) {
  }
  @Input() image!: string;
  @Input() h!: string;
  @Input() w!: string;

  get displayWidth(): number {
    const origW = Number(this.w);
    const origH = Number(this.h);
    if (!origW || !origH) return 0;

    const maxWidth = window.innerWidth * 0.6;
    const maxHeight = window.innerHeight * 0.5;
    const ratio = origW / origH;

    let width: number, height: number;

    if (ratio >= 1) { // 横图
      width = Math.min(origW, maxWidth);
      height = width / ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
    } else { // 竖图或正方
      height = Math.min(origH, maxHeight);
      width = height * ratio;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / ratio;
      }
    }

    return width;
  }

  get displayHeight(): number {
    const origW = Number(this.w);
    const origH = Number(this.h);
    if (!origW || !origH) return 0;

    const maxWidth = window.innerWidth * 0.6;
    const maxHeight = window.innerHeight * 0.5;
    const ratio = origW / origH;

    let width: number, height: number;

    if (ratio >= 1) {
      width = Math.min(origW, maxWidth);
      height = width / ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
    } else {
      height = Math.min(origH, maxHeight);
      width = height * ratio;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / ratio;
      }
    }

    return height;
  }


}
