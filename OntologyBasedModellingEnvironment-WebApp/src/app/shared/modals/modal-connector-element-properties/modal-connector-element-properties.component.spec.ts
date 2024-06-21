import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import {ModalPaletteElementPropertiesComponent} from '../modal-palette-element-properties/modal-palette-element-properties.component';


describe('ModalPaletteElementPropertiesComponent', () => {
  let component: ModalPaletteElementPropertiesComponent;
  let fixture: ComponentFixture<ModalPaletteElementPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPaletteElementPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPaletteElementPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
