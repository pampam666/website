import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border",
  {
    variants: {
      variant: {
        default: "bg-white border-slate-200 shadow-sm",
        hover: "bg-slate-50 border-slate-300 shadow-md",
        outline: "border-2 border-slate-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant }),
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

export { Card, cardVariants }
