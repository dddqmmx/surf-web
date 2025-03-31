import { Component } from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {RouterOutlet} from "@angular/router";
import {CommonDataService} from "../../../services/common-data.service";

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterOutlet,
    NgForOf
  ],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.css'
})
export class ChannelsComponent {
  constructor(protected commonDataService:CommonDataService) {
  }
}
