"use client";

import { useEffect, useRef } from "react";

// Particle wave field behind the hero panel. Raw WebGL, no dependencies.
// Single accent hue (indigo ramp, bright step tuned for the fixed dark
// surface). Renders one static frame under prefers-reduced-motion, pauses
// when scrolled out of view, and silently stays hidden if WebGL fails.

const VERT = `
attribute vec2 aPos;
uniform float uTime;
uniform float uPR;
varying float vAlpha;
void main() {
  float w = sin(aPos.x * 4.0 + uTime * 0.9) * 0.5
    + sin(aPos.x * 1.7 + aPos.y * 2.3 - uTime * 0.6) * 0.5;
  vec2 p = vec2(aPos.x, aPos.y + w * 0.07);
  gl_Position = vec4(p, 0.0, 1.0);
  float depth = 0.5 + 0.5 * sin(aPos.y * 5.0 + aPos.x * 2.0 + uTime * 0.5);
  gl_PointSize = (1.6 + 2.6 * depth) * uPR;
  vAlpha = 0.16 + 0.5 * depth;
}
`;

const FRAG = `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float m = smoothstep(0.5, 0.08, d);
  gl_FragColor = vec4(uColor, m * vAlpha);
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
    const uTime = g.getUniformLocation(program, "uTime");
    const uPR = g.getUniformLocation(program, "uPR");
    const uColor = g.getUniformLocation(program, "uColor");
    // Bright indigo step, tuned for the fixed dark hero surface.
    g.uniform3f(uColor, 0.506, 0.549, 0.973);

    const narrow = window.matchMedia("(max-width: 640px)").matches;
    const cols = narrow ? 44 : 84;
    const rows = narrow ? 30 : 36;
    const positions = new Float32Array(cols * rows * 2);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions[i++] = (c / (cols - 1)) * 2 - 1;
        positions[i++] = (r / (rows - 1)) * 2 - 1;
      }
    }
    const buffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buffer);
    g.bufferData(g.ARRAY_BUFFER, positions, g.STATIC_DRAW);
    g.enableVertexAttribArray(aPos);
    g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);

    g.enable(g.BLEND);
    g.blendFunc(g.SRC_ALPHA, g.ONE);

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

    const draw = (t: number) => {
      resize();
      g.uniform1f(uTime, t);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.POINTS, 0, cols * rows);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      draw(1.2);
      return;
    }

    let raf = 0;
    let visible = true;
    let running = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      if (visible && !document.hidden) draw((now - start) / 1000);
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
      g.deleteBuffer(buffer);
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
