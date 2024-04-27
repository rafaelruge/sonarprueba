import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialControlComponent } from './material-control.component';

describe('MaterialControlComponent', () => {
  let component: MaterialControlComponent;
  let fixture: ComponentFixture<MaterialControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
