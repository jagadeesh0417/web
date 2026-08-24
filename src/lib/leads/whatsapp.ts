/**
 * Server-only WhatsApp Cloud API client.
 * Credentials must come from environment variables — never import this from client components.
 */

const DEFAULT_API_VERSION = "v21.0";
/** Business lead inbox number (digits only, no +). */
export const WHATSAPP_LEAD_NUMBER = "919848579053";

export interface WhatsAppSendResult {
  ok: boolean;
  status: "sent" | "failed" | "skipped";
  messageId?: string;
  error?: string;
}

function getConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || DEFAULT_API_VERSION;
  const recipient =
    process.env.WHATSAPP_LEAD_TO?.replace(/\D/g, "") || WHATSAPP_LEAD_NUMBER;

  return { phoneNumberId, accessToken, apiVersion, recipient };
}

export function isWhatsAppConfigured(): boolean {
  const { phoneNumberId, accessToken } = getConfig();
  return Boolean(phoneNumberId && accessToken);
}

/**
 * Send a free-form text message via Meta WhatsApp Cloud API.
 * Requires a 24h customer-care window OR an approved template for outbound-to-business use.
 * For business inbox notifications, configure a template and set WHATSAPP_TEMPLATE_NAME,
 * otherwise text messages are attempted (works when the recipient has messaged recently).
 */
export async function sendWhatsAppText(body: string): Promise<WhatsAppSendResult> {
  const { phoneNumberId, accessToken, apiVersion, recipient } = getConfig();

  if (!phoneNumberId || !accessToken) {
    console.info("[whatsapp] skipped — WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN not set");
    return {
      ok: false,
      status: "skipped",
      error: "WhatsApp API not configured",
    };
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en";

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  let payload: Record<string, unknown>;

  if (templateName) {
    // Template mode: put lead summary in body variable(s) — keep under template limits.
    const summary = body.length > 900 ? `${body.slice(0, 897)}…` : body;
    payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: summary }],
          },
        ],
      },
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { preview_url: false, body: body.slice(0, 4096) },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
      error?: { message?: string; code?: number };
    };

    if (!res.ok) {
      const errMsg = data?.error?.message || `WhatsApp API HTTP ${res.status}`;
      console.error("[whatsapp] send failed:", errMsg);
      return { ok: false, status: "failed", error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    return { ok: true, status: "sent", messageId };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Network error";
    console.error("[whatsapp] network error:", errMsg);
    return { ok: false, status: "failed", error: errMsg };
  }
}
