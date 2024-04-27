import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresCompetenciaTecnicaComponent } from './indicadores-competencia-tecnica.component';

describe('IndicadoresCompetenciaTecnicaComponent', () => {
  let component: IndicadoresCompetenciaTecnicaComponent;
  let fixture: ComponentFixture<IndicadoresCompetenciaTecnicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadoresCompetenciaTecnicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadoresCompetenciaTecnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
