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



}
