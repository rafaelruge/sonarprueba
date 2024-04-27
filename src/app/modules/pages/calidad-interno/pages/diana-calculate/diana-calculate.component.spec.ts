import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DianaCalculateComponent } from './diana-calculate.component';

describe('DianaCalculateComponent', () => {
  let component: DianaCalculateComponent;
  let fixture: ComponentFixture<DianaCalculateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DianaCalculateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DianaCalculateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
