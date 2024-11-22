import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/settings";

export function SettingsDialog() {
  const { showNotifications, toggleNotifications } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between">
            <label htmlFor="notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Show notifications
            </label>
            <Switch
              id="notifications"
              checked={showNotifications}
              onCheckedChange={toggleNotifications}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}