import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface UseConfirmationProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmationProps>({
    title: "",
    description: "",
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  const confirm = (props: UseConfirmationProps, onConfirm: () => void) => {
    setConfig(props);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
    setOnConfirmCallback(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  };

  const ConfirmationDialog = () => (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
    />
  );

  return {
    confirm,
    ConfirmationDialog,
  };
};
