"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start rounded-[12px] bg-canvas p-1 border border-line text-muted select-none w-full sm:w-auto relative",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  isActive?: boolean;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-[9px] px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 touch-press",
      "text-muted hover:text-ink data-[state=active]:text-ink data-[state=active]:shadow-xs",
      className
    )}
    {...props}
  >
    {/* Floating animated pill */}
    <span className="relative z-10 flex items-center gap-2">{children}</span>
    <span className="absolute inset-0 z-0 rounded-[9px] bg-surface opacity-0 data-[state=active]:opacity-100 shadow-[0_1px_3px_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.04)] border border-line/60 transition-opacity" />
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
