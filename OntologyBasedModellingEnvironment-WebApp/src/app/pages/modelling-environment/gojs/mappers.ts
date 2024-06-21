import {GoJsCategoryBPMNNode} from '../models/GoJsCategoryBPMNNode';
import {GoJsCategoryBPMNGroup} from '../models/GoJsCategoryBPMNGroup';

export class Mappers {
  static dictionaryAOAMEBPMNElementToGoJsNode = new Map<string, GoJsCategoryBPMNNode>()
    // --------------------- ACTIVITY --------------------- //
    .set('Task', { key: 131, category: 'activity', text: 'Task', item: 'generic task', taskType: 0 })
    .set('ServiceTask', { key: 206, category: 'activity', taskType: 6, isLoop: true, isSubProcess: true, isTransaction: true, text: 'Service', item: 'service task' })
    .set('SubProcess', { key: 134, category: 'subprocess', loc: '0 0', text: 'Subprocess', isGroup: true, isSubProcess: true, taskType: 0 })
    .set('Activity', { key: 0, category: 'activity', text: '', item: '', taskType: 0 })
    .set('ScriptTask', { key: 204, category: 'activity', taskType: 4, isSequential: true, text: 'Script', item: 'Script Task' })
    .set('ReceiveTask', { key: 1, category: 'activity', taskType: 1, text: 'Receive Task', item: 'Receive Task' })
    .set('ManualTask', { key: 203, category: 'activity', taskType: 3, isAdHoc: true, text: 'Manual', item: 'Manual Task' })
    .set('SendTask', { key: 2, category: 'activity', taskType: 5, text: 'Send Task', item: 'Send Task' })
    .set('BusinessRuleTask', { key: 3, category: 'activity', taskType: 7, text: 'Business\nRule Task', item: 'Business Rule Task' })
    .set('UserTask', { key: 4, category: 'activity', taskType: 2, text: 'User Task', item: 'User Task', isCall: true })
    // --------------------- DATASTORE --------------------- //
    .set('DataStore', { key: 302, category: 'datastore', text: 'Data\nStorage' })
    .set('DataObject', { key: 301, category: 'dataobject', text: 'Data\nObject' })
    // don't exist in current example code
    .set('DataInput', { key: 303, category: 'dataobject', text: 'Data\nInput' })
    .set('DataOutput', { key: 304, category: 'dataobject', text: 'Data\nOutput' })
    // end of don't exist
    // --------------------- EVENT --------------------- //
    .set('TerminateEndEvent', { key: 108, category: 'event', text: 'Terminate', eventType: 13, eventDimension: 8, item: 'Terminate' })
    .set('TimerIntermediateEvent', { key: 507, category: 'event', eventType: 3, eventDimension: 4, text: 'Catch\nTimer', item: '' })
    // don't exist in current example code
    // .set('IntermediateEvent', { key: 500, category: 'event', eventDimension: 4, text: 'Catch\nTimer', item: '' })
    // end of don't exist
    .set('Event', { key: 101, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start' })
    // tslint:disable-next-line:max-line-length
    .set('MessageIntermediateEvent', { key: 504, category: 'event', eventType: 2, eventDimension: 4, text: 'Catch\nMessage', item: 'Message' })
    .set('EndEvent', { key: 104, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'End' })
    .set('MessageEndEvent', { key: 107, category: 'event', text: 'Message', eventType: 2, eventDimension: 8, item: 'Message' })
    .set('TimerStartEvent', { key: 103, category: 'event', text: 'Timer', eventType: 3, eventDimension: 3, item: 'Timer' })
    .set('StartEvent', { key: 101, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start' })
    .set('MessageStartEvent', { key: 102, category: 'event', text: 'Message', eventType: 2, eventDimension: 2, item: 'Message' })
    // --------------------- GATEWAY --------------------- //
    // don't exist in current example code
    .set('Gateway', { key: 200, category: 'gateway', text: 'Gateway', gatewayType: 0 })
    // end of don't exist
    .set('ExclusiveGateway', { key: 204, category: 'gateway', text: 'Exclusive', gatewayType: 4 })
    .set('ParallelGateway', { key: 201, category: 'gateway', text: 'Parallel', gatewayType: 1 })
    .set('EventBasedGateway', { key: 302, category: 'gateway', gatewayType: 5, text: 'Event\nGateway' })
    .set('InclusiveGateway', { key: 301, category: 'gateway', gatewayType: 2, text: 'Inclusive' })
  ;

  static dictionaryAOAMEBPMNGroupToGoJsGroup = new Map<string, GoJsCategoryBPMNGroup>()
    // --------------------- POOLS AND LANES --------------------- //
    // don't exist in current example code
    // .set('Group', { key: 600, text: 'Pool 1', isGroup: true, category: 'Pool' })
    // end of don't exist
    .set('Pool', { key: 601, text: 'Pool 1', isGroup: true, category: 'Pool' })
    .set('Lane', { key: 602, text: 'Lane 1', isGroup: true, group: 601, color: 'lightyellow', category: 'Lane' })
  ;


  static dictionaryGoJsAOAMELinkIdToLinkCategory = new Map<string, string>()
    .set('SequenceFlow', '')
    .set('Association', 'data')
    .set('MessageFlow', 'msg')
    // TODO currently there is no map for associations with the category data
    .set('Annotation', 'annotation');
}

