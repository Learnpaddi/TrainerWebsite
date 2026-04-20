/// <reference types="vite/client" />

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.sass' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_LEARNING_API_URL?: string
  readonly VITE_RAZORPAY_KEY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  Razorpay?: new (options: {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    theme?: { color?: string }
    handler: (response: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }) => void
  }) => { open: () => void }
}
