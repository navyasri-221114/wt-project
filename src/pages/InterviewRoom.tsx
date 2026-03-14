import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, User, FileText, Star, ShieldAlert, Maximize, X, ClipboardList, Send, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function InterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [notes, setNotes] = useState('');
  const [violations, setViolations] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [peerConnected, setPeerConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'code' | 'eval'>('info');
  const [showChat, setShowChat] = useState(true);
  const [code, setCode] = useState('// Your technical whiteboard...\n\nfunction solution() {\n  \n}');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const socket = useRef<any>();
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(savedUser);
    fetchInterview();

    // Proctoring Logic
    const handleVisibilityChange = () => {
      if (document.hidden && savedUser.role === 'student') {
        setViolations(v => v + 1);
        alert("WARNING: You switched tabs! This violation is being recorded. Multiple violations will lead to disqualification.");
      }
    };

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    const preventUnauthorized = (e: KeyboardEvent) => {
      if (savedUser.role === 'student' && (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u')) || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      )) {
        e.preventDefault();
        alert("Action Restricted: This is a secure interview environment.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (savedUser.role === 'student') {
        e.preventDefault();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('keydown', preventUnauthorized);
    window.addEventListener('contextmenu', handleContextMenu);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        
        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        console.log("Connecting socket to:", socketUrl);
        
        socket.current = io(socketUrl, {
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnectionAttempts: 5,
          timeout: 10000
        });

        socket.current.on('connect', () => {
          console.log("Socket connected successfully with ID:", socket.current.id);
          socket.current.emit('join-room', roomId);
        });

        socket.current.on('connect_error', (error: any) => {
          console.error("Socket connection error:", error);
        });

        socket.current.on('all-users', (users: string[]) => {
          console.log("Joined room. Users already in room:", users);
          if (users.length > 0) {
            // Initiate connection to the first user found
            createPeer(users[0], socket.current.id, currentStream);
          }
        });

        socket.current.on('user-joined', (payload: any) => {
          console.log("New user joined the room. Signaling...");
          addPeer(payload.signal, payload.callerID, currentStream);
        });

        socket.current.on('receiving-returned-signal', (payload: any) => {
          console.log("Received returned signal. Peer connection completing...");
          if (peerRef.current) {
            peerRef.current.signal(payload.signal);
          }
        });

        socket.current.on('new-message', (msg: any) => {
          setMessages(prev => [...prev, msg]);
        });

        socket.current.on('scratchpad-updated', (newCode: string) => {
          setCode(newCode);
        });
      })
      .catch(err => {
        console.error("Media devices access denied:", err);
        alert("Could not access camera/microphone. Please ensure permissions are granted.");
      });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socket.current?.disconnect();
      // ... same listeners cleanup ...
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('keydown', preventUnauthorized);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [roomId]);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const enterFullScreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    }
  };

  const fetchInterview = async () => {
    if (!roomId || roomId === 'undefined') {
      alert("Invalid Interview Room ID. Please join from your dashboard.");
      navigate('/dashboard');
      return;
    }
    try {
      const res = await api.interviews.getRoom(roomId!);
      setInterview(res);
      setNotes(res.recruiter_notes || '');
      setRating(res.evaluation_rating || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const createPeer = (userToSignal: string, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ] 
      }
    });

    peer.on('signal', (signal) => {
      socket.current.emit('sending-signal', { userToSignal, callerID, signal });
    });

    peer.on('stream', (remoteStream) => {
      console.log("Received Remote Stream (Initiator)");
      setRemoteStream(remoteStream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log("Peer Connection Established! (Initiator)");
      setPeerConnected(true);
    });
    peer.on('close', () => {
      console.log("Peer Connection Closed. (Initiator)");
      setPeerConnected(false);
    });
    peer.on('error', (err) => {
      console.error("Peer Error: (Initiator)", err);
    });

    peerRef.current = peer;
  };

  const addPeer = (incomingSignal: any, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ] 
      }
    });

    peer.on('signal', (signal) => {
      socket.current.emit('returning-signal', { signal, callerID });
    });

    peer.on('stream', (remoteStream) => {
      console.log("Received Remote Stream");
      setRemoteStream(remoteStream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log("Peer Connection (initiator: false) Established!");
      setPeerConnected(true);
    });
    peer.on('close', () => {
      console.log("Peer Connection (initiator: false) Closed.");
      setPeerConnected(false);
    });
    peer.on('error', (err) => {
      console.error("Peer Error (initiator: false):", err);
    });

    peer.signal(incomingSignal);
    peerRef.current = peer;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.current.emit('send-message', {
      text: newMessage,
      sender: user?.name || 'Anonymous'
    });
    setNewMessage('');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socket.current.emit('update-scratchpad', newCode);
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  const handleEndCall = () => {
    stream?.getTracks().forEach(track => track.stop());
    navigate('/dashboard');
  };

  const handleSaveEvaluation = async (status: string = 'scheduled') => {
    setSaving(true);
    try {
      await api.interviews.evaluate(interview.id, { notes, rating, status });
      alert('Evaluation saved successfully');
      if (status === 'completed') navigate('/dashboard');
    } catch (err) {
      alert('Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Strict Mode Overlay Warning for Student */}
      {user?.role === 'student' && !isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Strict Proctoring Active</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              This interview environment is strictly monitored. To continue, you must enter full-screen mode. 
              Leaving full-screen or switching tabs will be recorded as a violation.
            </p>
            <button
              onClick={enterFullScreen}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-indigo-500/20"
            >
              <Maximize size={20} /> Enter Full-Screen
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm">Secure Interview Room</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none mt-1">
              {violations > 0 ? (
                <span className="text-red-500">Violations Recorded: {violations}</span>
              ) : (
                <span className="text-green-500">System Integrity: Secure</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-xs font-bold">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px]",
              peerConnected ? "bg-green-500 shadow-green-500/50" : "bg-yellow-500 shadow-yellow-500/50"
            )} />
            {peerConnected ? 'Connection Stable' : 'Establishing Peer Link...'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
            {/* Remote Video */}
            <div className="relative bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl aspect-video flex items-center justify-center group">
              {remoteStream ? (
                <video playsInline ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-600">
                    <User size={40} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm font-bold tracking-tight">Waiting for participant...</p>
                </div>
              )}
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest">
                {user?.role === 'company' ? (interview?.student_name || 'Candidate') : 'Interviewer'}
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl aspect-video flex items-center justify-center">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest">
                You ({user?.name})
              </div>
              {!videoOn && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                   <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center border-4 border-slate-600">
                    <User size={40} className="text-slate-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 py-6 border-t border-slate-800">
            <button
              onClick={toggleMic}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                micOn ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
              )}
            >
              {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button
              onClick={toggleVideo}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                videoOn ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
              )}
            >
              {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl border",
                showChat ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              )}
            >
              <MessageSquare size={24} />
            </button>
            <button
              onClick={handleEndCall}
              className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* Sidebar - Evaluation / Info */}
        <div className="w-[450px] bg-slate-800/80 backdrop-blur-2xl border-l border-slate-700 flex flex-col overflow-hidden shadow-2xl relative">
          {/* Sidebar Tabs */}
          <div className="flex bg-slate-900/50 p-2 border-b border-slate-700/50">
            <button 
              onClick={() => setActiveTab('info')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'info' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <FileText size={16} /> Info
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'chat' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <MessageSquare size={16} /> Chat
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'code' ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Terminal size={16} /> Code
            </button>
            {user?.role === 'company' && (
              <button 
                onClick={() => setActiveTab('eval')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === 'eval' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <ClipboardList size={16} /> Eval
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'info' && (
              <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg tracking-tight">Interview Details</h2>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Session ID: {roomId?.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700 space-y-4">
                     <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Candidate Name</p>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded-md border border-green-500/20 tracking-tighter">VERIFIED</span>
                     </div>
                     <p className="text-white font-bold text-xl">{interview?.student_name}</p>
                     <div className="h-px bg-slate-800" />
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase text-[9px]">Position</span>
                        <span className="text-indigo-400 font-black uppercase tracking-widest">Software Engineer</span>
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="text-amber-500" size={16} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Security Protocols</h3>
                   </div>
                   <ul className="space-y-3">
                    {[
                      'Environment must be private and quiet.',
                      'Camera must show full face at all times.',
                      'Tab-switching is strictly prohibited.',
                      'All session data is encrypted and recorded.'
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-4 p-4 bg-slate-900/30 border border-slate-700/50 rounded-2xl text-[11px] text-slate-400 leading-relaxed font-bold">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/20">{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <MessageSquare size={48} className="text-slate-600 mb-4" />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-loose">No Messages Yet<br/>Secure Channel Ready</p>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={cn(
                        "flex flex-col gap-1.5 max-w-[85%]",
                        m.sender === (user?.name || 'Anonymous') ? "ml-auto items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.sender}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl",
                          m.sender === (user?.name || 'Anonymous') 
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10" 
                            : "bg-slate-700 text-slate-200 rounded-tl-none shadow-slate-900/50"
                        )}>
                          {m.text}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-6 bg-slate-900/50 border-t border-slate-700/50">
                  <form onSubmit={sendMessage} className="relative">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Transmission secure. Type here..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-5 pr-14 text-sm text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-600"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Terminal size={18} className="text-emerald-400" />
                    Technical Sandbox
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">Sync Live</span>
                  </div>
                </div>
                <div className="flex-1 p-4 bg-slate-950/50">
                   <textarea
                     value={code}
                     onChange={(e) => handleCodeChange(e.target.value)}
                     className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm outline-none resize-none p-4 custom-scrollbar leading-relaxed"
                     spellCheck={false}
                   />
                </div>
              </div>
            )}

            {activeTab === 'eval' && user?.role === 'company' && (
              <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Candidate Mastery Rating</label>
                  <div className="flex justify-between bg-slate-900/50 p-2 rounded-2xl border border-slate-700">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          rating >= s ? "bg-yellow-500 text-slate-900 font-bold" : "text-slate-500 hover:text-white"
                        )}
                      >
                        <Star size={20} fill={rating >= s ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Recruiter Observation Logs</label>
                   <textarea
                     rows={8}
                     className="w-full bg-slate-900 border border-slate-700 rounded-[2rem] p-6 text-sm text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-600 resize-none custom-scrollbar"
                     placeholder="Document skills, soft-skills, and technical prowess..."
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                   />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button
                    onClick={() => handleSaveEvaluation('completed')}
                    disabled={saving}
                    className="w-full py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                  >
                    Complete Interview & Finalize
                  </button>
                  <button
                    onClick={() => handleSaveEvaluation('scheduled')}
                    disabled={saving}
                    className="w-full py-5 bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-600 transition-all border border-slate-600 flex items-center justify-center gap-3"
                  >
                    Save Progress Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
