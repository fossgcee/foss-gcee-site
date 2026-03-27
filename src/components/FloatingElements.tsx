"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function FloatingElements() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      // Load the slim configuration to keep the bundle small
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // Optional callback when particles are loaded
  };

  if (!init) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
      <Particles
        id="tsparticles-swarm"
        particlesLoaded={particlesLoaded}
        className="absolute inset-0 w-full h-full pointer-events-none"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#c8ff00", "#a6ff00", "#73ff00", "#ffffff"],
            },
            links: {
              enable: false,
            },
            move: {
              enable: true,
              direction: "none",
              outModes: {
                default: "out",
              },
              random: true,
              speed: 0.3,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                width: 1200,
                height: 800,
              },
              value: 140, // dense swarm
            },
            opacity: {
              value: { min: 0.1, max: 0.9 },
              animation: {
                enable: true,
                speed: 1,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 0.8, max: 2.2 },
              animation: {
                enable: true,
                speed: 1,
                sync: false,
              },
            },
            shadow: {
              enable: true,
              color: "#c8ff00",
              blur: 10,
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
