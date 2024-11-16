import { useEffect, useRef } from "react";

export const AnimatedLogo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const circles: Array<{x: number; y: number; radius: number; speed: number}> = [];
    
    for (let i = 0; i < 3; i++) {
      circles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 20 + i * 10,
        speed: 0.5 + i * 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      circles.forEach((circle, i) => {
        ctx.beginPath();
        const x = circle.x + Math.cos(frame * circle.speed) * 20;
        const y = circle.y + Math.sin(frame * circle.speed) * 20;
        ctx.arc(x, y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${0.1 - i * 0.02})`;
        ctx.fill();
      });

      frame += 0.02;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      width={200}
      height={200}
      className="w-[200px] h-[200px]"
    />
  );
};