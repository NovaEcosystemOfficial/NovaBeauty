import { Plus } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type FloatingActionButtonProps = {
  label: string;
};

export function FloatingActionButton({ label }: FloatingActionButtonProps) {
  return (
    <PrimaryButton type="button" className="w-full">
      <Plus aria-hidden="true" className="size-5" />
      {label}
    </PrimaryButton>
  );
}
