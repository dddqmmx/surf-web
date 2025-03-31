import {Component} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";

@Component({
    selector: 'app-user-info',
    standalone: true,
    imports: [
        NgOptimizedImage,
        NgIf
    ],
    templateUrl: './user-info.component.html',
    styleUrl: './user-info.component.css'
})
export class UserInfoComponent {
    constructor(protected commonDataService: CommonDataService) {
    }
}
