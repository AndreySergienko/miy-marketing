export interface AdvertisementModelAttrs {
  timestamp: number;
  timestampFinish: number;
  messageBotId?: number;
}

export interface IUpdateStatusById {
  statusId: number;
  slotId: number;
}
