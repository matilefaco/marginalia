export interface ShareCardOptions {
  type: "post" | "citation_light" | "citation_dark" | "reader_identity";
  excerpt?: string;
  commentary?: string;
  bookTitle?: string;
  author?: string;
  username?: string;
  reactionCount?: number;
  topReactions?: Array<{ emoji: string; count: number }>;
  archetype?: string;
  readingSignature?: string;
  format?: "story" | "feed";
}

export async function generateShareCard(options: ShareCardOptions): Promise<Blob> {
  const isStory = options.format !== "feed";
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  await document.fonts.load("italic 300 48px 'Cormorant Garamond'");
  await document.fonts.load("300 28px 'Jost'");
  await document.fonts.load("500 28px 'Jost'");

  if (options.type === "citation_dark") {
    await drawCitationDark(ctx, width, height, options);
  } else if (options.type === "reader_identity") {
    await drawReaderIdentity(ctx, width, height, options);
  } else if (options.type === "post") {
    await drawPostCard(ctx, width, height, options);
  } else {
    await drawCitationLight(ctx, width, height, options);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 0.95);
  });
}

// ─── CITAÇÃO LIGHT ────────────────────────────────────────────

async function drawCitationLight(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#FAF8F3";
  roundRect(ctx, 0, 0, w, h, 48);
  ctx.fill();

  ctx.fillStyle = "rgba(174, 143, 125, 0.08)";
  for (let x = 40; x < w; x += 32) {
    for (let y = 40; y < h; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#AE8F7D";
  ctx.font = "300 26px 'Jost'";
  ctx.letterSpacing = "4px";
  fillTextWrapped(ctx, "• CITAÇÃO FAVORITA", 80, 100, w - 160, 40);

  ctx.fillStyle = "#AE8F7D";
  ctx.font = "italic 300 32px 'Cormorant Garamond'";
  ctx.textAlign = "right";
  ctx.fillText("marginalia", w - 80, 100);
  ctx.textAlign = "left";

  ctx.fillStyle = "#D4CBB8";
  ctx.font = "italic 300 120px 'Cormorant Garamond'";
  ctx.fillText("\u201C", 80, 280);

  ctx.fillStyle = "#1E1C19";
  ctx.font = "italic 300 52px 'Cormorant Garamond'";
  ctx.letterSpacing = "0px";
  const excerptY = fillTextWrapped(ctx, opts.excerpt ?? "", 80, 340, w - 160, 72);

  if (opts.bookTitle) {
    ctx.fillStyle = "#7A726A";
    ctx.font = "300 30px 'Jost'";
    ctx.letterSpacing = "0px";
    ctx.fillText(`— ${opts.bookTitle}`, 80, excerptY + 60);
    if (opts.author) {
      ctx.fillStyle = "#9C948C";
      ctx.font = "300 26px 'Jost'";
      ctx.letterSpacing = "2px";
      ctx.fillText(opts.author.toUpperCase(), 80, excerptY + 104);
    }
  }

  ctx.strokeStyle = "#D4CBB8";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(80, h - 180);
  ctx.lineTo(w - 80, h - 180);
  ctx.stroke();
  ctx.setLineDash([]);

  drawFooter(ctx, w, h, opts, "light");
}

// ─── CITAÇÃO DARK ─────────────────────────────────────────────

async function drawCitationDark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#1E1C19";
  roundRect(ctx, 0, 0, w, h, 48);
  ctx.fill();

  ctx.fillStyle = "rgba(250, 248, 243, 0.03)";
  for (let x = 40; x < w; x += 32) {
    for (let y = 40; y < h; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#697962";
  ctx.beginPath();
  ctx.moveTo(w - 80, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, 80);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#9C948C";
  ctx.font = "300 26px 'Jost'";
  ctx.letterSpacing = "4px";
  fillTextWrapped(ctx, "• CITAÇÃO FAVORITA", 80, 100, w - 160, 40);

  ctx.fillStyle = "#9C948C";
  ctx.font = "italic 300 32px 'Cormorant Garamond'";
  ctx.textAlign = "right";
  ctx.fillText("marginalia", w - 80, 100);
  ctx.textAlign = "left";

  ctx.fillStyle = "#3D3830";
  ctx.font = "italic 300 120px 'Cormorant Garamond'";
  ctx.fillText("\u201C", 80, 280);

  ctx.fillStyle = "#E8E2D6";
  ctx.font = "italic 300 52px 'Cormorant Garamond'";
  ctx.letterSpacing = "0px";
  const excerptY = fillTextWrapped(ctx, opts.excerpt ?? "", 80, 340, w - 160, 72);

  if (opts.bookTitle) {
    ctx.fillStyle = "#9C948C";
    ctx.font = "300 30px 'Jost'";
    ctx.letterSpacing = "0px";
    ctx.fillText(`— ${opts.bookTitle}`, 80, excerptY + 60);
    if (opts.author) {
      ctx.fillStyle = "#7A726A";
      ctx.font = "300 26px 'Jost'";
      ctx.letterSpacing = "2px";
      ctx.fillText(opts.author.toUpperCase(), 80, excerptY + 104);
    }
  }

  ctx.strokeStyle = "#3D3830";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(80, h - 180);
  ctx.lineTo(w - 80, h - 180);
  ctx.stroke();
  ctx.setLineDash([]);

  drawFooter(ctx, w, h, opts, "dark");
}

// ─── IDENTIDADE DE LEITURA ────────────────────────────────────

async function drawReaderIdentity(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#2C2A27";
  roundRect(ctx, 0, 0, w, h, 48);
  ctx.fill();

  ctx.fillStyle = "#697962";
  ctx.beginPath();
  ctx.moveTo(w - 80, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, 80);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#9C948C";
  ctx.font = "300 26px 'Jost'";
  ctx.letterSpacing = "3px";
  ctx.fillText("IMPRESSÃO DE LEITURA", 80, 120);

  ctx.fillStyle = "#E8E2D6";
  ctx.font = "italic 300 88px 'Cormorant Garamond'";
  ctx.letterSpacing = "0px";
  const archetypeY = fillTextWrapped(ctx, opts.archetype ?? "Leitor em formação", 80, 240, w - 160, 100);

  ctx.strokeStyle = "#3D3830";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, archetypeY + 60);
  ctx.lineTo(w - 80, archetypeY + 60);
  ctx.stroke();

  ctx.fillStyle = "#7A726A";
  ctx.font = "300 24px 'Jost'";
  ctx.letterSpacing = "3px";
  ctx.fillText("ASSINATURA DE LEITURA", 80, archetypeY + 120);

  ctx.fillStyle = "#C4B8AC";
  ctx.font = "italic 300 44px 'Cormorant Garamond'";
  ctx.letterSpacing = "0px";
  fillTextWrapped(
    ctx,
    `"${opts.readingSignature ?? "Cada livro me deixa diferente"}"`,
    80,
    archetypeY + 174,
    w - 160,
    56
  );

  ctx.fillStyle = "#7A726A";
  ctx.font = "italic 300 32px 'Cormorant Garamond'";
  ctx.textAlign = "center";
  ctx.fillText("marginalia.replit.app", w / 2, h - 80);
  ctx.textAlign = "left";
}

// ─── CARD DE POST ─────────────────────────────────────────────

async function drawPostCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#FAF8F3";
  roundRect(ctx, 0, 0, w, h, 48);
  ctx.fill();

  ctx.fillStyle = "#697962";
  roundRect(ctx, 80, 100, 6, h - 280, 3);
  ctx.fill();

  ctx.fillStyle = "#1E1C19";
  ctx.font = "300 48px 'Jost'";
  ctx.letterSpacing = "0px";
  const commentY = fillTextWrapped(ctx, opts.commentary ?? opts.excerpt ?? "", 116, 140, w - 200, 64);

  ctx.strokeStyle = "#D4CBB8";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(80, h - 180);
  ctx.lineTo(w - 80, h - 180);
  ctx.stroke();
  ctx.setLineDash([]);

  void commentY;
  drawFooter(ctx, w, h, opts, "light");
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────

function fillTextWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: ShareCardOptions,
  theme: "light" | "dark"
) {
  const isDark = theme === "dark";
  const footerY = h - 140;

  ctx.fillStyle = isDark ? "#3D3830" : "#EBE6DB";
  ctx.beginPath();
  ctx.arc(112, footerY, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isDark ? "#9C948C" : "#697962";
  ctx.font = "500 32px 'Jost'";
  ctx.textAlign = "center";
  const initials = (opts.username ?? "MG").slice(0, 2).toUpperCase();
  ctx.fillText(initials, 112, footerY + 11);
  ctx.textAlign = "left";

  ctx.fillStyle = isDark ? "#E8E2D6" : "#1E1C19";
  ctx.font = "500 30px 'Jost'";
  ctx.letterSpacing = "0px";
  ctx.fillText(`@${opts.username ?? "usuario"}`, 172, footerY + 4);

  if (opts.topReactions && opts.topReactions.length > 0) {
    let reactionX = 172;
    const reactionY = footerY + 44;
    for (const r of opts.topReactions.slice(0, 3)) {
      ctx.font = "28px serif";
      ctx.fillText(r.emoji, reactionX, reactionY);
      ctx.fillStyle = isDark ? "#9C948C" : "#7A726A";
      ctx.font = "300 26px 'Jost'";
      ctx.letterSpacing = "0px";
      ctx.fillText(String(r.count), reactionX + 38, reactionY);
      reactionX += 100;
    }
  }

  ctx.fillStyle = isDark ? "#7A726A" : "#9C948C";
  ctx.font = "italic 300 28px 'Cormorant Garamond'";
  ctx.textAlign = "right";
  ctx.fillText("marginalia", w - 80, footerY + 4);
  ctx.textAlign = "left";
}
