"use client"

import * as React from "react"

// Dummy implementation since this component is not used in the project
interface ToasterProps {
  [key: string]: any
}

const Toaster = ({ children, ...props }: ToasterProps) => {
  return <>{children}</>
}

export { Toaster }
