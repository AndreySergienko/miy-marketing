export interface SlotsModelAttrs {
  timestamp: number;
  timestampFinish: number;
  messageBotId?: number;
}

export interface IUpdateSlotStatusById {
  statusId: number;
  slotId: number;
}
