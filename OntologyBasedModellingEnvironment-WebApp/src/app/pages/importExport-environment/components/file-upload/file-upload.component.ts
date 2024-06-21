/*import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'file-upload',
  templateUrl: "file-upload.component.html",
  styleUrls: ["file-upload.component.scss"]
})
export class FileUploadComponent {

  fileName = '';

  constructor(private uploadService: ModellerService, public dialog: MatDialog) {}

  onFileSelected(event) {

    const file:File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      const formData = new FormData();

      formData.append("language", file);
//error don't know how to transform the text from formdata to string
      try {
      const sformData = formData.get();
      }
      catch (error){
    console.log (error);
      }
      this.uploadService.uploadFromDesktop(formData);

    }
  }
}
*/

import { Component, OnInit } from '@angular/core';
import { FileUploadService } from './file-upload.service';
import {ModellerService} from '../../../../core/services/modeller/modeller.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  // Variable to store shortLink from api response
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  file: File = null; // Variable to store file
  service: ModellerService;
  // Inject service
  constructor(private fileUploadService: FileUploadService, private uploadService: ModellerService) { }

  ngOnInit(): void {
  }

  // On file Select
  onChange(event) {
    this.file = event.target.files[0];
  }

  // OnClick of button Upload
  onUpload() {
    this.loading = !this.loading;
    console.log(this.file);
    this.fileUploadService.upload(this.file).subscribe(
      (event: any) => {
        if (typeof (event) === 'object') {

          // Short link via api response
          this.shortLink = event.link;

          this.loading = false; // Flag variable
          this.uploadService.uploadFromDesktop(this.shortLink);
          console.log("Fine upload!")
          var x = document.getElementById('myDIV');
          x.style.display = 'block';
        }
      }
    );
  }
}
