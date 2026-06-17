"use client";

import { ScrollFadeIn } from "@/components/motion/ScrollFadeIn";
import { Hash, Shield, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const comments = [
  { user: "priya_style", text: "link please! 🙏", keyword: "link" },
  { user: "fashion.finds", text: "want this! 😍", keyword: "want" },
  { user: "shreya.picks", text: "drop the link 💕", keyword: "link" },
];

const benefits = [
  {
    icon: Hash,
    title: "Keyword triggers",
    desc: "Set any word to activate auto-DM",
    bg: "bg-primary/10",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Rate-limit safe",
    desc: "Respects Instagram's 195 DMs/hour",
    bg: "bg-pink-subtle",
    color: "text-pink",
  },
  {
    icon: BarChart3,
    title: "Real-time tracking",
    desc: "See every DM sent and comment received",
    bg: "bg-accent",
    color: "text-accent-foreground",
  },
];

function CommentBubble({
  user,
  text,
  keyword,
  delay,
}: {
  user: string;
  text: string;
  keyword: string;
  delay: number;
}) {
  const parts = text.split(new RegExp(`(${keyword})`, "i"));
  return (
    <motion.div
      className="flex items-start gap-2.5 px-3 py-2"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="from-pink to-primary h-7 w-7 shrink-0 rounded-full bg-linear-to-br" />
      <div className="min-w-0">
        <span className="text-foreground text-xs font-bold">{user}</span>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {parts.map((part, i) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
              <span key={i} className="bg-pink-subtle text-pink rounded px-1 font-semibold">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </div>
    </motion.div>
  );
}

function DmPreview() {
  return (
    <motion.div
      className="border-primary/20 bg-primary/5 space-y-2 rounded-2xl border p-3.5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
    >
      <p className="text-primary text-[11px] font-semibold">Auto-DM sent instantly</p>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-[11px]">
          Hi! Here are my top picks from &quot;Summer Skincare&quot;:
        </p>
        <div className="space-y-1">
          {["Vitamin C Serum — ₹499", "SPF 50 Sunscreen — ₹349"].map((item) => (
            <div key={item} className="text-primary/80 flex items-center gap-1 text-[10px]">
              <span>🔗</span> {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AutoDmShowcase() {
  return (
    <section className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-20 xl:px-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="border-border/80 bg-card/80 rounded-3xl border-2 p-6 backdrop-blur-sm sm:p-8 lg:p-12">
          <ScrollFadeIn>
            <div className="mb-10 space-y-2 text-center sm:mb-14">
              <h2 className="heading-playful text-primary text-3xl sm:text-4xl lg:text-5xl">
                Turn Comments into Sales
              </h2>
              <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
                When followers comment a keyword on your reel, they instantly get a DM with your
                product links. Zero manual work.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — Comment → DM simulation */}
            <div className="mx-auto w-full max-w-sm space-y-4 lg:mx-0">
              {/* Instagram-style comment section */}
              <div className="border-border bg-card/90 overflow-hidden rounded-2xl border">
                <div className="border-border/60 flex items-center gap-2 border-b px-3 py-2">
                  <div className="bg-pink h-2 w-2 rounded-full" />
                  <span className="text-[11px] font-semibold text-gray-500">
                    Comments on your reel
                  </span>
                </div>
                <div className="divide-border/40 divide-y">
                  {comments.map((c, i) => (
                    <CommentBubble key={c.user} {...c} delay={0.2 + i * 0.15} />
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <motion.div
                className="text-primary flex justify-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65, duration: 0.3 }}
              >
                <ArrowRight className="h-5 w-5 rotate-90" />
              </motion.div>

              {/* DM Preview */}
              <DmPreview />
            </div>

            {/* Right — Benefits */}
            <div className="space-y-6">
              {benefits.map((b, i) => (
                <ScrollFadeIn key={b.title} delay={0.1 + i * 0.1} offset={12}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${b.bg} ${b.color}`}
                    >
                      <b.icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">{b.title}</h3>
                      <p className="text-muted-foreground mt-0.5 text-sm">{b.desc}</p>
                    </div>
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
