export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}