import {Component, Inject, SimpleChanges} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {RelationDatasource} from './RelationDatasource.model';
import {Relation} from '../../models/Relation.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {RelationEditorModel} from './RelationEditorModel';
import {ValueModel} from './ValueModel';
import {RelationOption} from '../../models/RelationOption.model';
import * as _ from 'lodash-es';
import {ModelElementDetail} from '../../models/ModelElementDetail.model';
import {ModelElementDetailAndModel} from '../../models/ModelElementDetailAndModel';

@Component({
  selector: 'model-element-detail',
  templateUrl: 'model-element-detail.html'
})
export class ModalViewElementDetail {

  displayedColumnsModelAttrs: string[] = ['key', 'value', 'actions'];
  hiddenValueOptions: string[] = [
    'modelingContainerContainsModelingLanguageConstruct',
    'modelingRelationHasSourceModelingElement',
    'modelingRelationHasTargetModelingElement'
  ];

  modelElementAttributeDatasource: RelationDatasource;

  options: RelationOption[];
  selectedOption: RelationOption;

  constructor(
    public dialogRef: MatDialogRef<ModalViewElementDetail>,
    private modellerService: ModellerService,
    @Inject(MAT_DIALOG_DATA) public data: ModelElementDetailAndModel) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.setupDatasources();
  }

  private setupDatasources() {
    this.prepareModelingLanguageElementAttributes();
  }

  private prepareModelingLanguageElementAttributes() {

    this.options = this.data.elementDetail.abstractElementAttributes.options.filter(opt => this.isAvailableInDetailsView(opt.relation));

    let promises: Promise<RelationEditorModel>[] = [];

    this.data.elementDetail.abstractElementAttributes
      .values.filter(value => {
        return this.isAvailableInDetailsView(value.relation);
      })
      .forEach(value => {
        let editor = new RelationEditorModel(value);
        let promise = this.modellerService.getOptionsForRelation(value.relationPrefix + ':' + value.relation)
          .then(response => {
            if (response.isPrimitive) {
              editor.isPrimitive = true;
              editor.primitiveTypeRange = response.primitiveTypeRange;
              editor.relation.value = editor.relation.value.split("^^")[0].replace('"', '').replace('"', '')
            } else {
              editor.selectorOptions = response.instances.concat(response.classes)
                .map(option => new ValueModel(option.split(':')[0], option.split(':')[1]));

              editor.selectedValue = new ValueModel(value.value.split(':')[0], value.value.split(':')[1]);
            }
            return editor;
          });

        promises.push(promise);
      });

    Promise.all(promises).then(promiseResult => {
      this.modelElementAttributeDatasource = new RelationDatasource(promiseResult);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setupDatasources();
  }

  save() {
    let tableValues = this.modelElementAttributeDatasource.data.getValue()
      .filter(tableValue => {
        return tableValue.selectedValue != undefined || (tableValue.relation != undefined && tableValue.relation.value != undefined);
      })
      .map(tableValue => {
        if (tableValue.selectedValue != undefined) {
          let rel = tableValue.relation;
          rel.value = tableValue.selectedValue.id + ':' + tableValue.selectedValue.value;
          return rel;
        } else {
          let rel = tableValue.relation;
          rel.value = '"' + tableValue.relation.value + '"^^' + tableValue.primitiveTypeRange;
          return rel;
        }
    });

    let notInTableValues = [];

    if (this.data.elementDetail.abstractElementAttributes.values !== undefined) {
      notInTableValues = this.data.elementDetail.abstractElementAttributes
        .values.filter(value => {
        return !this.isAvailableInDetailsView(value.relation);
      });
    }

    this.data.elementDetail.abstractElementAttributes.values = notInTableValues.concat(tableValues);
    this.modellerService.updateElement(this.data.elementDetail, this.data.modelId);

    this.dialogRef.close();
  }

  getElementDetailRelations(elementDetail: ModelElementDetail): RelationEditorModel[] {

    let relations: RelationEditorModel[] = [];

    let modelingLanguageConstructInstance = new Relation();
    modelingLanguageConstructInstance.relation = 'modelingLanguageConstructInstance';
    modelingLanguageConstructInstance.value = elementDetail.modelingLanguageConstructInstance;

    let paletteConstruct = new Relation();
    paletteConstruct.relation = 'paletteConstruct';
    paletteConstruct.value = elementDetail.paletteConstruct;

    relations.push(new RelationEditorModel(modelingLanguageConstructInstance));
    relations.push(new RelationEditorModel(paletteConstruct));

    return relations;
  }

  close() {
    this.dialogRef.close();
  }

  addRelation() {
    let rel = new Relation();
    rel.relation = this.selectedOption.relation;
    rel.relationPrefix = this.selectedOption.relationPrefix;
    let editor = new RelationEditorModel(rel);

    this.modellerService.getOptionsForRelation(rel.relationPrefix + ':' + rel.relation)
      .then(response => {

        if (response.isPrimitive) {
          editor.isPrimitive = true;
          editor.primitiveTypeRange = response.primitiveTypeRange;
        } else {
          editor.selectorOptions = response.instances.concat(response.classes).map(option => new ValueModel(option.split(':')[0], option.split(':')[1]));
        }
        let values = this.modelElementAttributeDatasource.data.getValue();
        values.push(editor);
        this.modelElementAttributeDatasource = new RelationDatasource(values)
      });
  }

  isAvailableInDetailsView(relation: string) {
    return !this.hiddenValueOptions.includes(relation);
  }

  compareModelValues(o1: ValueModel, o2: ValueModel) {
    return _.isEqual(o1, o2);
  }

  removeRelation(element: RelationEditorModel) {
    let values = this.modelElementAttributeDatasource.data.getValue();
    _.remove(values, value => {
      return _.isEqual(value, element);
    });

    this.modelElementAttributeDatasource = new RelationDatasource(values)
  }
}
