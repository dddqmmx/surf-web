import {Component, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-dev-console',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './dev-console.component.html',
  styleUrl: './dev-console.component.css'
})
export class DevConsoleComponent implements OnInit{
  logs: string[] = [];

  ngOnInit(): void {
    const originalLog = console.log;

    console.log = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      this.logs.push(message);
      if (this.logs.length > 1000) {
        this.logs.shift();
      }
      originalLog.apply(console, args);
    };
  }
}
