
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, RotateCcw, Pause, Play, Maximize } from 'lucide-react';

interface ControlPanelProps {
  vmState: 'inactive' | 'active' | 'paused';
  onPowerOn: () => void;
  onPowerOff: () => void;
  onRestart: () => void;
  onPause: () => void;
  onFullScreen: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  vmState,
  onPowerOn,
  onPowerOff,
  onRestart,
  onPause,
  onFullScreen
}) => {
  return (
    <Card className="mt-6 bg-slate-900/50 border-slate-700">
      <CardContent className="p-6">
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={onPowerOn}
            disabled={vmState !== 'inactive'}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Power className="w-4 h-4" />
            Power On
          </Button>
          
          <Button
            onClick={onPowerOff}
            disabled={vmState === 'inactive'}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Power className="w-4 h-4" />
            Power Off
          </Button>
          
          <Button
            onClick={onRestart}
            disabled={vmState === 'inactive'}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
          
          <Button
            onClick={onPause}
            disabled={vmState === 'inactive'}
            className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
          >
            {vmState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {vmState === 'paused' ? 'Resume' : 'Pause'}
          </Button>
          
          <Button
            onClick={onFullScreen}
            disabled={vmState !== 'active'}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Maximize className="w-4 h-4" />
            Full Screen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
