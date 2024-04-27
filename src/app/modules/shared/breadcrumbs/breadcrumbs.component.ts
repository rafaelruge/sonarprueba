import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { MenuLevel3 } from '@app/Models/MenuLevel3';
import { SharedService } from '@app/services/shared.service';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  menuAll: Array<MenuLevel3> = [];
  pathFull: MenuLevel3;
  url: string;
  private destroy$ = new Subject<boolean>();

  constructor(private router: Router,
              private title: Title,
              private sharedService: SharedService) { }

  ngOnInit(): void {
    this._routerSubs();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private _routerSubs(): void {
    this.url = this.router.url;
    this.router.events.subscribe((e: any) => {      
      if (e instanceof NavigationEnd) {       
        this.url = e.url.toString();
        this._createPathArray();
      }
      if (e instanceof ActivationEnd) {
        if(e.snapshot.firstChild === null){
          const titulo = e.snapshot.data.titulo
          this.title.setTitle(titulo); // coloca el titulo en el TAB del Buscador         
        }        
      }
    });

    this.sharedService.getMenu
      .pipe(takeUntil(this.destroy$))
      .subscribe((menu: any) => {
        this.menuAll = menu;
        this._createPathArray();
      });
  }

  private _createPathArray(): void {
    const url = this.url.split('/')[2] + "/" + this.url.split('/')[3];   
    const path = this.menuAll.find((i: MenuLevel3) =>
      i.menuUrlLevel3.toLowerCase().includes(url.toLowerCase()) ||
      i.menuUrlLevel2.toLowerCase().includes(url.toLowerCase()) ||
      i.menuUrlLevel1.toLowerCase().includes(url.toLowerCase())
    );
    this.pathFull = path;
  }
}
