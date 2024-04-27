import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTestComponent } from './gestion-test.component';

describe('GestionTestComponent', () => {
  let component: GestionTestComponent;
  let fixture: ComponentFixture<GestionTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
