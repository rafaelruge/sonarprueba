import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from './services/shared.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  position = 'top-center';
  showLoader = false;

  private config: {version: string};

  constructor(
    private router: Router,
    private translate: TranslateService,
    public sharedService: SharedService,
    private httpClient: HttpClient
  ) {
    this.translate.setDefaultLang('es');
  }

  ngOnInit() {
    
    this.config = require("./../assets/config.json");
    const headers = new HttpHeaders()
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache')
    this.httpClient
    .get<{ version: string }>("./../assets/config.json", {headers})
    .subscribe(config => {

      if (config[0].version !== this.config[0].version) 
      {
        location.reload(); 
      }
    });
    this.sharedService.loader.subscribe(s => {
      setTimeout(() => {
        this.showLoader = s;
      }, 0);
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        setTimeout(() => {
          this.sharedService.showLoader(false);
        }, 300);
        return;
      }
      window.scrollTo(0, 0);
      this.sharedService.showLoader(true);
    });

  }

}
