"use client";

import { motion } from "motion/react";
import React, { useEffect, useState } from "react";

interface CloudConfig {
  id: number;
  top: string;
  scale: number;
  duration: number;
  direction: "left-to-right" | "right-to-left";
  delay: number;
}

const CloudIcon = () => (
  <svg
    viewBox="0 0 600 320"
    className="w-full h-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="
        M 120 260 
        L 480 260 
        C 540 260, 550 190, 490 190 
        C 510 140, 460 110, 420 140 
        C 430 40, 270 20, 240 120 
        C 180 80, 100 120, 120 180 
        C 60 180, 50 250, 120 260 
        Z"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CloudBackground = () => {
  const [clouds, setClouds] = useState<CloudConfig[]>([]);

  useEffect(() => {
    const newClouds: CloudConfig[] = [
      {
        id: 1,
        top: "10%",
        scale: 0.7,
        duration: 35,
        direction: "left-to-right",
        delay: 0,
      },
      {
        id: 2,
        top: "22%",
        scale: 1.1,
        duration: 85,
        direction: "right-to-left",
        delay: 5,
      },
      {
        id: 3,
        top: "38%",
        scale: 0.5,
        duration: 45,
        direction: "left-to-right",
        delay: 12,
      },
      {
        id: 4,
        top: "55%",
        scale: 1.4,
        duration: 110,
        direction: "right-to-left",
        delay: 2,
      },
      {
        id: 5,
        top: "72%",
        scale: 0.8,
        duration: 30,
        direction: "left-to-right",
        delay: 18,
      },
      {
        id: 6,
        top: "5%",
        scale: 1.2,
        duration: 75,
        direction: "right-to-left",
        delay: 8,
      },
    ];
    setClouds(newClouds);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute w-32 sm:w-48 lg:w-64"
          style={{
            top: cloud.top,
            scale: cloud.scale,
            zIndex: Math.floor(cloud.scale * 10),
          }}
          initial={{
            x: cloud.direction === "left-to-right" ? "-30vw" : "120vw",
            rotate: cloud.direction === "left-to-right" ? -2 : 2,
          }}
          animate={{
            x: cloud.direction === "left-to-right" ? "120vw" : "-30vw",
            rotate: cloud.direction === "left-to-right" ? 2 : -2,
          }}
          transition={{
            x: {
              duration: cloud.duration,
              repeat: Infinity,
              ease: "linear",
              delay: cloud.delay,
            },
            rotate: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        >
          <CloudIcon />
        </motion.div>
      ))}
    </div>
  );
};
