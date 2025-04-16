"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Chart({ className, ...props }: ChartProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartContainer({ className, ...props }: ChartContainerProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartTooltipProps {
  content: React.ReactNode
  className?: string
}

export function ChartTooltip({ content, className, ...props }: ChartTooltipProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>) {
  return <div className={cn("", className)} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltipContent({ className, ...props }: ChartTooltipContentProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-2 text-sm shadow-md dark:border-neutral-800 dark:bg-neutral-950",
        className
      )}
      {...props}
    />
  )
}

interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartLegend({ className, ...props }: ChartLegendProps) {
  return <div className={cn("flex flex-wrap items-center gap-4", className)} {...props} />
}

interface ChartLegendItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  color: string
}

export function ChartLegendItem({ name, color, className, ...props }: ChartLegendItemProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}</span>
    </div>
  )
}
