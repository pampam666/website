import * as React from "react"
import { Root, Trigger, Content } from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => (
  <Root>
    <Trigger asChild>
      <button className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-left hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary">
        <span>Dialog Trigger</span>
        <X className="h-4 w-4" />
      </button>
    </Trigger>
    <Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-slate-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute right-4 top-4">
        <button
          onClick={() => document.dispatchEvent(new CustomEvent("close-dialog", { detail: {} }))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Content>
  </Root>
))

Dialog.displayName = "Dialog"

export { Dialog }
