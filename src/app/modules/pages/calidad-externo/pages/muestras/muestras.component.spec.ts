import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MuestrasComponent } from './muestras.component';

describe('MuestrasComponent', () => {
  let component: MuestrasComponent;
  let fixture: ComponentFixture<MuestrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MuestrasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MuestrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
