import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ToolRecursivePaletteElementComponent } from './-tool-recursive-palette-element.component';

describe('ToolRecursivePaletteElementComponent', () => {
  let component: ToolRecursivePaletteElementComponent;
  let fixture: ComponentFixture<ToolRecursivePaletteElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolRecursivePaletteElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolRecursivePaletteElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
