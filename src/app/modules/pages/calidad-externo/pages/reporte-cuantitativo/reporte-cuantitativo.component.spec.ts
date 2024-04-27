import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCuantitativoComponent } from './reporte-cuantitativo.component';

describe('ReporteCuantitativoComponent', () => {
  let component: ReporteCuantitativoComponent;
  let fixture: ComponentFixture<ReporteCuantitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteCuantitativoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteCuantitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
