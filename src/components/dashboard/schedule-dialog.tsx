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

// Note: The run now functionality has been moved to the new TestRunner component.
// This dialog is now for demonstration of a scheduled run config.

export function ScheduleDialog() {
  const { toast } = useToast();
  
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
            Set up a recurring schedule to automatically run performance tests.
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
          <Button type="submit" onClick={handleSave}>
            <Calendar className="mr-2 h-4 w-4" />
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
