import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  constructor(protected router: Router) {

  }

  toLogin() {
    this.router.navigate(["/login"]).then()
  }
}
