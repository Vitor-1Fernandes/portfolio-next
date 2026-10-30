
'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { PagerState } from '@/hooks/usePager';
import { projects, scenes } from '@/lib/content';
import { createScreenTexture } from '@/lib/screens';

const BEAM_LEN = 8;
const BEAM_RADIUS = 2;

const BEAM_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vT; uniform float uH;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vT = -position.y / uH;
    gl_Position = projectionMatrix * mv;
  }`;

const BEAM_FRAG = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vT; uniform float uO; uniform vec3 uC;
  void main() {
    float e = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
    float a = e * pow(1. - vT, .7) * smoothstep(0., .04, vT) * uO;
    gl_FragColor = vec4(uC, a);
  }`;

// Cabeçalho dos vídeos
function createVideoHeader(title: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 64;

  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, 1280, 64);

  ctx.fillStyle = '#E8DCC0';
  ctx.font = '600 20px Helvetica, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.toUpperCase(), 40, 33);

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(1180 + i * 28, 32, 6, 0, 7);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export default function Scene3D({
  pager,
}: {
  pager: MutableRefObject<PagerState>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch {
      return;
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.z = 7;

    const N = scenes.length;

    const objX = scenes.map((s) =>
      s.side === 'left' ? 0.5 : -0.5
    );

    const projOf = scenes.map((s) => s.project ?? -1);

    // ---- MÍDIAS ----

    const textures = projects.map(createScreenTexture);
    textures.forEach((texture) => renderer.initTexture(texture));

    // Elementos de vídeo
    const videos = projects.map((project) => {
      if (!project.video) return null;

      const video = document.createElement('video');

      video.src = project.video;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';

      return video;
    });

    const videoTextures = videos.map((video) => {
      if (!video) return null;

      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      return texture;
    });

    const videoHeaders = projects.map((project) =>
      project.video
        ? createVideoHeader(project.title)
        : null
    );

    // ---- MATERIAIS ----

    const faceMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: textures[0],
    });

    const videoMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const headerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const planeGeo = new THREE.PlaneGeometry(3.4, 2.2);
    const faceGeo = new THREE.PlaneGeometry(3.2, 2);

    const videoGeo = new THREE.PlaneGeometry(3.2, 1.84);
    const headerGeo = new THREE.PlaneGeometry(3.2, 0.16);

    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.14,
    });

    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
    });

    // ---- TELA ----

    const shadow = new THREE.Mesh(planeGeo, shadowMat);
    shadow.position.set(0.14, -0.14, -0.08);

    const frame = new THREE.Mesh(planeGeo, frameMat);
    frame.position.z = -0.01;

    const faceMesh = new THREE.Mesh(faceGeo, faceMat);

    const videoMesh = new THREE.Mesh(videoGeo, videoMat);
    videoMesh.position.set(0, -0.08, 0.002);
    videoMesh.visible = false;

    const headerMesh = new THREE.Mesh(headerGeo, headerMat);
    headerMesh.position.set(0, 0.92, 0.003);
    headerMesh.visible = false;

    const screen = new THREE.Group();

    screen.add(
      shadow,
      frame,
      faceMesh,
      videoMesh,
      headerMesh
    );

    scene.add(screen);
    screen.visible = false;

    // ---- CONTROLE DE REPRODUÇÃO ----

    let shown = -2;

    const selectProject = (index: number) => {
      if (index === shown) return;

      shown = index;

      // Pausa todos os vídeos anteriores
      videos.forEach((video) => {
        if (video) video.pause();
      });

      const isVideo =
        index >= 0 && !!projects[index]?.video;

      faceMesh.visible = !isVideo;
      videoMesh.visible = isVideo;
      headerMesh.visible = isVideo;

      if (index < 0) return;

      if (isVideo) {
        videoMat.map = videoTextures[index];
        headerMat.map = videoHeaders[index];

        videoMat.needsUpdate = true;
        headerMat.needsUpdate = true;

        const video = videos[index];

        if (video) {
          video.play().catch(() => {
            // Reprodução pode depender da política do navegador.
          });
        }
      } else {
        faceMat.map = textures[index];
        faceMat.needsUpdate = true;
      }
    };

    // ---- FEIXE ----

    const beamGeo = new THREE.CylinderGeometry(
      0.04,
      BEAM_RADIUS,
      BEAM_LEN,
      64,
      1,
      true
    );

    beamGeo.translate(0, -BEAM_LEN / 2, 0);

    const beamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uO: { value: 0.5 },
        uH: { value: BEAM_LEN },
        uC: {
          value: new THREE.Vector3(1, 0.965, 0.871),
        },
      },
      vertexShader: BEAM_VERT,
      fragmentShader: BEAM_FRAG,
    });

    const beam = new THREE.Group();
    beam.add(new THREE.Mesh(beamGeo, beamMat));
    scene.add(beam);
    beam.visible = false;

    // ---- RESIZE + MOUSE ----

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let mx = 0;
    let my = 0;
    let mxs = 0;
    let mys = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', onMove);

    // ---- LOOP ----

    let raf = 0;

    const t0 = performance.now();

    const visOf = (i: number) =>
      projOf[i] >= 0 ? 1 : 0;

    const beamOf = (_i: number) => 1;

    const tick = (now: number) => {
      const p = pager.current;
      const f = p.f;

      const t = reduce ? 0 : (now - t0) / 1000;

      const i0 = Math.min(N - 1, Math.floor(f));
      const i1 = Math.min(N - 1, i0 + 1);

      const progress = f - i0;

      const xf =
        objX[i0] +
        (objX[i1] - objX[i0]) * progress;

      const asp = camera.aspect;
      const narrow = asp < 1;

      const halfH =
        Math.tan(
          THREE.MathUtils.degToRad(camera.fov / 2)
        ) * camera.position.z;

      const halfW = halfH * asp;

      const base = narrow
        ? 0.5
        : Math.min(0.95, asp / 1.7);

      mxs += (mx - mxs) * 0.06;
      mys += (my - mys) * 0.06;

      // Troca da mídia no meio da transição

      const sIdx = p.anim
        ? p.u < 0.5
          ? p.from
          : p.to
        : p.idx;

      const pi = projOf[sIdx];

      selectProject(pi);

      // Visibilidade da tela

      const fromVis = visOf(p.from);
      const toVis = visOf(p.to);

      const fadeOut =
        1 - THREE.MathUtils.smoothstep(p.u, 0, 0.5);

      const fadeIn =
        THREE.MathUtils.smoothstep(p.u, 0.5, 1);

      const vis = p.anim
        ? fromVis && toVis
          ? 1
          : fromVis
            ? fadeOut
            : toVis
              ? fadeIn
              : 0
        : visOf(p.idx);

      screen.visible = vis > 0.01;
      screen.scale.setScalar(base * 1.25 * vis);

      const sx = narrow ? 0 : xf * halfW * 0.9;
      const sy = narrow
        ? 1.1
        : Math.sin(t * 0.6) * 0.05;

      screen.position.set(sx, sy, 0);

      const spin = p.anim
        ? Math.sin(p.u * Math.PI) *
          0.9 *
          (p.to > p.from ? 1 : -1)
        : 0;

      screen.rotation.y =
        -xf * 0.6 +
        mxs * 0.5 +
        spin +
        Math.sin(t * 0.4) * 0.04;

      screen.rotation.x = mys * 0.35;

      faceMat.color.setScalar(
        0.95 +
        0.05 *
        Math.sin(t * 11) *
        Math.sin(t * 3)
      );

      // Visibilidade do feixe

      const beamVis = p.anim
        ? THREE.MathUtils.lerp(
            beamOf(p.from),
            beamOf(p.to),
            THREE.MathUtils.smoothstep(p.u, 0, 1)
          )
        : beamOf(p.idx);

      beam.visible = true;

      // Origem e destino do feixe por cena

      const getBeamPoints = (index: number) => {
        const kind = scenes[index].kind;

        // HERO: inclinado para a direita
        if (kind === 'hero') {
          return {
            ox: narrow ? -halfW * 0.8 : -halfW * 1.4,
            tx: halfW * 0.1,
            ty: narrow ? 1.1 : 0,
          };
        }

        // SOBRE: inclinado para a esquerda
        if (kind === 'about') {
          return {
            ox: narrow ? halfW * 0.1 : halfW * 0.1,
            tx: -halfW * 0.5,
            ty: narrow ? -0.5 : -0.7,
          };
        }

        // PROJETOS: comportamento original
        return {
          ox: narrow ? halfW * 0.8 : -xf * halfW * 0.3,
          tx: sx,
          ty: sy,
        };
      };

      const a = getBeamPoints(i0);
      const b = getBeamPoints(i1);

      const ox = THREE.MathUtils.lerp(a.ox, b.ox, progress);
      const tx = THREE.MathUtils.lerp(a.tx, b.tx, progress);
      const ty = THREE.MathUtils.lerp(a.ty, b.ty, progress);

      const oy = halfH + 0.4;

      const dx = tx - ox;
      const dy = ty - oy;

      const len = Math.sqrt(dx * dx + dy * dy);

      beam.position.set(ox, oy, 0);

      beam.rotation.z =
        Math.atan2(dx, -dy) +
        Math.sin(t * 0.3) * 0.02 +
        mxs * 0.05;

      beam.scale.y = len / BEAM_LEN;

      const flick = p.anim
        ? 1 - 0.35 * Math.sin(p.u * Math.PI)
        : 1;

      beamMat.uniforms.uO.value =
        0.5 *
        (0.55 + 0.45 * vis) *
        flick *
        (1 + 0.03 * Math.sin(t * 9));

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      window.removeEventListener('pointermove', onMove);

      videos.forEach((video) => {
        if (!video) return;
        video.pause();
        video.removeAttribute('src');
        video.load();
      });

      textures.forEach((tx) => tx.dispose());

      videoTextures.forEach((tx) => tx?.dispose());
      videoHeaders.forEach((tx) => tx?.dispose());

      [
        planeGeo,
        faceGeo,
        videoGeo,
        headerGeo,
        beamGeo,
      ].forEach((g) => g.dispose());

      [
        faceMat,
        videoMat,
        headerMat,
        shadowMat,
        frameMat,
        beamMat,
      ].forEach((m) => m.dispose());

      renderer.dispose();
    };
  }, [pager]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
