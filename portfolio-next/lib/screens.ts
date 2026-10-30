import * as THREE from 'three';
import type { Project } from './content';

const W = 1280;
const H = 800;
const P = { bg: '#F1E8D2', ink: '#0A0A0A', warm: '#6B6050', line: '#CDBF9C', cream: '#E8DCC0' };
const FN = 'Helvetica, Arial, sans-serif';

type Ctx = CanvasRenderingContext2D;

function drawChart(g: Ctx) {
  g.fillStyle = P.warm;
  g.font = `400 18px ${FN}`;
  g.fillText('PÚBLICO PREVISTO — PRÓXIMO JOGO', 60, 130);
  g.fillStyle = P.ink;
  g.font = `300 120px ${FN}`;
  g.fillText('48.213', 60, 230);
  const h = [0.35, 0.5, 0.42, 0.6, 0.55, 0.7, 0.48, 0.66, 0.8, 0.62, 0.74, 0.9];
  h.forEach((v, i) => {
    g.fillStyle = i > 8 ? P.warm : P.ink;
    g.fillRect(60 + i * 72, 740 - v * 300, 44, v * 300);
  });
  g.strokeStyle = P.ink;
  g.lineWidth = 3;
  g.beginPath();
  h.forEach((v, i) => {
    const x = 82 + i * 72;
    const y = 710 - v * 300;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  });
  g.stroke();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = P.line;
    g.fillRect(960, 140 + i * 60, 260, 12);
    g.fillStyle = P.ink;
    g.fillRect(960, 140 + i * 60, 260 * (0.3 + ((i * 37) % 60) / 100), 12);
  }
}

function drawCalendar(g: Ctx) {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const cw = 170;
  const ch = 120;
  g.font = `400 16px ${FN}`;
  days.forEach((d, i) => {
    g.fillStyle = P.warm;
    g.fillText(d, 74 + i * cw, 120);
  });
  g.strokeStyle = P.line;
  g.lineWidth = 2;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      g.strokeRect(60 + c * cw, 150 + r * ch, cw, ch);
      g.fillStyle = P.warm;
      g.fillText(String(r * 7 + c + 1), 72 + c * cw, 174 + r * ch);
    }
  }
  // [linha, coluna, largura em dias]
  const events: [number, number, number][] = [[0, 1, 2], [1, 4, 2], [2, 0, 1], [2, 3, 3], [3, 5, 1], [4, 1, 2]];
  g.fillStyle = P.ink;
  events.forEach(([r, c, w]) => g.fillRect(70 + c * cw, 206 + r * ch, cw * w - 20, 38));
}

function drawList(g: Ctx) {
  const w = [380, 300, 440, 260, 360, 330, 420, 290];
  w.forEach((width, i) => {
    const y = 110 + i * 80;
    g.fillStyle = P.ink;
    g.fillRect(60, y + 8, 26, 26);
    g.fillRect(114, y + 8, width, 12);
    g.fillStyle = P.warm;
    g.fillRect(114, y + 28, width * 0.6, 8);
    g.fillStyle = P.line;
    g.fillRect(60, y + 62, 1160, 2);
    g.strokeStyle = P.ink;
    g.lineWidth = 2;
    g.strokeRect(1060, y + 6, 160, 32);
    if (i % 3 === 0) {
      g.fillStyle = P.ink;
      g.fillRect(1060, y + 6, 160, 32);
    }
  });
}

const MOCKS: Record<NonNullable<Project['mock']>, (g: Ctx) => void> = {
  chart: drawChart,
  calendar: drawCalendar,
  list: drawList,
};

/** Moldura de "janela" comum a todas as telas: barra preta com o título. */
function makeFrame(title: string) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  g.fillStyle = P.bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = P.ink;
  g.fillRect(0, 0, W, 64);
  g.fillStyle = P.cream;
  g.font = `600 20px ${FN}`;
  g.textBaseline = 'middle';
  g.fillText(title.toUpperCase(), 40, 33);
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.arc(1180 + i * 28, 32, 6, 0, 7);
    g.fill();
  }
  g.textBaseline = 'alphabetic';
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { canvas, g, texture };
}

/** Converte o print pra sépia: luminosidade vira um degradê tinta → creme. */
function paintSepia(img: HTMLImageElement, g: Ctx) {
  const w = W;
  const h = Math.round((img.height * w) / img.width);
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const og = off.getContext('2d')!;
  og.drawImage(img, 0, 0, w, h);
  const data = og.getImageData(0, 0, w, h);
  const a = data.data;
  for (let i = 0; i < a.length; i += 4) {
    const lum = Math.min(1, Math.pow((0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]) / 255, 0.75) * 1.2);
    a[i] = 10 + 231 * lum;
    a[i + 1] = 10 + 222 * lum;
    a[i + 2] = 10 + 200 * lum;
  }
  og.putImageData(data, 0, 0);
  g.drawImage(off, 0, 64 + Math.round((H - 64 - h) / 2));
}

export function createScreenTexture(project: Project): THREE.CanvasTexture {
  const { g, texture } = makeFrame(project.title);
  if (project.image) {
    const img = new Image();
    img.onload = () => {
      paintSepia(img, g);
      texture.needsUpdate = true;
    };
    img.src = project.image;
  } else if (project.mock) {
    MOCKS[project.mock](g);
  }
  return texture;
}
