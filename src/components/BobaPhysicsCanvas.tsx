import React, { useEffect, useRef, useState } from 'react';
import { CupType, CurrentCupState, SealDesign, StrawType, ToppingType } from '../types/boba';
import { sounds } from '../services/soundEffects';
import { TEA_CATALOG, MILK_CATALOG, TOPPING_CATALOG } from '../data/bobaData';

interface BobaPhysicsCanvasProps {
  cupState: CurrentCupState;
  isPouring: boolean;
  pouringColor?: string;
  pouringType?: 'tea' | 'milk' | 'sweetener' | 'cheese_foam';
  onPunctureStraw?: () => void;
  onSlurp?: () => void;
  onDropTopping?: (topping: ToppingType) => void;
}

interface PhysicsParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: ToppingType;
  color: string;
  secondaryColor?: string;
  rotation: number;
  vRot: number;
  isCube?: boolean;
}

interface IceCube {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
}

export const BobaPhysicsCanvas: React.FC<BobaPhysicsCanvasProps> = ({
  cupState,
  isPouring,
  pouringColor,
  pouringType,
  onPunctureStraw,
  onSlurp
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<PhysicsParticle[]>([]);
  const iceCubesRef = useRef<IceCube[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const tiltRef = useRef<number>(0);
  const sloshRef = useRef<number>(0);
  const strawSuctionRef = useRef<{
    progress: number; // 0 to 1
    type: ToppingType;
    color: string;
  } | null>(null);
  const flavorSparksRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  const [isHoveringStraw, setIsHoveringStraw] = useState(false);

  // Sync toppings from cupState.toppingCounts into particles
  useEffect(() => {
    const currentParticles = particlesRef.current;
    let nextParticles = [...currentParticles];

    // Count how many of each topping currently exist in physics
    const currentCounts: Record<ToppingType, number> = {
      black_pearls: 0,
      popping_boba: 0,
      lychee_jelly: 0,
      egg_pudding: 0,
      grass_jelly: 0,
      cheese_foam: 0
    };

    currentParticles.forEach((p) => {
      currentCounts[p.type] = (currentCounts[p.type] || 0) + 1;
    });

    // Add missing particles
    (Object.keys(cupState.toppingCounts) as ToppingType[]).forEach((type) => {
      if (type === 'cheese_foam') return; // rendered as fluid layer
      const targetCount = cupState.toppingCounts[type];
      const currentCount = currentCounts[type] || 0;

      if (targetCount > currentCount) {
        const toAdd = targetCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
          const config = TOPPING_CATALOG[type];
          const isCube = type === 'lychee_jelly' || type === 'grass_jelly';
          const isPudding = type === 'egg_pudding';
          const radius = isPudding ? 18 : isCube ? 12 : 10;

          nextParticles.push({
            id: Date.now() + Math.random(),
            x: 180 + (Math.random() * 60 - 30),
            y: 90 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 3,
            radius,
            type,
            color: config.color,
            secondaryColor: config.secondaryColor,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.1,
            isCube
          });
        }
      } else if (targetCount < currentCount) {
        // Remove excess
        let toRemove = currentCount - targetCount;
        nextParticles = nextParticles.filter((p) => {
          if (p.type === type && toRemove > 0) {
            toRemove--;
            return false;
          }
          return true;
        });
      }
    });

    particlesRef.current = nextParticles;
  }, [cupState.toppingCounts]);

  // Sync ice cubes
  useEffect(() => {
    const targetCubes = cupState.iceCubesCount;
    const currentCubes = iceCubesRef.current;
    if (targetCubes > currentCubes.length) {
      const diff = targetCubes - currentCubes.length;
      for (let i = 0; i < diff; i++) {
        currentCubes.push({
          id: Date.now() + Math.random(),
          x: 170 + (Math.random() * 80 - 40),
          y: 160 + Math.random() * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1,
          size: 24 + Math.random() * 6,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.05
        });
      }
    } else if (targetCubes < currentCubes.length) {
      currentCubes.splice(targetCubes);
    }
  }, [cupState.iceCubesCount]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cup geometry specs
      const cupWidth = cupState.cupType === 'slender' ? 140 : cupState.cupType === 'chubby' ? 200 : 160;
      const cupHeight = cupState.cupType === 'slender' ? 300 : cupState.cupType === 'chubby' ? 250 : 280;
      const cupTopY = 120;
      const cupBottomY = cupTopY + cupHeight;
      const centerX = canvas.width / 2;

      const cupTopLeft = centerX - cupWidth / 2;
      const cupTopRight = centerX + cupWidth / 2;
      const cupBottomInset = cupState.cupType === 'frosted_can' ? 6 : 18;
      const cupBottomLeft = centerX - cupWidth / 2 + cupBottomInset;
      const cupBottomRight = centerX + cupWidth / 2 - cupBottomInset;

      // Calculate fluid fill level (0 to 1)
      const totalVolume = Math.min(100, (cupState.teaVolume || 0) + (cupState.milkVolume || 0));
      const fillRatio = totalVolume / 100;
      const fluidMaxHeight = cupHeight - 35;
      const currentFluidHeight = fluidMaxHeight * fillRatio;
      const fluidSurfaceY = cupBottomY - currentFluidHeight;

      // Update fluid slosh physics
      sloshRef.current *= 0.94;
      const waveOffset = Math.sin(time * 0.005) * (2 + Math.abs(sloshRef.current) * 10);

      // Physics: Update topping particles
      const gravity = 420;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.vy += gravity * dt;
        p.vx += tiltRef.current * 1600 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot;

        // Cup bounds collision
        // Approximate cup sides slope
        const progress = Math.max(0, Math.min(1, (p.y - cupTopY) / cupHeight));
        const currentHalfWidth = (cupWidth / 2) - progress * cupBottomInset;
        const leftBound = centerX - currentHalfWidth + p.radius;
        const rightBound = centerX + currentHalfWidth - p.radius;
        const bottomBound = cupBottomY - 10 - p.radius;

        if (p.x < leftBound) {
          p.x = leftBound;
          p.vx = -p.vx * 0.3;
        } else if (p.x > rightBound) {
          p.x = rightBound;
          p.vx = -p.vx * 0.3;
        }

        if (p.y > bottomBound) {
          p.y = bottomBound;
          p.vy = -p.vy * 0.2;
          p.vx *= 0.85; // friction
        }

        // Buoyancy in fluid
        if (p.y > fluidSurfaceY) {
          p.vy *= 0.92; // fluid drag
          p.vx *= 0.92;
        }

        // Particle-particle collision
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p.radius + p2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            p.x -= nx * overlap;
            p.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            const dvx = p2.vx - p.vx;
            const dvy = p2.vy - p.vy;
            const impulse = (dvx * nx + dvy * ny) * 0.3;

            p.vx += impulse * nx;
            p.vy += impulse * ny;
            p2.vx -= impulse * nx;
            p2.vy -= impulse * ny;
          }
        }
      }

      // Physics: Update floating ice cubes
      const iceCubes = iceCubesRef.current;
      for (let i = 0; i < iceCubes.length; i++) {
        const ice = iceCubes[i];
        if (fluidSurfaceY < cupBottomY - 20) {
          // Floats near liquid surface
          const targetY = fluidSurfaceY + 14 + (i % 2) * 8;
          ice.vy += (targetY - ice.y) * 8 * dt;
          ice.vy *= 0.88;
        } else {
          ice.vy += gravity * dt;
          if (ice.y > cupBottomY - 25) {
            ice.y = cupBottomY - 25;
            ice.vy = 0;
          }
        }
        ice.x += ice.vx * dt;
        ice.y += ice.vy * dt;
        ice.rotation += ice.vRot;

        // Cup bounds
        const iceHalf = ice.size / 2;
        if (ice.x < centerX - cupWidth / 2 + 25) ice.x = centerX - cupWidth / 2 + 25;
        if (ice.x > centerX + cupWidth / 2 - 25) ice.x = centerX + cupWidth / 2 - 25;
      }

      // DRAWING PASS

      // 1. Back shadow of cup
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, cupBottomY + 12, cupWidth * 0.5, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.restore();

      // 2. Straw (Back segment if inserted)
      if (cupState.isStrawPunctured) {
        drawStraw(ctx, centerX, cupTopY, cupBottomY, cupState.strawType, true);
      }

      // 3. Cup Interior Back
      ctx.save();
      ctx.beginPath();
      drawCupPath(ctx, cupTopLeft, cupTopRight, cupBottomRight, cupBottomLeft, cupBottomY);
      ctx.fillStyle = cupState.cupType === 'frosted_can' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.restore();

      // 4. Liquid Fill (clipped to cup path)
      if (totalVolume > 0) {
        ctx.save();
        ctx.beginPath();
        drawCupPath(ctx, cupTopLeft, cupTopRight, cupBottomRight, cupBottomLeft, cupBottomY);
        ctx.clip();

        // Blend liquid colors
        const teaColor = cupState.tea ? TEA_CATALOG[cupState.tea].color : '#a8652d';
        const milkColor = cupState.milk !== 'none' ? MILK_CATALOG[cupState.milk].color : null;
        const isShaken = cupState.shakenProgress >= 80;

        const liquidGrad = ctx.createLinearGradient(0, cupBottomY, 0, fluidSurfaceY);

        if (isShaken || (cupState.milk !== 'none' && cupState.shakenProgress > 0)) {
          // Creamy blend
          if (cupState.tea === 'ceremonial_matcha') {
            liquidGrad.addColorStop(0, '#598f3e');
            liquidGrad.addColorStop(1, '#8bc34a');
          } else if (cupState.tea === 'thai_ceylon') {
            liquidGrad.addColorStop(0, '#ea580c');
            liquidGrad.addColorStop(1, '#fed7aa');
          } else {
            liquidGrad.addColorStop(0, '#b87c4c');
            liquidGrad.addColorStop(1, '#dcb48b');
          }
        } else if (milkColor && cupState.milkVolume > 0 && cupState.teaVolume > 0) {
          // Layered Macchiato swirl
          liquidGrad.addColorStop(0, teaColor);
          liquidGrad.addColorStop(0.55, teaColor);
          liquidGrad.addColorStop(0.7, '#dcb48b');
          liquidGrad.addColorStop(1, milkColor);
        } else if (cupState.teaVolume > 0) {
          liquidGrad.addColorStop(0, teaColor);
          liquidGrad.addColorStop(1, teaColor);
        } else if (milkColor) {
          liquidGrad.addColorStop(0, milkColor);
          liquidGrad.addColorStop(1, milkColor);
        }

        // Draw liquid body with wavy top
        ctx.beginPath();
        ctx.moveTo(cupBottomLeft - 10, cupBottomY + 10);
        ctx.lineTo(cupBottomRight + 10, cupBottomY + 10);
        ctx.lineTo(centerX + cupWidth, fluidSurfaceY);

        // Sinusoidal wave across surface with mouse tilt
        const surfaceTilt = tiltRef.current * 70;
        for (let x = centerX + cupWidth; x >= centerX - cupWidth; x -= 10) {
          const normX = (x - centerX) / (cupWidth / 2);
          const wave = Math.sin((x + time * 0.05) * 0.04) * (2 + Math.abs(sloshRef.current) * 4);
          ctx.lineTo(x, fluidSurfaceY + wave + normX * surfaceTilt);
        }
        ctx.closePath();
        ctx.fillStyle = liquidGrad;
        ctx.fill();

        // Fluid highlights & swirl streaks
        ctx.beginPath();
        ctx.arc(centerX - 30, fluidSurfaceY + 25, 40, 0, Math.PI * 0.7);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.restore();
      }

      // 4b. Brown Sugar Tiger Lava Stripes (if brown sugar selected)
      if (cupState.sweetener === 'brown_sugar' && cupState.sweetness > 0) {
        ctx.save();
        ctx.beginPath();
        drawCupPath(ctx, cupTopLeft, cupTopRight, cupBottomRight, cupBottomLeft, cupBottomY);
        ctx.clip();

        ctx.fillStyle = '#451a03';
        const stripeOffsets = [-0.7, -0.45, -0.2, 0.15, 0.45, 0.72];
        stripeOffsets.forEach((pos, idx) => {
          const sx = centerX + pos * (cupWidth * 0.42);
          const stripeLen = 100 + ((idx * 37) % 75);
          ctx.beginPath();
          ctx.moveTo(sx - 3.5, cupTopY + 15);
          ctx.bezierCurveTo(
            sx - 6 + Math.sin(time * 0.002 + idx) * 3,
            cupTopY + stripeLen * 0.45,
            sx + 5,
            cupTopY + stripeLen * 0.75,
            sx - 1,
            cupTopY + stripeLen
          );
          ctx.lineTo(sx + 3.5, cupTopY + stripeLen);
          ctx.bezierCurveTo(
            sx + 7,
            cupTopY + stripeLen * 0.75,
            sx - 2,
            cupTopY + stripeLen * 0.45,
            sx + 3.5,
            cupTopY + 15
          );
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      // 5. Render Topping Particles (clipped inside cup)
      ctx.save();
      ctx.beginPath();
      drawCupPath(ctx, cupTopLeft, cupTopRight, cupBottomRight, cupBottomLeft, cupBottomY);
      ctx.clip();

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.isCube) {
          // Jelly cubes
          ctx.beginPath();
          ctx.roundRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2, 4);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.strokeStyle = p.secondaryColor || 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Shiny cube corner
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(-p.radius + 2, -p.radius + 2, p.radius * 0.6, p.radius * 0.6);
        } else if (p.type === 'egg_pudding') {
          // Soft flan pudding wedge
          ctx.beginPath();
          ctx.roundRect(-p.radius * 1.2, -p.radius * 0.8, p.radius * 2.4, p.radius * 1.6, 6);
          ctx.fillStyle = p.color;
          ctx.fill();
          // Caramel top streak
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-p.radius * 1.2, -p.radius * 0.8, p.radius * 2.4, 4);
        } else {
          // Round Pearls & Popping Boba
          const grad = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, 1, 0, 0, p.radius);
          if (p.type === 'popping_boba') {
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.6, p.color);
            grad.addColorStop(1, p.secondaryColor || '#b45309');
          } else {
            // Black Tapioca Pearls
            grad.addColorStop(0, '#44342d');
            grad.addColorStop(0.5, '#201614');
            grad.addColorStop(1, '#0c0806');
          }
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Glossy specular dot
          ctx.beginPath();
          ctx.arc(-p.radius * 0.35, -p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fill();
        }

        ctx.restore();
      });

      // 6. Floating Ice Cubes
      iceCubes.forEach((ice) => {
        ctx.save();
        ctx.translate(ice.x, ice.y);
        ctx.rotate(ice.rotation);

        ctx.beginPath();
        ctx.roundRect(-ice.size / 2, -ice.size / 2, ice.size, ice.size, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ice interior frost reflection
        ctx.beginPath();
        ctx.moveTo(-ice.size * 0.3, -ice.size * 0.2);
        ctx.lineTo(ice.size * 0.2, ice.size * 0.3);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      // 7. Cheese Foam Layer (if active)
      if (cupState.hasCheeseFoam && totalVolume > 15) {
        ctx.save();
        const foamTopY = Math.max(cupTopY + 25, fluidSurfaceY - 26);
        const foamHeight = 32;

        ctx.beginPath();
        ctx.rect(cupTopLeft, foamTopY, cupWidth, foamHeight);
        ctx.fillStyle = '#fffdf7';
        ctx.fill();

        // Billowy cloud bumps on top of cheese foam
        for (let bx = cupTopLeft + 15; bx < cupTopRight - 10; bx += 22) {
          ctx.beginPath();
          ctx.arc(bx, foamTopY + 3, 13, Math.PI, Math.PI * 2);
          ctx.fillStyle = '#fffdf7';
          ctx.fill();
        }

        // Torched Crème Brûlée Effect
        if (cupState.isTorched) {
          for (let tx = cupTopLeft + 25; tx < cupTopRight - 20; tx += 28) {
            ctx.beginPath();
            ctx.ellipse(tx, foamTopY + 4, 12, 5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#854d0e';
            ctx.fill();

            // Burnt sugar fleck
            ctx.beginPath();
            ctx.arc(tx + 2, foamTopY + 4, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#3f1d0b';
            ctx.fill();
          }
        }
        ctx.restore();
      }

      ctx.restore(); // end clip to cup

      // 8. Dynamic Liquid Pouring Stream (if pouring active)
      if (isPouring) {
        const streamX = centerX + Math.sin(time * 0.01) * 6;
        const color = pouringColor || '#c5a359';

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(streamX - 5, 20);
        ctx.lineTo(streamX + 5, 20);
        ctx.lineTo(streamX + 7, fluidSurfaceY);
        ctx.lineTo(streamX - 7, fluidSurfaceY);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Stream splash particles
        for (let s = 0; s < 4; s++) {
          const splashX = streamX + (Math.random() - 0.5) * 24;
          const splashY = fluidSurfaceY - Math.random() * 15;
          ctx.beginPath();
          ctx.arc(splashX, splashY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.restore();
      }

      // 9. Glass Cup Front Highlights & Reflections
      ctx.save();
      drawCupPath(ctx, cupTopLeft, cupTopRight, cupBottomRight, cupBottomLeft, cupBottomY);
      ctx.strokeStyle = cupState.cupType === 'frosted_can' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Curved glass rim oval
      ctx.beginPath();
      ctx.ellipse(centerX, cupTopY, cupWidth / 2, 9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vertical gloss gleam along left edge
      ctx.beginPath();
      ctx.moveTo(cupTopLeft + 12, cupTopY + 25);
      ctx.lineTo(cupBottomLeft + 10, cupBottomY - 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Subtle right edge reflection
      ctx.beginPath();
      ctx.moveTo(cupTopRight - 10, cupTopY + 30);
      ctx.lineTo(cupBottomRight - 10, cupBottomY - 25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Aesthetic Measurements lines on side
      for (let mark = 1; mark <= 4; mark++) {
        const markY = cupBottomY - (cupHeight * 0.18 * mark);
        ctx.beginPath();
        ctx.moveTo(cupTopRight - 14, markY);
        ctx.lineTo(cupTopRight - 6, markY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // 10. Cup Sealing Film (if sealed)
      if (cupState.isSealed) {
        drawCupSealFilm(ctx, centerX, cupTopY, cupWidth, cupState.sealDesign, cupState.isStrawPunctured);
      }

      // 11. Straw (Front segment if inserted)
      if (cupState.isStrawPunctured) {
        drawStraw(ctx, centerX, cupTopY, cupBottomY, cupState.strawType, false);
      }

      // 11b. Ascending boba particle travelling up straw on slurp
      if (strawSuctionRef.current) {
        const suction = strawSuctionRef.current;
        suction.progress += dt * 1.5;
        if (suction.progress >= 1) {
          // Burst of flavor sparks at top of straw
          sounds.playBobaDrop(1.4);
          for (let s = 0; s < 10; s++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 70 + Math.random() * 90;
            flavorSparksRef.current.push({
              x: centerX + 18,
              y: 35,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 20,
              life: 1.0,
              color: ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#4ade80'][s % 5]
            });
          }
          strawSuctionRef.current = null;
        } else {
          // Draw boba pearl in transit
          const startX = centerX - 14;
          const startY = cupBottomY - 14;
          const endX = centerX + 18;
          const endY = 35;
          const curX = startX + (endX - startX) * suction.progress;
          const curY = startY + (endY - startY) * suction.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(curX, curY, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = suction.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Shiny dot
          ctx.beginPath();
          ctx.arc(curX - 2, curY - 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();

          // Bubble trail
          ctx.beginPath();
          ctx.arc(curX + (Math.random() - 0.5) * 3, curY + 12, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
          ctx.restore();
        }
      }

      // Update & render flavor sparks
      const sparks = flavorSparksRef.current;
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vy += 160 * dt; // gravity
        sp.life -= dt * 1.8;
        if (sp.life <= 0) {
          sparks.splice(s, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, sp.life);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 3 * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.fill();
          ctx.restore();
        }
      }

      // 12. Floating Straw Puncture Indicator (if sealed but straw not punctured)
      if (cupState.isSealed && !cupState.isStrawPunctured) {
        ctx.save();
        const strawTipY = cupTopY - 45 + Math.sin(time * 0.006) * 4;
        ctx.beginPath();
        ctx.arc(centerX + 15, strawTipY, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('POP!', centerX + 15, strawTipY);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cupState, isPouring, pouringColor]);

  // Helper: Draw cup boundary path
  const drawCupPath = (
    ctx: CanvasRenderingContext2D,
    tl: number,
    tr: number,
    br: number,
    bl: number,
    by: number
  ) => {
    ctx.moveTo(tl, 120);
    ctx.lineTo(tr, 120);
    ctx.lineTo(br, by - 12);
    ctx.quadraticCurveTo(br, by, br - 12, by);
    ctx.lineTo(bl + 12, by);
    ctx.quadraticCurveTo(bl, by, bl, by - 12);
    ctx.closePath();
  };

  // Helper: Draw heat-sealed film lid
  const drawCupSealFilm = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    design: SealDesign,
    isPunctured: boolean
  ) => {
    ctx.save();
    // Seal rim wrap
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 + 5, 12, 0, 0, Math.PI * 2);

    let sealGrad = ctx.createLinearGradient(cx - w / 2, cy, cx + w / 2, cy);
    if (design === 'tiger_stripe') {
      sealGrad.addColorStop(0, '#f59e0b');
      sealGrad.addColorStop(0.5, '#78350f');
      sealGrad.addColorStop(1, '#f59e0b');
    } else if (design === 'sakura_blossom') {
      sealGrad.addColorStop(0, '#fbcfe8');
      sealGrad.addColorStop(0.5, '#f472b6');
      sealGrad.addColorStop(1, '#fbcfe8');
    } else if (design === 'golden_lotus') {
      sealGrad.addColorStop(0, '#fef08a');
      sealGrad.addColorStop(0.5, '#d97706');
      sealGrad.addColorStop(1, '#fef08a');
    } else {
      sealGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      sealGrad.addColorStop(1, 'rgba(240, 240, 240, 0.85)');
    }

    ctx.fillStyle = sealGrad;
    ctx.fill();
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center logo emblem or seal graphics
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (design === 'tiger_stripe') {
      ctx.fillText('🐅 TIGER 12', cx, cy - 1);
    } else if (design === 'sakura_blossom') {
      ctx.fillText('🌸 SAKURA', cx, cy - 1);
    } else if (design === 'golden_lotus') {
      ctx.fillText('🪷 LOTUS', cx, cy - 1);
    } else {
      ctx.fillText('BOBAFLOW 12', cx, cy - 1);
    }

    // Puncture star hole if poked
    if (isPunctured) {
      ctx.beginPath();
      ctx.arc(cx + 15, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper: Draw wide angled Boba Straw
  const drawStraw = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    bottomY: number,
    strawType: StrawType,
    isBackPass: boolean
  ) => {
    ctx.save();
    const strawAngle = 0.12; // tilted slightly
    const strawWidth = 14;
    const strawTopX = cx + 18;
    const strawTopY = 35;
    const strawBottomX = cx - 14;
    const strawBottomY = bottomY - 14;

    ctx.translate(strawTopX, strawTopY);
    ctx.rotate(strawAngle);

    // Straw color styling
    let strawFill = '#1c1917';
    if (strawType === 'rose_gold') strawFill = '#fb7185';
    if (strawType === 'bamboo') strawFill = '#84cc16';
    if (strawType === 'golden_amber') strawFill = '#f59e0b';
    if (strawType === 'pastel_stripe') strawFill = '#fda4af';

    const length = strawBottomY - strawTopY;

    if (isBackPass) {
      // In back pass, draw straw section that sits behind fluid
      ctx.fillStyle = strawFill;
      ctx.fillRect(-strawWidth / 2, 0, strawWidth, length);
    } else {
      // In front pass, draw top section sticking out of cup
      const exposedLength = cy - strawTopY + 10;
      ctx.fillStyle = strawFill;
      ctx.fillRect(-strawWidth / 2, 0, strawWidth, exposedLength);

      // Angled bevel puncture tip at top
      ctx.beginPath();
      ctx.ellipse(0, 0, strawWidth / 2, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Shiny straw highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-strawWidth / 2 + 2, 0, 2.5, exposedLength);
    }
    ctx.restore();
  };

  // Handle click on canvas: if sealed and not punctured, puncture straw!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cupState.isSealed && !cupState.isStrawPunctured) {
      sounds.playStrawPop();
      onPunctureStraw?.();
      // slosh cup from impact
      sloshRef.current = 1.2;
    } else if (cupState.isStrawPunctured) {
      // Slurp!
      sounds.playSlurp();
      strawSuctionRef.current = {
        progress: 0,
        type: cupState.toppings[0] || 'black_pearls',
        color: cupState.toppings.includes('popping_boba') ? '#fbbf24' : '#1c1917'
      };
      onSlurp?.();
      sloshRef.current = 0.6;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        width={380}
        height={460}
        onClick={handleCanvasClick}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left - rect.width / 2;
          tiltRef.current = Math.max(-0.25, Math.min(0.25, mx * 0.0012));
          sloshRef.current = mx * 0.001;
        }}
        onMouseEnter={() => setIsHoveringStraw(true)}
        onMouseLeave={() => {
          setIsHoveringStraw(false);
          tiltRef.current = 0;
        }}
        className={`w-full max-w-[360px] h-[430px] rounded-2xl cursor-pointer transition-transform duration-150 active:scale-[0.99]`}
        title={
          !cupState.isSealed
            ? 'Craft your drink, then heat seal the lid!'
            : !cupState.isStrawPunctured
            ? 'Click to Puncture with Boba Straw!'
            : 'Click to Slurp & Enjoy!'
        }
      />
    </div>
  );
};
