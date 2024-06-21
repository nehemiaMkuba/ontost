export class GoJsCategoryBPMNNode {
  key: number;
  category: string;
  taskType?: number;
  isLoop?: boolean;
  isSubProcess?: boolean;
  isTransaction?: boolean;
  text?: string;
  item?: string;
  loc?: string;
  isGroup?: boolean;
  isSequential?: boolean;
  isAdHoc?: boolean;
  isCall?: boolean;

  eventType?: number;
  eventDimension?: number;

  gatewayType?: number;
}
