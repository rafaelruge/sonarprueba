import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionMediaDsComponent } from './configuracion-media-ds.component';

describe('ConfiguracionMediaDsComponent', () => {
  let component: ConfiguracionMediaDsComponent;
  let fixture: ComponentFixture<ConfiguracionMediaDsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfiguracionMediaDsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionMediaDsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
