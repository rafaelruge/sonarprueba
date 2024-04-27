import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteClienteCualitativoComponent } from './reporte-cliente-cualitativo.component';

describe('ReporteClienteCualitativoComponent', () => {
  let component: ReporteClienteCualitativoComponent;
  let fixture: ComponentFixture<ReporteClienteCualitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteClienteCualitativoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteClienteCualitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
