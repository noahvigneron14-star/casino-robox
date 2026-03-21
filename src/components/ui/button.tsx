import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-0.5 active:translate-y-0 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-md hover:shadow-primary/30",
        destructive: "bg-destructive text-destructive-foreground shadow-destructive/25 hover:shadow-md hover:shadow-destructive/30",
        outline: "border-2 border-border bg-transparent hover:border-primary hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground shadow-secondary/25 hover:shadow-md hover:shadow-secondary/30",
        ghost: "hover:bg-accent/10 hover:text-accent shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:translate-y-0",
        gold: "bg-gradient-to-b from-yellow-400 to-accent text-accent-foreground shadow-accent/25 hover:shadow-md hover:shadow-accent/30 border-b-4 border-yellow-600 active:border-b-0 active:mt-[4px]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
