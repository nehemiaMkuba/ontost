import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-modal-instance-properties',
  templateUrl: './modal-instance-properties.component.html',
  styleUrls: ['./modal-instance-properties.component.css']
})
export class ModalInstancePropertiesComponent implements OnInit {
  @Input() element;
  constructor() { }

  ngOnInit() {
  }

}
