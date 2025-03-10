import * as TelegramBot from 'node-telegram-bot-api';

// bot: TelegramBot;

function connect(token: string) {
  if (!global.bot) {
    global.bot = new TelegramBot(token, {
      polling: true,
    });
  }
  return global.bot;
}

export { connect };
