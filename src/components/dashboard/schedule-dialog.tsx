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
import { useState } from 'react';
import axios from 'axios';

export function ScheduleDialog() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState('03:00');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/schedule-run', {
        frequency,
        time,
        timezone: 'IST',
      });
      toast({
        title: 'Schedule Saved',
        description: `Your performance tests are now scheduled to run ${frequency} at ${time} IST.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Save Schedule',
        description:
          'Could not save the schedule. Please try again later.',
      });
    } finally {
      setIsSaving(false);
    }
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
            Set up a recurring schedule to automatically run performance tests.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select
              defaultValue="daily"
              onValueChange={setFrequency}
              value={frequency}
            >
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
              Time (IST)
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
