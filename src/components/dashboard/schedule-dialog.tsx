'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '../ui/input';
import { Calendar, Clock, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runLighthouseTests } from '@/ai/flows/run-lighthouse-flow';
import { useState } from 'react';

export function ScheduleDialog() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRunNow = async () => {
    setLoading(true);
    try {
      await runLighthouseTests();
      toast({
        title: 'Tests Running',
        description: 'Lighthouse tests are running in the background. The data will be updated shortly.',
      });
      // Optionally, you can trigger a refresh of the data here or rely on Firestore real-time updates.
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start Lighthouse tests.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Schedule Saved',
      description: 'Your performance tests will run as scheduled. (This is a demo and not actually scheduled).',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Clock className="mr-2 h-4 w-4" />
          Schedule Run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Schedule Tests</DialogTitle>
          <DialogDescription>
            Set up a recurring schedule to automatically run performance tests, or run them now.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select defaultValue="daily">
              <SelectTrigger id="frequency" className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time (UTC)
            </Label>
            <Input id="time" type="time" defaultValue="03:00" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
           <Button type="button" variant="secondary" onClick={handleRunNow} disabled={loading}>
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            Run Now
          </Button>
          <Button type="submit" onClick={handleSave}>
            <Calendar className="mr-2 h-4 w-4" />
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
