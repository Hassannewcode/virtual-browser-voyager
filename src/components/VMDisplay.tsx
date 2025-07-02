
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

interface VMDisplayProps {
  currentOS: any;
  vmState: 'inactive' | 'active' | 'paused';
  sessionId: string | null;
  browserUrl: string;
  stats: {
    cpu: number;
    ram: number;
    network: number;
  };
  onUrlChange: (url: string) => void;
  onUrlSubmit: () => void;
}

export interface VMDisplayRef {
  getIframeRef: () => HTMLIFrameElement | null;
}

const VMDisplay = forwardRef<VMDisplayRef, VMDisplayProps>(({
  currentOS,
  vmState,
  sessionId,
  browserUrl,
  stats,
  onUrlChange,
  onUrlSubmit
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    getIframeRef: () => iframeRef.current
  }));

  return (
    <Card className="lg:col-span-3 bg-slate-900/50 border-slate-700">
      <CardContent className="p-0">
        {/* Screen Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Virtual Machine Display</span>
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId.substring(0, 12)}...
              </Badge>
            )}
          </div>
          <Badge className={currentOS?.color || 'bg-slate-600'}>
            {currentOS?.name || 'No OS Selected'}
          </Badge>
        </div>

        {/* URL Bar */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 min-w-fit">URL:</span>
            <Input
              type="url"
              value={browserUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onUrlSubmit()}
              className="flex-1 bg-slate-700 border-slate-600 text-white"
              placeholder="Enter website URL"
              disabled={vmState !== 'active'}
            />
            <Button
              size="sm"
              onClick={onUrlSubmit}
              disabled={vmState !== 'active'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go
            </Button>
          </div>
        </div>

        {/* Browser Display */}
        <div className="relative bg-black" style={{ height: '500px' }}>
          {vmState === 'active' ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              title="Virtual Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-links allow-popups allow-downloads"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-medium mb-2 text-slate-300">VM Session Ready</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Select an operating system and click "Power On" to start your virtual browser
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">CPU:</span>
              <span className="font-medium">{stats.cpu}%</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-green-400" />
              <span className="text-slate-400">RAM:</span>
              <span className="font-medium">{stats.ram}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Net:</span>
              <span className="font-medium">{stats.network}KB/s</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span className="text-slate-400">Status:</span>
              <span className="font-medium capitalize">{vmState}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

VMDisplay.displayName = 'VMDisplay';

export default VMDisplay;
