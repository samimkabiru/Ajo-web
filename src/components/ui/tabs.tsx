"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (val: string) => void;
  layoutId: string;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
  layoutId: "defaultTabPill",
});

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  layoutId?: string;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ defaultValue, value, onValueChange, layoutId = "defaultTabPill", children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const currentVal = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (value === undefined) {
        setInternalValue(val);
      }
      onValueChange?.(val);
    },
    [onValueChange, value]
  );

  return (
    <TabsContext.Provider
      value={{
        activeTab: currentVal,
        setActiveTab: handleValueChange,
        layoutId,
      }}
    >
      <TabsPrimitive.Root
        ref={ref}
        value={currentVal}
        onValueChange={handleValueChange}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start rounded-[12px] bg-canvas p-1 border border-[#E5E7EB] text-muted select-none max-w-full overflow-x-auto no-scrollbar relative shadow-xs shrink-0",
      "dark:bg-[#0F1117] dark:border-white/10",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, value, onClick, ...props }, ref) => {
  const { activeTab, setActiveTab, layoutId } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      onClick={(e) => {
        setActiveTab(value);
        onClick?.(e);
      }}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 touch-press select-none",
        isActive ? "text-ink font-bold" : "text-muted hover:text-ink",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-[9px] bg-surface shadow-xs border border-[#E5E7EB] z-0 dark:bg-[#1E2330] dark:border-indigo-400/22 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </TabsPrimitive.Trigger>
  );
});
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
