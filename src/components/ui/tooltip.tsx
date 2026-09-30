"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-lg px-2.5 py-1 text-xs font-medium tracking-normal select-none pointer-events-none shadow-elevation",
        // Light mode: solid ink with crisp white text
        "bg-ink text-white",
        // Dark mode: elevated charcoal surface with subtle border
        "dark:bg-[#1E2330] dark:text-[#EDF0F4] dark:border dark:border-white/14 dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-ink dark:fill-[#1E2330]" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Convenient 1-line wrapper around Radix Tooltip
 * Example: <SimpleTooltip content="Online status"><span ... /></SimpleTooltip>
 */
export function SimpleTooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 120,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  className?: string;
}) {
  if (!content) return <>{children}</>;

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Global site-wide browser tooltip suppressor.
 * Automatically strips native HTML `title` attributes on hover so the browser's
 * ugly unstyled default tooltip never appears.
 */
export function GlobalTooltipSuppressor() {
  React.useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("[title]");
      if (target && target instanceof HTMLElement && target.hasAttribute("title")) {
        const titleValue = target.getAttribute("title");
        if (titleValue) {
          if (!target.getAttribute("aria-label")) {
            target.setAttribute("aria-label", titleValue);
          }
          target.setAttribute("data-suppressed-title", titleValue);
          target.removeAttribute("title");
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mouseover", handleMouseOver, { capture: true });
    };
  }, []);

  return null;
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
