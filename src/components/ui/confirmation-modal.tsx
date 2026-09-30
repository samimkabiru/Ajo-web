"use client";

import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "accent";
  icon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
  loadingText = "Processing...",
  children,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={title} description={description}>
      <div className="space-y-4 pt-1">
        {children}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted hover:text-ink"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText={loadingText}
            disabled={isLoading}
            className="gap-1.5"
          >
            {!isLoading && icon && (
              <span className="shrink-0 inline-flex items-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[2.2]">
                {icon}
              </span>
            )}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
