/**
 * EdgeWeightDialog - Modal for entering edge weight when creating edges
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EdgeWeightDialogProps {
  open: boolean;
  sourceLabel: string;
  targetLabel: string;
  onConfirm: (weight: number) => void;
  onCancel: () => void;
}

export function EdgeWeightDialog({
  open,
  sourceLabel,
  targetLabel,
  onConfirm,
  onCancel,
}: EdgeWeightDialogProps) {
  const [weight, setWeight] = useState('1');
  const [error, setError] = useState('');
  
  const handleConfirm = () => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      setError('Please enter a positive number');
      return;
    }
    onConfirm(numWeight);
    setWeight('1');
    setError('');
  };
  
  const handleCancel = () => {
    setWeight('1');
    setError('');
    onCancel();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Add Edge</DialogTitle>
          <DialogDescription>
            Create an edge from <span className="font-mono text-primary">{sourceLabel}</span> to{' '}
            <span className="font-mono text-primary">{targetLabel}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Edge Weight</Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Enter weight..."
              className="font-mono"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add Edge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
