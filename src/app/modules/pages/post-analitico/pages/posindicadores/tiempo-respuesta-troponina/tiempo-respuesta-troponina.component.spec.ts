import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoRespuestaTroponinaComponent } from './tiempo-respuesta-troponina.component';

describe('TiempoRespuestaTroponinaComponent', () => {
  let component: TiempoRespuestaTroponinaComponent;
  let fixture: ComponentFixture<TiempoRespuestaTroponinaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiempoRespuestaTroponinaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiempoRespuestaTroponinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
