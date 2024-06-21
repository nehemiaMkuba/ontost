import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { PaletteAreaComponent } from './palette-area.component';

describe('PaletteAreaComponent', () => {
  let component: PaletteAreaComponent;
  let fixture: ComponentFixture<PaletteAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaletteAreaComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
