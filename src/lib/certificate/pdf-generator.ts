import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import type { Certificate, CompanySettings } from "@/lib/types";

const W = 841.89;
const H = 595.28;

const NAVY = rgb(15 / 255, 23 / 255, 42 / 255);
const GOLD = rgb(180 / 255, 145 / 255, 50 / 255);
const GOLD_LIGHT = rgb(210 / 255, 185 / 255, 110 / 255);
const DARK = rgb(30 / 255, 30 / 255, 30 / 255);
const MUTED = rgb(100 / 255, 100 / 255, 100 / 255);
const WHITE = rgb(1, 1, 1);

function fit(text: string, font: PDFFont, size: number, max: number): string {
  const cw = font.widthOfTextAtSize("M", size);
  const n = Math.floor(max / cw);
  return text.length <= n ? text : text.slice(0, n - 1) + "…";
}

function center(text: string, font: PDFFont, size: number): number {
  return (W - font.widthOfTextAtSize(text, size)) / 2;
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

export async function generateCertificatePdf(
  cert: Certificate,
  company: CompanySettings,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  const page = doc.addPage([W, H]);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });

  // Outer gold border
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: GOLD, borderWidth: 1.5 });

  // Inner navy border
  page.drawRectangle({ x: 32, y: 32, width: W - 64, height: H - 64, borderColor: NAVY, borderWidth: 0.5 });

  // Top decorative gold line
  page.drawLine({ start: { x: W / 2 - 120, y: H - 70 }, end: { x: W / 2 + 120, y: H - 70 }, color: GOLD, thickness: 2 });

  // Company name
  const coName = fit(company.companyName || "Akradhii", helveticaBold, 16, 400);
  page.drawText(coName, { x: center(coName, helveticaBold, 16), y: H - 95, size: 16, font: helveticaBold, color: NAVY });

  // Tagline
  const tag = company.companyTagline || "Digital Growth Studio";
  page.drawText(tag, { x: center(tag, helvetica, 9), y: H - 110, size: 9, font: helvetica, color: MUTED });

  // Udyam
  if (company.udyamNumber) {
    const u = `Udyam Registration No.: ${company.udyamNumber}`;
    page.drawText(u, { x: center(u, helvetica, 7), y: H - 124, size: 7, font: helvetica, color: MUTED });
  }
  if (company.msmeInfo) {
    page.drawText(company.msmeInfo, { x: center(company.msmeInfo, helvetica, 7), y: H - 134, size: 7, font: helvetica, color: MUTED });
  }

  // Header separator
  page.drawLine({ start: { x: W / 2 - 180, y: H - 145 }, end: { x: W / 2 + 180, y: H - 145 }, color: GOLD_LIGHT, thickness: 0.5 });

  // Title
  const title = "CERTIFICATE OF COMPLETION";
  page.drawText(title, { x: center(title, timesBold, 28), y: H - 185, size: 28, font: timesBold, color: NAVY });

  // Title underline
  page.drawLine({ start: { x: W / 2 - 100, y: H - 195 }, end: { x: W / 2 + 100, y: H - 195 }, color: GOLD, thickness: 1 });

  // Presented to
  const presented = "This certificate is proudly presented to";
  page.drawText(presented, { x: center(presented, timesItalic, 11), y: H - 225, size: 11, font: timesItalic, color: MUTED });

  // Recipient name (largest text on certificate)
  const name = fit(cert.studentName.toUpperCase(), helveticaBold, 32, 600);
  const nameW = helveticaBold.widthOfTextAtSize(name, 32);
  page.drawText(name, { x: (W - nameW) / 2, y: H - 270, size: 32, font: helveticaBold, color: NAVY });

  // Name underline
  page.drawLine({ start: { x: (W - nameW) / 2 - 20, y: H - 278 }, end: { x: (W - nameW) / 2 + nameW + 20, y: H - 278 }, color: GOLD, thickness: 1.5 });

  // "for successfully completing the"
  const forText = "for successfully completing the";
  page.drawText(forText, { x: center(forText, timesItalic, 10), y: H - 305, size: 10, font: timesItalic, color: MUTED });

  // Course name
  const course = fit(`${cert.programTitle} in ${cert.categoryName}`, helveticaBold, 14, 600);
  page.drawText(course, { x: center(course, helveticaBold, 14), y: H - 330, size: 14, font: helveticaBold, color: DARK });

  // "and successfully passing the assessment conducted by"
  const byText = "and successfully passing the assessment conducted by";
  page.drawText(byText, { x: center(byText, timesItalic, 10), y: H - 355, size: 10, font: timesItalic, color: MUTED });

  // Company name below
  const coBelow = fit(company.companyName || "Akradhii", helveticaBold, 12, 400);
  page.drawText(coBelow, { x: center(coBelow, helveticaBold, 12), y: H - 375, size: 12, font: helveticaBold, color: NAVY });

  // ─── Information row ─────────────────────────────────────────────────
  const infoY = H - 420;
  const colW = 180;
  const c1 = W / 2 - 270;
  const c2 = W / 2 - 90;
  const c3 = W / 2 + 90;
  const c4 = W / 2 + 270;

  const drawCol = (x: number, label: string, value: string) => {
    const lw = helvetica.widthOfTextAtSize(label, 7);
    page.drawText(label, { x: x - lw / 2, y: infoY, size: 7, font: helvetica, color: MUTED });
    const v = fit(value, helveticaBold, 11, colW - 10);
    const vw = helveticaBold.widthOfTextAtSize(v, 11);
    page.drawText(v, { x: x - vw / 2, y: infoY - 16, size: 11, font: helveticaBold, color: DARK });
  };

  drawCol(c1, "COURSE", cert.categoryName);
  drawCol(c2, "ASSESSMENT SCORE", `${cert.score}%`);
  drawCol(c3, "COMPLETION DATE", formatDate(cert.endDate));
  drawCol(c4, "CERTIFICATE ID", cert.certificateId);

  // Separator
  page.drawLine({ start: { x: c1 - 60, y: infoY - 35 }, end: { x: c4 + 60, y: infoY - 35 }, color: GOLD_LIGHT, thickness: 0.5 });

  // ─── Bottom section ──────────────────────────────────────────────────
  const botY = infoY - 60;

  // Left: Certificate ID
  const cidLabel = "CERTIFICATE ID";
  page.drawText(cidLabel, { x: c1 - 30 - helvetica.widthOfTextAtSize(cidLabel, 7) / 2, y: botY, size: 7, font: helvetica, color: MUTED });
  const cidW = helveticaBold.widthOfTextAtSize(cert.certificateId, 9);
  page.drawText(cert.certificateId, { x: c1 - 30 - cidW / 2, y: botY - 14, size: 9, font: helveticaBold, color: DARK });

  // Center: Authorized Signatory
  const sigName = company.authorizedSignatoryName || "Akradhii";
  const sigDesig = company.authorizedSignatoryDesignation || "Director";
  page.drawLine({ start: { x: W / 2 - 60, y: botY - 10 }, end: { x: W / 2 + 60, y: botY - 10 }, color: DARK, thickness: 0.5 });
  page.drawText(sigName, { x: center(sigName, helveticaBold, 10), y: botY - 24, size: 10, font: helveticaBold, color: DARK });
  page.drawText(sigDesig, { x: center(sigDesig, helvetica, 8), y: botY - 36, size: 8, font: helvetica, color: MUTED });

  // Right: QR code label
  const qrLabel = "Scan to verify";
  page.drawText(qrLabel, { x: c4 + 30 - helvetica.widthOfTextAtSize(qrLabel, 7) / 2, y: botY, size: 7, font: helvetica, color: MUTED });

  // QR code
  try {
    const verifyUrl = `${company.websiteUrl || "https://akradhii.vercel.app"}/verify?cert=${cert.certificateId}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 120, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
    const qrImage = await doc.embedPng(qrBuffer);
    page.drawImage(qrImage, { x: c4 - 20, y: botY - 90, width: 72, height: 72 });
  } catch {
    // QR generation failed — continue without QR
  }

  // Footer
  const footer = `Verify at ${company.websiteUrl || "https://akradhii.vercel.app"}/verify · Issued by ${company.companyName || "Akradhii"}`;
  page.drawText(footer, { x: center(footer, helvetica, 7), y: 40, size: 7, font: helvetica, color: MUTED });

  return doc.save();
}
