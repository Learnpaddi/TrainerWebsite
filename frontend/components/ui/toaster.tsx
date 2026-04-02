import {
  useToast,
  Toaster as SonnerToaster,
} from "@/components/ui/sonner"

const Toaster = ({ ...props }) => {
  const { toasts } = useToast()

  return <SonnerToaster portal={true} {...props} />
}

export { Toaster }

