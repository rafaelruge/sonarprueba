import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalitosFuenteComponent } from './analitos-fuente.component';

describe('AnalitosFuenteComponent', () => {
  let component: AnalitosFuenteComponent;
  let fixture: ComponentFixture<AnalitosFuenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalitosFuenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalitosFuenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
