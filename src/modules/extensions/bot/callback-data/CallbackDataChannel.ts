export class CallbackDataChannel {
  static get ACCEPT_HANDLER() {
    return 'accept';
  }

  static get CANCEL_HANDLER() {
    return 'cancel';
  }

  static get CANCEL_REASON_HANDLER() {
    return 'cancelReason';
  }

  static get VALIDATE_MESSAGE_HANDLER() {
    return 'validate';
  }

  static get CONFIRM_SEND_MESSAGE_HANDLER() {
    return 'confirmSendMessage';
  }

  static get CHANGE_SEND_MESSAGE_HANDLER() {
    return 'change';
  }

  static get ACCEPT_MESSAGE_HANDLER() {
    return 'acceptMessage';
  }

  static get CANCEL_MESSAGE_HANDLER() {
    return 'cancelMessage';
  }

  static get CANCEL_REASON_MESSAGE_HANDLER() {
    return 'cancelReasonMessage';
  }

  static ACCEPT_MESSAGE(slotId: number) {
    return `${CallbackDataChannel.ACCEPT_MESSAGE_HANDLER}:${slotId}`;
  }

  static CANCEL_MESSAGE(slotId: number) {
    return `${CallbackDataChannel.CANCEL_MESSAGE_HANDLER}:${slotId}`;
  }

  static CANCEL_REASON_MESSAGE(slotId: number) {
    return `${CallbackDataChannel.CANCEL_REASON_MESSAGE_HANDLER}:${slotId}`;
  }

  static CHANGE_SEND_MESSAGE(slotId: number) {
    return `${CallbackDataChannel.CHANGE_SEND_MESSAGE_HANDLER}:${slotId}`;
  }

  static CONFIRM_SEND_MESSAGE(slotId: number) {
    return `${CallbackDataChannel.CONFIRM_SEND_MESSAGE_HANDLER}: ${slotId}`;
  }

  static CANCEL_REASON(channelId: number) {
    return `${CallbackDataChannel.CANCEL_REASON_HANDLER}:${channelId}`;
  }

  static ACCEPT(channelId: number) {
    return `${CallbackDataChannel.ACCEPT_HANDLER}:${channelId}`;
  }

  static CANCEL(channelId: number) {
    return `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`;
  }
}
