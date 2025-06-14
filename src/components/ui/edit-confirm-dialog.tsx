import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface EditConfirmDialogProps {
  isOpen: boolean;
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EditConfirmDialog({ isOpen, planName, onConfirm, onCancel }: EditConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Generated Plan</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to edit the plan <span className="font-medium text-foreground">"{planName}"</span>. 
            This will change the plan status back to draft and remove the currently generated itinerary.
            <br /><br />
            <strong>Are you sure you want to continue?</strong>
            <br /><br />
            <span className="text-sm text-muted-foreground">
              Note: You will need to generate the plan again after making your changes.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Edit Plan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 