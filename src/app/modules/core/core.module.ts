import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCdnPipe } from './pipes/image-cdn.pipe';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatchSubmenuPipe } from './pipes/match-submenu.pipe';
import { DefaultImagePipe } from './pipes/default-image.pipe';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  declarations: [
    ImageCdnPipe,
    MatchSubmenuPipe,
    DefaultImagePipe,
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
  ],
  providers: [{
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }],
  exports: [
    ImageCdnPipe,
    MatchSubmenuPipe,
    PerfectScrollbarModule,
    DefaultImagePipe
  ],
})
export class CoreModule { }
