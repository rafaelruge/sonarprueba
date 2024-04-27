import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresReportesComponent } from './indicadores-reportes.component';

describe('IndicadoresReportesComponent', () => {
  let component: IndicadoresReportesComponent;
  let fixture: ComponentFixture<IndicadoresReportesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadoresReportesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadoresReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
