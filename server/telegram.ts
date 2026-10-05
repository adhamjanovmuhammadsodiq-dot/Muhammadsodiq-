import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'BilimArenaBot';

export interface TelegramSendMessageResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export class TelegramService {
  public static getBotUsername(): string {
    return BOT_USERNAME;
  }

  public static isConfigured(): boolean {
    return Boolean(BOT_TOKEN && BOT_TOKEN.includes(':'));
  }

  public static getDeepLink(authRequestId: string): string {
    return `https://t.me/${BOT_USERNAME}?start=auth_${authRequestId}`;
  }

  public static async sendMessage(chatId: string | number, text: string): Promise<TelegramSendMessageResponse> {
    if (!this.isConfigured()) {
      return { ok: false, description: 'Telegram Bot Token belgilanmagan (.env da TELEGRAM_BOT_TOKEN)' };
    }

    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      const data = await res.json() as TelegramSendMessageResponse;
      return data;
    } catch (err: any) {
      console.error('[TelegramService] Xabar yuborishda xatolik:', err);
      return { ok: false, description: err.message || 'Telegram serveriga ulanishda xatolik' };
    }
  }

  public static formatOtpMessage(name: string, code: string, minutes: number = 5): string {
    return `👋 Assalomu alaykum, <b>${name}</b>!\n\n` +
      `🔐 <b>Bilim Arena</b> platformasiga kirish uchun bir martalik tasdiqlash kodingiz:\n\n` +
      `<code>${code}</code>\n\n` +
      `⏳ Ushbu kod <b>${minutes} daqiqa</b> davomida amal qiladi.\n` +
      `⚠️ Xavfsizlik yuzasidan ushbu kodni hech kimga bermang!`;
  }
}
