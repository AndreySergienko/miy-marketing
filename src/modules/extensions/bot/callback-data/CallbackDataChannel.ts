export class CallbackDataChannel {
  static get ACCEPT_HANDLER() {
    return 'accept';
  }

  static get CANCEL_HANDLER() {
    return 'cancel';
  }

  static get CHANGE_DESCRIPTION_HANDLER() {
    return 'changeDescription';
  }

  static ACCEPT(channelId: number) {
    return `accept:${channelId}`;
  }

  static CANCEL(channelId: number) {
    return `cancel:${channelId}`;
  }

  static CHANGE_DESCRIPTION(channelId: number) {
    return `changeDescription:${channelId}`;
  }
}
