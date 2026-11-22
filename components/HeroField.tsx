"use client";

import { useEffect, useRef } from "react";

// Layered particle field behind the hero. Raw WebGL, no dependencies.
// Three depth layers share one seeded grid; scroll progress drifts the near
// layer faster (parallax), the pointer eases a small camera offset, and
// reduced motion renders one static frame. Pauses offscreen.

const VERT = `
attribute vec2 aPos;
attribute float aDepth;
uniform float uTime;
uniform float uPR;
uniform float uScroll;
uniform vec2 uMouse;
varying float vAlpha;
varying float vDepth;
void main() {
  float w = sin(aPos.x * 4.0 + uTime * 0.9 + aDepth * 2.0) * 0.5
    + sin(aPos.x * 1.7 + aPos.y * 2.3 - uTime * 0.6) * 0.5;
  float drift = uScroll * (0.04 + aDepth * 0.16);
  vec2 p = vec2(
    aPos.x + uMouse.x * (0.02 + aDepth * 0.05) + drift,
    aPos.y + w * (0.05 + aDepth * 0.06) + uMouse.y * (0.015 + aDepth * 0.04)
  );
  gl_Position = vec4(p, 0.0, 1.0);
  float depth = 0.5 + 0.5 * sin(aPos.y * 5.0 + aPos.x * 2.0 + uTime * 0.5 + aDepth * 3.0);
  gl_PointSize = (1.1 + 3.4 * aDepth * (0.6 + 0.4 * depth)) * uPR;
  vAlpha = 0.06 + 0.55 * aDepth * (0.35 + 0.65 * depth);
  vDepth = aDepth;
}
`;

const FRAG = `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uGlow;
varying float vAlpha;
varying float vDepth;
void main() {
  vec2 q = gl_PointCoord - vec2(0.5);
  float d = length(q);
  float m = smoothstep(0.5, 0.06, d);
  vec3 col = mix(uColor, uGlow, vDepth * 0.55);
  gl_FragColor = vec4(col, m * vAlpha);
}
`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
      });
    } catch {
      gl = null;
    }
    if (!gl) return;
    const g = gl;

    const vs = compile(g, g.VERTEX_SHADER, VERT);
    const fs = compile(g, g.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = g.createProgram();
    if (!program) return;
    g.attachShader(program, vs);
    g.attachShader(program, fs);
    g.linkProgram(program);
    if (!g.getProgramParameter(program, g.LINK_STATUS)) return;
    g.useProgram(program);

    const aPos = g.getAttribLocation(program, "aPos");
    const aDepth = g.getAttribLocation(program, "aDepth");
    const uTime = g.getUniformLocation(program, "uTime");
    const uPR = g.getUniformLocation(program, "uPR");
    const uScroll = g.getUniformLocation(program, "uScroll");
    const uMouse = g.getUniformLocation(program, "uMouse");
    const uColor = g.getUniformLocation(program, "uColor");
    const uGlow = g.getUniformLocation(program, "uGlow");
    // Indigo base with a pale lilac lift on the near layer, tuned for #0B0C12.
    g.uniform3f(uColor, 0.31, 0.33, 0.85);
    g.uniform3f(uGlow, 0.78, 0.79, 0.98);

    const narrow = window.matchMedia("(max-width: 640px)").matches;
    const cols = narrow ? 48 : 76;
    const rows = narrow ? 30 : 34;
    const layers = [0.18, 0.5, 1.0];
    const per = cols * rows;
    const positions = new Float32Array(per * layers.length * 2);
    const depths = new Float32Array(per * layers.length);
    let i2 = 0;
    let i3 = 0;
    // Seeded jitter so the grid never looks machined.
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647 - 0.5;
    };
    for (const depth of layers) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions[i2++] = (c / (cols - 1)) * 2 - 1 + rand() * 0.02;
          positions[i2++] = (r / (rows - 1)) * 2 - 1 + rand() * 0.02;
          depths[i3++] = depth;
        }
      }
    }
    const posBuffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, posBuffer);
    g.bufferData(g.ARRAY_BUFFER, positions, g.STATIC_DRAW);
    g.enableVertexAttribArray(aPos);
    g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);
    const depthBuffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, depthBuffer);
    g.bufferData(g.ARRAY_BUFFER, depths, g.STATIC_DRAW);
    g.enableVertexAttribArray(aDepth);
    g.vertexAttribPointer(aDepth, 1, g.FLOAT, false, 0, 0);

    g.enable(g.BLEND);
    g.blendFunc(g.SRC_ALPHA, g.ONE);

    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = -((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * pr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * pr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        g.viewport(0, 0, w, h);
      }
      g.uniform1f(uPR, pr);
    };
    resize();

    const draw = (t: number, scroll: number) => {
      resize();
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      g.uniform1f(uTime, t);
      g.uniform1f(uScroll, scroll);
      g.uniform2f(uMouse, mx, my);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.POINTS, 0, per * layers.length);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      draw(1.2, 0);
      window.removeEventListener("pointermove", onPointer);
      return;
    }

    let raf = 0;
    let visible = true;
    let running = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      if (visible && !document.hidden) {
        const scroll = Math.min(
          1,
          Math.max(0, window.scrollY / (window.innerHeight || 1))
        );
        draw((now - start) / 1000, scroll);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden && running && !raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      g.deleteBuffer(posBuffer);
      g.deleteBuffer(depthBuffer);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
