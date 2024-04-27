import { Component } from '@angular/core';

import {
    Router,
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router';


@Component({
    selector: 'app-cargador',
    templateUrl: './cargador.component.html',
    styleUrls: ['./cargador.component.scss']
})

export class CargadorComponent {

    public showOverlay = true;

    constructor(private router: Router) {

        router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event);
        });
    }

    navigationInterceptor(event: RouterEvent): void {
        if (event instanceof NavigationStart) {
            this.showOverlay = true;
        }
        if (event instanceof NavigationEnd) {
            this.showOverlay = false;
        }
        if (event instanceof NavigationCancel) {
            this.showOverlay = false;
        }
        if (event instanceof NavigationError) {
            this.showOverlay = false;
        }
    }

}
