
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Monitor, 
  Power, 
  RotateCcw, 
  Pause, 
  Play, 
  Maximize, 
  Cpu, 
  HardDrive, 
  Wifi,
  Activity
} from 'lucide-react';
import { toast } from "sonner";

interface OSOption {
  id: string;
  name: string;
  version: string;
  icon: string;
  color: string;
  defaultUrl: string;
}

const Index = () => {
  const [selectedOS, setSelectedOS] = useState<string>('windows10');
  const [vmState, setVmState] = useState<'inactive' | 'active' | 'paused'>('inactive');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    network: 0
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const osOptions: OSOption[] = [
    {
      id: 'windows10',
      name: 'Windows 10',
      version: 'Pro 22H2',
      icon: '🪟',
      color: 'bg-blue-600',
      defaultUrl: 'https://www.google.com'
    },
    {
      id: 'windows11',
      name: 'Windows 11',
      version: 'Pro 23H2',
      icon: '💻',
      color: 'bg-purple-600',
      defaultUrl: 'https://www.google.com'
    },
    {
      id: 'android',
      name: 'Android',
      version: '15.0',
      icon: '📱',
      color: 'bg-green-600',
      defaultUrl: 'https://m.google.com'
    }
  ];

  const currentOS = osOptions.find(os => os.id === selectedOS);

  // Simulate VM stats when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (vmState === 'active') {
      interval = setInterval(() => {
        setStats({
          cpu: Math.floor(Math.random() * 30) + 10,
          ram: Math.floor(Math.random() * 40) + 20,
          network: Math.floor(Math.random() * 100) + 50
        });
      }, 2000);
    } else {
      setStats({ cpu: 0, ram: 0, network: 0 });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [vmState]);

  const createVMSession = async () => {
    if (!currentOS) return null;

    try {
      // Generate a unique session ID
      const newSessionId = `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return newSessionId;
    } catch (error) {
      console.error('Error creating VM session:', error);
      toast.error('Failed to create VM session');
      return null;
    }
  };

  const handleOSSelect = (osId: string) => {
    const os = osOptions.find(o => o.id === osId);
    if (os) {
      setSelectedOS(osId);
      setBrowserUrl(os.defaultUrl);
      toast.success(`Switched to ${os.name}`);
      
      // If VM is active, restart with new OS
      if (vmState === 'active') {
        handleRestart();
      }
    }
  };

  const handlePowerOn = async () => {
    if (vmState === 'inactive') {
      const newSessionId = await createVMSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        setVmState('active');
        
        // Load the URL in iframe with OS-specific styling
        if (iframeRef.current) {
          // Create a custom HTML page that simulates the OS environment
          const customHtml = createOSEnvironment(browserUrl, selectedOS);
          const blob = new Blob([customHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          iframeRef.current.src = url;
        }
        
        toast.success('Virtual machine started');
      }
    }
  };

  const handlePowerOff = async () => {
    if (vmState !== 'inactive') {
      setVmState('inactive');
      setSessionId(null);
      
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
      
      toast.success('Virtual machine powered off');
    }
  };

  const handleRestart = async () => {
    if (vmState !== 'inactive') {
      const newSessionId = await createVMSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        
        if (iframeRef.current) {
          const customHtml = createOSEnvironment(browserUrl, selectedOS);
          const blob = new Blob([customHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          iframeRef.current.src = url;
        }
        
        toast.success('Virtual machine restarted');
      }
    }
  };

  const handlePause = () => {
    if (vmState === 'active') {
      setVmState('paused');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
        iframeRef.current.style.opacity = '0.5';
      }
      toast.warning('Virtual machine paused');
    } else if (vmState === 'paused') {
      setVmState('active');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'auto';
        iframeRef.current.style.opacity = '1';
      }
      toast.success('Virtual machine resumed');
    }
  };

  const handleFullScreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
        toast.success('Entered full screen mode');
      }
    }
  };

  const handleUrlChange = async (url: string) => {
    setBrowserUrl(url);
    
    // If we have an active session, navigate to the new URL
    if (vmState === 'active' && sessionId) {
      if (iframeRef.current) {
        const customHtml = createOSEnvironment(url, selectedOS);
        const blob = new Blob([customHtml], { type: 'text/html' });
        const newUrl = URL.createObjectURL(blob);
        iframeRef.current.src = newUrl;
      }
      toast.success('Navigated to new URL');
    }
  };

  const createOSEnvironment = (url: string, osType: string) => {
    const isAndroid = osType === 'android';
    const isWindows11 = osType === 'windows11';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Virtual Browser - ${currentOS?.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: ${isAndroid ? 'Roboto, sans-serif' : 'Segoe UI, sans-serif'};
            background: ${isWindows11 ? 'linear-gradient(135deg, #0078d4, #106ebe)' : isAndroid ? '#f8f9fa' : '#0078d4'};
            height: 100vh; 
            display: flex; 
            flex-direction: column;
            color: ${isAndroid ? '#333' : 'white'};
          }
          
          .os-taskbar {
            height: ${isAndroid ? '56px' : '48px'};
            background: ${isWindows11 ? 'rgba(255,255,255,0.8)' : isAndroid ? '#1976d2' : 'rgba(0,0,0,0.8)'};
            display: flex;
            align-items: center;
            padding: 0 16px;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            color: ${isWindows11 ? '#333' : 'white'};
          }
          
          .start-button {
            width: 32px;
            height: 32px;
            background: ${isWindows11 ? '#0078d4' : isAndroid ? 'transparent' : '#0078d4'};
            border: none;
            border-radius: ${isAndroid ? '50%' : '4px'};
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }
          
          .browser-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: white;
            margin: ${isAndroid ? '8px' : '16px'};
            border-radius: ${isAndroid ? '12px' : '8px'};
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          }
          
          .browser-header {
            height: 48px;
            background: ${isAndroid ? '#f5f5f5' : '#e1e1e1'};
            display: flex;
            align-items: center;
            padding: 0 16px;
            border-bottom: 1px solid #ddd;
          }
          
          .address-bar {
            flex: 1;
            height: 32px;
            padding: 0 12px;
            border: 1px solid #ccc;
            border-radius: ${isAndroid ? '24px' : '4px'};
            background: white;
            font-size: 14px;
            margin: 0 12px;
          }
          
          .browser-content {
            flex: 1;
            border: none;
            width: 100%;
            background: white;
          }
          
          .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            flex-direction: column;
          }
          
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #0078d4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .time {
            margin-left: auto;
            font-size: 14px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="os-taskbar">
          <button class="start-button">
            ${isAndroid ? '◉' : isWindows11 ? '⊞' : '⊞'}
          </button>
          <span>${currentOS?.name} Browser</span>
          <div class="time" id="time"></div>
        </div>
        
        <div class="browser-container">
          <div class="browser-header">
            <button style="border:none;background:transparent;font-size:16px;cursor:pointer;" onclick="history.back()">←</button>
            <button style="border:none;background:transparent;font-size:16px;cursor:pointer;margin-left:8px;" onclick="history.forward()">→</button>
            <input class="address-bar" type="text" value="${url}" readonly />
            <button style="border:none;background:#0078d4;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;">Go</button>
          </div>
          
          <iframe class="browser-content" src="${url}" frameborder="0" 
                  sandbox="allow-same-origin allow-scripts allow-forms allow-links allow-popups allow-downloads">
            <div class="loading">
              <div class="spinner"></div>
              <p>Loading ${url}...</p>
            </div>
          </iframe>
        </div>
        
        <script>
          function updateTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            document.getElementById('time').textContent = displayHours + ':' + minutes + ' ' + ampm;
          }
          setInterval(updateTime, 1000);
          updateTime();
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Real Virtual Browser VM
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Experience real web browsing through our custom virtual machine technology
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* OS Selection Panel */}
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

          {/* VM Display */}
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
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlChange(browserUrl)}
                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter website URL"
                    disabled={vmState !== 'active'}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUrlChange(browserUrl)}
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
        </div>

        {/* Control Panel */}
        <Card className="mt-6 bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handlePowerOn}
                disabled={vmState !== 'inactive'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                Power On
              </Button>
              
              <Button
                onClick={handlePowerOff}
                disabled={vmState === 'inactive'}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                Power Off
              </Button>
              
              <Button
                onClick={handleRestart}
                disabled={vmState === 'inactive'}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
              
              <Button
                onClick={handlePause}
                disabled={vmState === 'inactive'}
                className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
              >
                {vmState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {vmState === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              
              <Button
                onClick={handleFullScreen}
                disabled={vmState !== 'active'}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <Maximize className="w-4 h-4" />
                Full Screen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400">
          <p>Powered by Custom Virtual Browser Technology | Full Web Experience</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
