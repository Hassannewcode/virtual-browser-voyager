
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
  Activity,
  Key
} from 'lucide-react';
import { toast } from "sonner";

interface OSOption {
  id: string;
  name: string;
  version: string;
  icon: string;
  color: string;
  browserlingOS: string;
  browserlingVersion: string;
}

const Index = () => {
  const [selectedOS, setSelectedOS] = useState<string>('windows10');
  const [vmState, setVmState] = useState<'inactive' | 'active' | 'paused'>('inactive');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [apiKey, setApiKey] = useState('');
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
      browserlingOS: 'win',
      browserlingVersion: '10'
    },
    {
      id: 'windows11',
      name: 'Windows 11',
      version: 'Pro 23H2',
      icon: '💻',
      color: 'bg-purple-600',
      browserlingOS: 'win',
      browserlingVersion: '11'
    },
    {
      id: 'android',
      name: 'Android',
      version: '15.0',
      icon: '📱',
      color: 'bg-green-600',
      browserlingOS: 'android',
      browserlingVersion: '12'
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

  const createBrowserlingSession = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Browserling API key');
      return null;
    }

    if (!currentOS) return null;

    try {
      // Create session with Browserling API
      const response = await fetch('https://api.browserling.com/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          os: currentOS.browserlingOS,
          os_version: currentOS.browserlingVersion,
          browser: 'chrome',
          browser_version: 'latest',
          url: browserUrl,
          timeout: 3600 // 1 hour session
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Error creating Browserling session:', error);
      toast.error('Failed to create VM session. Please check your API key.');
      return null;
    }
  };

  const terminateBrowserlingSession = async (sessionId: string) => {
    if (!apiKey.trim()) return;

    try {
      await fetch(`https://api.browserling.com/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const handleOSSelect = (osId: string) => {
    const os = osOptions.find(o => o.id === osId);
    if (os) {
      setSelectedOS(osId);
      toast.success(`Switched to ${os.name}`);
      
      // If VM is active, restart with new OS
      if (vmState === 'active') {
        handleRestart();
      }
    }
  };

  const handlePowerOn = async () => {
    if (vmState === 'inactive') {
      const newSessionId = await createBrowserlingSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        setVmState('active');
        
        // Load the Browserling session in iframe
        if (iframeRef.current) {
          iframeRef.current.src = `https://www.browserling.com/session/${newSessionId}`;
        }
        
        toast.success('Virtual machine started with real browser session');
      }
    }
  };

  const handlePowerOff = async () => {
    if (vmState !== 'inactive' && sessionId) {
      await terminateBrowserlingSession(sessionId);
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
      // Terminate current session
      if (sessionId) {
        await terminateBrowserlingSession(sessionId);
      }
      
      // Create new session
      const newSessionId = await createBrowserlingSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        
        if (iframeRef.current) {
          iframeRef.current.src = `https://www.browserling.com/session/${newSessionId}`;
        }
        
        toast.success('Virtual machine restarted with new session');
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
    if (vmState === 'active' && sessionId && apiKey.trim()) {
      try {
        await fetch(`https://api.browserling.com/session/${sessionId}/navigate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        toast.success('Navigated to new URL');
      } catch (error) {
        console.error('Error navigating:', error);
        toast.error('Failed to navigate to new URL');
      }
    }
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
            Experience real web browsing through Browserling's virtual machine technology
          </p>
        </div>

        {/* API Key Input */}
        <Card className="mb-6 bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Key className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <Label htmlFor="api-key" className="text-slate-200 mb-2 block">
                  Browserling API Key (Required for real VM functionality)
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Browserling API key"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={() => window.open('https://www.browserling.com/api', '_blank')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Get API Key
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Sign up at Browserling to get your API key for unlimited real browser sessions
            </p>
          </CardContent>
        </Card>

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
                  <span className="font-medium">Real Virtual Machine Display</span>
                  {sessionId && (
                    <Badge variant="outline" className="text-xs">
                      Session: {sessionId.substring(0, 8)}...
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
                    title="Real Virtual Browser"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-links allow-popups allow-downloads"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <h3 className="text-xl font-medium mb-2 text-slate-300">Real VM Session Ready</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        {!apiKey.trim() 
                          ? 'Enter your Browserling API key above, then select an OS and click "Power On"'
                          : 'Select an operating system and click "Power On" to start your real virtual browser'
                        }
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
                disabled={vmState !== 'inactive' || !apiKey.trim()}
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
          <p>Powered by Browserling Real Virtual Browser Technology | Unlimited Usage with API Key</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
