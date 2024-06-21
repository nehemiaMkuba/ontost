import {Component, OnInit} from '@angular/core';
import {ModellerService} from './core/services/modeller/modeller.service';
import {filter, switchMap, take} from 'rxjs/operators';
import {AuthService} from './core/services/auth/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private modellerService: ModellerService, private auth: AuthService) {
  }

  ngOnInit(): void {




  }
}
