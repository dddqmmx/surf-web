import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";

@Component({
  selector: 'app-chat-image',
  standalone: true,
  imports: [NgIf],
  templateUrl: './chat-image.component.html',
  styleUrl: './chat-image.component.css'
})
export class ChatImageComponent {

  constructor(protected commonData: CommonDataService) {}

  @Input() image!: string;
  @Input() h!: string;
  @Input() w!: string;

  get maxDisplayWidth(): number {
    return Math.floor(window.innerWidth * 0.5);
  }

  get maxDisplayHeight(): number {
    return Math.floor(window.innerHeight * 0.4);
  }

  private getScale(): number {
    const origW = Number(this.w);
    const origH = Number(this.h);

    if (!origW || !origH || origW <= 0 || origH <= 0) return 1;

    const maxW = this.maxDisplayWidth;
    const maxH = this.maxDisplayHeight;

    // 计算缩放比例，取最小值确保不超出任何限制
    const scaleW = maxW / origW;
    const scaleH = maxH / origH;

    return Math.min(scaleW, scaleH, 1); // 永远不放大，最多1:1
  }

  get displayWidth(): number {
    const origW = Number(this.w);
    if (!origW || origW <= 0) return 200; // 默认值

    const scale = this.getScale();
    return Math.floor(origW * scale);
  }

  get displayHeight(): number {
    const origH = Number(this.h);
    if (!origH || origH <= 0) return 200; // 默认值

    const scale = this.getScale();
    return Math.floor(origH * scale);
  }
}
