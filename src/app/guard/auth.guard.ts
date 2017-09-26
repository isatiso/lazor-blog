import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _router: Router
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // this._router.navigate(['/home']);
        return true;
    }
}
