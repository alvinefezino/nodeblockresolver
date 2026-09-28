"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bx: number; // base velocity (what it drifts at when free)
  by: number;
  r: number;
  alpha: number;
  wob: number; // wobble speed
  phase: number;
  follower: boolean;
  orbit: number; // distance from cursor when following
  angle: number;
  spin: number;
};

const LINK_DIST = 150;
const CURSOR_LINK_DIST = 240;

export default function NodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let nodes: Node[] = [];
    const mouse = { x: 0, y: 0, active: false };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(30, Math.floor((w * h) / 18000)));
      const followers = Math.max(6, Math.round(count * 0.12));

      nodes = Array.from({ length: count }, (_, i) => {
        const bx = rand(-0.4, 0.4);
        const by = rand(-0.4, 0.4);
        return {
          x: rand(0, w),
          y: rand(0, h),
          vx: bx,
          vy: by,
          bx,
          by,
          r: rand(1, 2.4),
          alpha: rand(0.35, 0.85),
          wob: rand(0.5, 1.5),
          phase: rand(0, Math.PI * 2),
          follower: i < followers,
          orbit: rand(40, 170),
          angle: rand(0, Math.PI * 2),
          spin: rand(0.6, 1.6) * (Math.random() > 0.5 ? 1 : -1),
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // update
      for (const n of nodes) {
        if (n.follower && mouse.active) {
          const a = n.angle + t * 0.0006 * n.spin;
          const tx = mouse.x + Math.cos(a) * n.orbit;
          const ty = mouse.y + Math.sin(a) * n.orbit;
          n.vx += (tx - n.x) * 0.0007;
          n.vy += (ty - n.y) * 0.0007;
          n.vx *= 0.94;
          n.vy *= 0.94;
        } else {
          // ease back to own drift direction
          n.vx += (n.bx - n.vx) * 0.02;
          n.vy += (n.by - n.vy) * 0.02;
        }

        const wobble = Math.sin(t * 0.001 * n.wob + n.phase) * 0.15;
        n.x += n.vx + wobble;
        n.y += n.vy + Math.cos(t * 0.001 * n.wob + n.phase) * 0.15;

        // wrap around edges
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }

      // node-to-node links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK_DIST) * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // cursor links
      if (mouse.active) {
        for (const n of nodes) {
          if (!n.follower) continue;
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < CURSOR_LINK_DIST) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / CURSOR_LINK_DIST) * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${n.alpha})`;
        if (n.follower) {
          ctx.shadowColor = "rgba(255,255,255,0.9)";
          ctx.shadowBlur = 10;
        }
        ctx.arc(n.x, n.y, n.follower ? n.r + 0.6 : n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    init();
    if (reduceMotion) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", init);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}