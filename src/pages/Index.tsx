
import React, { useRef } from 'react';
import OSSelection from '@/components/OSSelection';
import VMDisplay, { VMDisplayRef } from '@/components/VMDisplay';
import ControlPanel from '@/components/ControlPanel';
import { useVirtualMachine } from '@/hooks/useVirtualMachine';
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
  const vmDisplayRef = useRef<VMDisplayRef>(null);

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

  const {
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
  } = useVirtualMachine(osOptions);

  const handleOSSelect = (osId: string) => {
    const os = osOptions.find(o => o.id === osId);
    if (os) {
      setSelectedOS(osId);
      setBrowserUrl(os.defaultUrl);
      
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
        
        const iframeRef = vmDisplayRef.current?.getIframeRef();
        if (iframeRef) {
          const customHtml = createOSEnvironment(browserUrl, selectedOS);
          const blob = new Blob([customHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          iframeRef.src = url;
        }
        
        toast.success('Virtual machine started');
      }
    }
  };

  const handlePowerOff = async () => {
    if (vmState !== 'inactive') {
      setVmState('inactive');
      setSessionId(null);
      
      const iframeRef = vmDisplayRef.current?.getIframeRef();
      if (iframeRef) {
        iframeRef.src = '';
      }
      
      toast.success('Virtual machine powered off');
    }
  };

  const handleRestart = async () => {
    if (vmState !== 'inactive') {
      const newSessionId = await createVMSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        
        const iframeRef = vmDisplayRef.current?.getIframeRef();
        if (iframeRef) {
          const customHtml = createOSEnvironment(browserUrl, selectedOS);
          const blob = new Blob([customHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          iframeRef.src = url;
        }
        
        toast.success('Virtual machine restarted');
      }
    }
  };

  const handlePause = () => {
    if (vmState === 'active') {
      setVmState('paused');
      const iframeRef = vmDisplayRef.current?.getIframeRef();
      if (iframeRef) {
        iframeRef.style.pointerEvents = 'none';
        iframeRef.style.opacity = '0.5';
      }
      toast.warning('Virtual machine paused');
    } else if (vmState === 'paused') {
      setVmState('active');
      const iframeRef = vmDisplayRef.current?.getIframeRef();
      if (iframeRef) {
        iframeRef.style.pointerEvents = 'auto';
        iframeRef.style.opacity = '1';
      }
      toast.success('Virtual machine resumed');
    }
  };

  const handleFullScreen = () => {
    const iframeRef = vmDisplayRef.current?.getIframeRef();
    if (iframeRef) {
      if (iframeRef.requestFullscreen) {
        iframeRef.requestFullscreen();
        toast.success('Entered full screen mode');
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setBrowserUrl(url);
  };

  const handleUrlSubmit = async () => {
    if (vmState === 'active' && sessionId) {
      const iframeRef = vmDisplayRef.current?.getIframeRef();
      if (iframeRef) {
        const customHtml = createOSEnvironment(browserUrl, selectedOS);
        const blob = new Blob([customHtml], { type: 'text/html' });
        const newUrl = URL.createObjectURL(blob);
        iframeRef.src = newUrl;
      }
      toast.success('Navigated to new URL');
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
            Experience real web browsing through our custom virtual machine technology
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <OSSelection
            osOptions={osOptions}
            selectedOS={selectedOS}
            vmState={vmState}
            onOSSelect={handleOSSelect}
          />

          <VMDisplay
            ref={vmDisplayRef}
            currentOS={currentOS}
            vmState={vmState}
            sessionId={sessionId}
            browserUrl={browserUrl}
            stats={stats}
            onUrlChange={handleUrlChange}
            onUrlSubmit={handleUrlSubmit}
          />
        </div>

        <ControlPanel
          vmState={vmState}
          onPowerOn={handlePowerOn}
          onPowerOff={handlePowerOff}
          onRestart={handleRestart}
          onPause={handlePause}
          onFullScreen={handleFullScreen}
        />

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400">
          <p>Powered by Custom Virtual Browser Technology | Full Web Experience</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
