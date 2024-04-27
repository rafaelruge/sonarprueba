import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WestgardComponent } from './westgard.component';

describe('WestgardComponent', () => {
  let component: WestgardComponent;
  let fixture: ComponentFixture<WestgardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WestgardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WestgardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
