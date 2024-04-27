import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesPreComponent } from './reportes-pre.component';

describe('ReportesPreComponent', () => {
  let component: ReportesPreComponent;
  let fixture: ComponentFixture<ReportesPreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportesPreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesPreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
