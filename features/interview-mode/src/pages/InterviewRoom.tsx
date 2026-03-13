import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, User, FileText, Star } from 'lucide-react';
import { api } from '../../../../src/services/api';
import { cn } from '../../../../src/lib/utils';

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
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const socket = useRef<any>();
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(savedUser);
    fetchInterview();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      socket.current = io();
      socket.current.emit('join-room', roomId);

      socket.current.on('all-users', (users: string[]) => {
        if (users.length > 0) {
          createPeer(users[0], socket.current.id, currentStream);
        }
      });

      socket.current.on('user-joined', (payload: any) => {
        addPeer(payload.signal, payload.callerID, currentStream);
      });

      socket.current.on('receiving-returned-signal', (payload: any) => {
        peerRef.current.signal(payload.signal);
      });
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socket.current?.disconnect();
    };
  }, [roomId]);

  const fetchInterview = async () => {
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
    });

    peer.on('signal', (signal) => {
      socket.current.emit('sending-signal', { userToSignal, callerID, signal });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });

    peerRef.current = peer;
  };

  const addPeer = (incomingSignal: any, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.current.emit('returning-signal', { signal, callerID });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(incomingSignal);
    peerRef.current = peer;
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
      {/* Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Video size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm">Secure Interview Room</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Session
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Remote Video */}
            <div className="relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl aspect-video flex items-center justify-center">
              {remoteStream ? (
                <video playsInline ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={40} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm">Waiting for candidate to join...</p>
                </div>
              )}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs">
                {user?.role === 'company' ? interview?.student_name : 'Recruiter'}
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl aspect-video flex items-center justify-center">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs">
                You ({user?.name})
              </div>
              {!videoOn && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                   <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                    <User size={40} className="text-slate-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              onClick={toggleMic}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                micOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600"
              )}
            >
              {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button
              onClick={toggleVideo}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                videoOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600"
              )}
            >
              {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button
              onClick={handleEndCall}
              className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-xl shadow-red-900/20"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* Sidebar - Evaluation / Info */}
        <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="font-bold text-white">Interview Details</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Candidate</p>
                <p className="text-sm text-white font-medium">{interview?.student_name}</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${interview?.ai_score}%` }} />
                  </div>
                  <span className="text-xs font-bold text-indigo-400">{interview?.ai_score}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {user?.role === 'company' ? (
              <>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Evaluation Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          rating >= s ? "bg-yellow-500 text-white" : "bg-slate-700 text-slate-500 hover:bg-slate-600"
                        )}
                      >
                        <Star size={18} fill={rating >= s ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Interview Notes</label>
                  <textarea
                    rows={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Write your observations here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => handleSaveEvaluation('scheduled')}
                    disabled={saving}
                    className="w-full py-3 bg-slate-700 text-white text-sm font-bold rounded-xl hover:bg-slate-600 transition-all"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSaveEvaluation('completed')}
                    disabled={saving}
                    className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
                  >
                    Complete Interview
                  </button>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-sm font-bold text-white mb-4">Interview Guidelines</h3>
                <ul className="space-y-4">
                  {[
                    'Ensure a stable internet connection.',
                    'Keep your camera and microphone on.',
                    'Be in a quiet, well-lit environment.',
                    'Keep your resume handy for reference.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-xs text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] shrink-0">{i + 1}</div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
