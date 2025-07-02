
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface OSOption {
  id: string;
  name: string;
  version: string;
  icon: string;
  color: string;
  defaultUrl: string;
}

interface OSSelectionProps {
  osOptions: OSOption[];
  selectedOS: string;
  vmState: 'inactive' | 'active' | 'paused';
  onOSSelect: (osId: string) => void;
}

const OSSelection: React.FC<OSSelectionProps> = ({
  osOptions,
  selectedOS,
  vmState,
  onOSSelect
}) => {
  const handleOSSelect = (osId: string) => {
    const os = osOptions.find(o => o.id === osId);
    if (os) {
      onOSSelect(osId);
      toast.success(`Switched to ${os.name}`);
    }
  };

  return (
    <Card className="lg:col-span-1 bg-slate-900/50 border-slate-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-200 border-b border-slate-700 pb-3">
          Operating Systems
        </h2>
        
        <div className="space-y-4">
          {osOptions.map((os) => (
            <div
              key={os.id}
              onClick={() => handleOSSelect(os.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                selectedOS === os.id
                  ? 'border-blue-500 bg-slate-800/70 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${os.color} flex items-center justify-center text-2xl`}>
                  {os.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{os.name}</h3>
                  <p className="text-sm text-slate-400">{os.version}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedOS === os.id && vmState === 'active' 
                    ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                    : selectedOS === os.id && vmState === 'paused'
                    ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                    : 'bg-slate-600'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OSSelection;
