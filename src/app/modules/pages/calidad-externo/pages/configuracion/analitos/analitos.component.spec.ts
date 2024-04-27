import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalitosComponent } from './analitos.component';

describe('AnalitosComponent', () => {
  let component: AnalitosComponent;
  let fixture: ComponentFixture<AnalitosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalitosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
