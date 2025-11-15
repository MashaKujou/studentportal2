"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  title: string
  description?: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<ConfirmDialogProps | null>(null)

  const open = (config: ConfirmDialogProps) => setDialog(config)
  const close = () => setDialog(null)

  return { dialog, open, close }
}

export const ConfirmDialog: React.FC<{
  config: ConfirmDialogProps | null
  onConfirm: () => void
  onCancel: () => void
}> = ({ config, onConfirm, onCancel }) => {
  if (!config) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg p-6 max-w-sm">
        <h2 className="font-semibold text-lg mb-2">{config.title}</h2>
        {config.description && <p className="text-muted-foreground text-sm mb-6">{config.description}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {config.cancelText || "Cancel"}
          </Button>
          <Button onClick={onConfirm} variant={config.isDangerous ? "destructive" : "default"}>
            {config.confirmText || "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  )
}
