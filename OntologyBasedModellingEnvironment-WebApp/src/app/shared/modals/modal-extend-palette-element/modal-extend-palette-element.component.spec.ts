import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModalExtendPaletteElementComponent } from './modal-extend-palette-element.component';

describe('ModalExtendPaletteElementComponent', () => {
  let component: ModalExtendPaletteElementComponent;
  let fixture: ComponentFixture<ModalExtendPaletteElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalExtendPaletteElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalExtendPaletteElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
