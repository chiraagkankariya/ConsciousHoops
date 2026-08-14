"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconWrapClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconWrapClassName,
  titleClassName,
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 select-none flex-col justify-between rounded-xl border border-sand-dark bg-sand px-5 py-4",
        className,
      )}
    >
      <div className="relative z-10 flex items-center gap-3">
        {icon && (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full bg-terra text-cream",
              iconWrapClassName,
            )}
          >
            {icon}
          </span>
        )}
        <h3
          className={cn(
            "w-full text-center font-display text-lg font-bold text-charcoal",
            titleClassName,
          )}
        >
          {title}
        </h3>
      </div>
      <p className="relative z-10 text-sm text-muted-text">{description}</p>
      <p className="relative z-10 text-xs uppercase tracking-widest text-muted-text">
        {date}
      </p>
    </div>
  );
}

export interface DisplayCardsProps {
  cards: DisplayCardProps[];
  className?: string;
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4",
        "grid-cols-1 sm:grid-cols-3",
        className,
      )}
    >
      {cards.map((card, i) => (
        <DisplayCard key={i} {...card} />
      ))}
    </div>
  );
}
