
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";

interface OSOption {
  id: string;
  name: string;
  version: string;
  icon: string;
  color: string;
  defaultUrl: string;
}

export const useVirtualMachine = (osOptions: OSOption[]) => {
  const [selectedOS, setSelectedOS] = useState<string>('windows10');
  const [vmState, setVmState] = useState<'inactive' | 'active' | 'paused'>('inactive');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    network: 0
  });

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
      const newSessionId = `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return newSessionId;
    } catch (error) {
      console.error('Error creating VM session:', error);
      toast.error('Failed to create VM session');
      return null;
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

  return {
    selectedOS,
    setSelectedOS,
    vmState,
    setVmState,
    browserUrl,
    setBrowserUrl,
    sessionId,
    setSessionId,
    stats,
    currentOS,
    createVMSession,
    createOSEnvironment
  };
};
