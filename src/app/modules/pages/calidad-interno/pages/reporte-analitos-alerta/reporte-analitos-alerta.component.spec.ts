import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAnalitosAlertaComponent } from './reporte-analitos-alerta.component';

describe('ReporteAnalitosAlertaComponent', () => {
  let component: ReporteAnalitosAlertaComponent;
  let fixture: ComponentFixture<ReporteAnalitosAlertaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteAnalitosAlertaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteAnalitosAlertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
