import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = process.env.GMAIL_FROM || "Kabar Sayap <no-reply@kabarsayap.app>";

function canSend() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export async function sendSentEmail(
  to: string,
  birdName: string,
  receiverName: string,
  etaText: string,
) {
  if (!canSend()) return;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `🐦 Pesanmu sedang terbang menuju ${receiverName}`,
    html: `<p>Burung <b>${birdName}</b> sudah membawa pesanmu untuk <b>${receiverName}</b>.</p>
           <p>Perkiraan tiba: <b>${etaText}</b>.</p>`,
  });
}

export async function sendDeliveredEmail(
  to: string,
  birdName: string,
  senderName: string,
) {
  if (!canSend()) return;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `🐦 Pesan dari ${senderName} sudah tiba!`,
    html: `<p>Burung <b>${birdName}</b> berhasil mengantarkan pesan dari <b>${senderName}</b>.</p>`,
  });
}

export async function sendLostEmail(
  to: string,
  birdName: string,
  receiverName: string,
) {
  if (!canSend()) return;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `💔 Burung ${birdName} tidak sampai tujuan`,
    html: `<p>Sayang sekali, <b>${birdName}</b> yang membawa pesanmu untuk <b>${receiverName}</b> tidak berhasil tiba.</p>`,
  });
}
