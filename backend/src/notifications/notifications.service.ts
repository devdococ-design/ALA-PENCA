import { Injectable, Logger } from '@nestjs/common';

type OrderNotification = {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  plantIssue: string;
  preferredDate: string;
  notes?: string | null;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private get enabled(): boolean {
    // Disabled until Twilio WhatsApp is configured later.
    return process.env.NOTIFY_ENABLED === 'true';
  }

  private get contactPhones(): string[] {
    const raw = process.env.NOTIFY_PHONES ?? '+525580225475,+525539286932';
    return raw
      .split(',')
      .map((phone) => phone.trim())
      .filter(Boolean);
  }

  async notifyNewOrder(order: OrderNotification): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message = this.buildMessage(order);
    const results = await Promise.allSettled(
      this.contactPhones.map((phone) => this.sendWhatsApp(phone, message)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to notify ${this.contactPhones[index]}: ${String(result.reason)}`,
        );
      }
    });
  }

  private buildMessage(order: OrderNotification): string {
    const lines = [
      `🛒 Nuevo pedido #${order.id}`,
      `Cliente: ${order.customerName}`,
      `Tel: ${order.phone}`,
    ];

    if (order.email?.trim()) {
      lines.push(`Correo: ${order.email.trim()}`);
    }

    lines.push(`Pedido: ${order.plantIssue}`, `Fecha/hora: ${order.preferredDate}`);

    if (order.notes?.trim()) {
      lines.push(`Notas: ${order.notes.trim()}`);
    }

    return lines.join('\n');
  }

  private toWhatsAppAddress(phone: string): string {
    return phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
  }

  private async sendWhatsApp(to: string, body: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromRaw = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !fromRaw) {
      if (process.env.NOTIFY_LOG_ONLY === 'true') {
        this.logger.log(`[WHATSAPP] To ${to}\n${body}`);
        return;
      }

      this.logger.warn('Twilio WhatsApp is not configured; notification skipped');
      return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: this.toWhatsAppAddress(to),
        From: this.toWhatsAppAddress(fromRaw),
        Body: body,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Twilio WhatsApp error ${response.status}: ${detail}`);
    }
  }
}
