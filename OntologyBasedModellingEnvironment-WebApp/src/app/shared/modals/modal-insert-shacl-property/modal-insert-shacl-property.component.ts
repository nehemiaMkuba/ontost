import {Component, OnInit, Output, EventEmitter, Inject} from '@angular/core';
import {ShaclConstraintModel} from '../../models/ShaclConstraint.model';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {PaletteElementModel} from '../../models/PaletteElement.model';
import {ModalCreateDomainElementsComponent} from '../modal-create-domain-elements/modal-create-domain-elements.component';
import {unescapeIdentifier} from '@angular/compiler';
import {UUID} from 'angular2-uuid';

@Component({
  selector: 'app-modal-insert-shacl-property',
  templateUrl: './modal-insert-shacl-property.component.html',
  styleUrls: ['./modal-insert-shacl-property.component.css']
})

export class ModalInsertShaclPropertyComponent implements OnInit {

  @Output() newConstraintAdded = new EventEmitter();
  public shaclConstraint: ShaclConstraintModel;
  public domainName: string;
  step = 0;
  public config: any;
  patternError: string;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any,
               public mService: ModellerService,
               public dialogRef: MatDialogRef<ModalInsertShaclPropertyComponent>,
               public dialog: MatDialog) { }

  ngOnInit(): void {
    this.shaclConstraint = new ShaclConstraintModel();
    // Extract the domain name from the palette element
    const domainNameArr = this.data.paletteElement.representedLanguageClass.split('#');
    const prefix = this.data.paletteElement.languagePrefix;
    if (domainNameArr[1] !== undefined) this.domainName = prefix + ':' + domainNameArr[1];
    else this.domainName = domainNameArr[0];
    this.mService.queryAllProperties(this.domainName);

    this.config = {
      displayKey: 'label',
      search: true,
      height: '200px',
      placeholder: 'Select a Path',
      limitTo: 10000,
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search'
    };
  }
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  selectionChanged(event) {
    console.log(event);
    if(!(event.value === null || event.value === undefined)) {
      this.shaclConstraint.path = event.value.id;
    }
  }

  openCreateDomainElementModalFromExtend(element: PaletteElementModel) {

    const dialogRef = this.dialog.open(ModalCreateDomainElementsComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef.componentInstance.newDomainElementAdded.subscribe(() => {
      this.mService.queryDomainClasses();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  insertNewShaclConstraint() {
     //Make sure the id is unique
    this.shaclConstraint.id = (this.shaclConstraint.name + '_' + UUID.UUID()).replace(new RegExp(' ', 'g'), '_');
    this.shaclConstraint.targetClass = this.data.paletteElement.representedLanguageClass;
    console.log(this.shaclConstraint);
    this.mService.createNewShaclConstraint(JSON.stringify(this.shaclConstraint)).subscribe(
      (response) => {
        console.log(response);
        this.newConstraintAdded.emit(this.shaclConstraint);
        this.dialogRef.close('Cancel');
      }
    );
  }

  onPatternChange() {
    if (this.shaclConstraint.pattern && this.shaclConstraint.pattern.length > 0) {
      try {
        new RegExp(this.shaclConstraint.pattern);
        this.patternError = 'Valid regex pattern!';
      } catch (e) {
        this.patternError = 'Invalid regex pattern!';
      }
    } else {
      this.patternError = 'Input is empty';
    }
  }

}
