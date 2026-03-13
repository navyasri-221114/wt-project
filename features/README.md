# Special Features Team - Development Guide

## 👥 Team: Jessy (Solo)

## 🎯 Responsibilities

- ✅ AI Integration (Google Gemini API)
- ✅ Interview Room implementation
- ✅ WebRTC video streaming
- ✅ Real-time communication (Socket.io)
- ✅ Interview recording setup

---

## 📁 Folder Structure

```
features/
├── ai-integration/         # AI Service Module
│   └── src/
│       ├── aiService.ts    # Gemini API integration
│       └── types.ts        # AI-related types
│
└── interview-mode/         # Interview Room Module
    └── src/
        ├── pages/
        │   └── InterviewRoom.tsx    # Main interview UI
        ├── components/
        │   ├── VideoWindow.tsx      # Video display
        │   ├── Controls.tsx         # Camera, mic controls
        │   ├── ChatBox.tsx          # Messages
        │   └── ScreenShare.tsx      # Screen sharing
        └── services/
            ├── webrtc.ts           # Peer connections
            └── socket.ts           # Socket.io events
```

---

## 🚀 Quick Start

```bash
# AI Integration
cd features/ai-integration
npm run dev

# Interview Mode
cd features/interview-mode
npm run dev
```

---

## 🤖 AI Integration Module

### What Goes Here

The AI integration module handles all Gemini API calls for:
- Interview question generation
- Student skill assessment
- Feedback generation
- Resume analysis

### File: `features/ai-integration/src/aiService.ts`

```typescript
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

export async function generateInterviewQuestions(
  role: string,
  skills: string[],
  difficulty: 'easy' | 'medium' | 'hard'
) {
  const prompt = `Generate 5 ${difficulty} interview questions for a ${role} position with skills: ${skills.join(', ')}`;
  
  const response = await genAI.generateContent(prompt);
  return response.response.text();
}

export async function generateFeedback(
  studentName: string,
  performance: string,
  answers: string[]
) {
  const prompt = `Provide constructive feedback for student ${studentName} based on their performance: ${performance}. Answers: ${answers.join(', ')}`;
  
  const response = await genAI.generateContent(prompt);
  return response.response.text();
}

export async function analyzeResume(resumeText: string) {
  const prompt = `Analyze this resume and provide insights:\n\n${resumeText}`;
  
  const response = await genAI.generateContent(prompt);
  return response.response.text();
}
```

### Usage in Other Modules

```typescript
import * as aiService from '../features/ai-integration/src/aiService';

// In interview room
const questions = await aiService.generateInterviewQuestions(
  'Software Engineer',
  ['JavaScript', 'React', 'Node.js'],
  'medium'
);

// Get feedback
const feedback = await aiService.generateFeedback(
  'John Doe',
  'good performance',
  answers
);
```

---

## 🎥 Interview Room Module

### What Goes Here

The interview room is where students and interviewers meet for live interviews:
- Video/audio streaming
- Screen sharing
- Real-time chat
- Interview controls
- Recording

### Main Component: `features/interview-mode/src/pages/InterviewRoom.tsx`

```typescript
import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { Socket } from 'socket.io-client';
import { VideoWindow } from '../components/VideoWindow';
import { Controls } from '../components/Controls';
import { ChatBox } from '../components/ChatBox';
import { initWebRTC, initSocket } from '../services/webrtc';

export function InterviewRoom() {
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    // Initialize WebRTC
    const { peer, stream } = initWebRTC();
    setPeer(peer);
    setLocalStream(stream);

    // Initialize Socket.io
    const newSocket = initSocket();
    setSocket(newSocket);

    // Listen for remote stream
    peer.on('stream', (stream: MediaStream) => {
      setRemoteStream(stream);
    });

    newSocket.on('message', (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      peer.destroy();
      newSocket.disconnect();
    };
  }, []);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleSendMessage = (msg: string) => {
    socket?.emit('message', msg);
    setMessages(prev => [...prev, `You: ${msg}`]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Video Windows */}
      <div className="flex-1 flex gap-4 p-4">
        <VideoWindow
          stream={localStream}
          label="You"
          isLocal={true}
        />
        <VideoWindow
          stream={remoteStream}
          label="Interviewer"
          isLocal={false}
        />
      </div>

      {/* Controls and Chat */}
      <div className="w-80 flex flex-col bg-gray-800 p-4">
        <Controls
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          onMute={handleToggleMute}
          onCamera={handleToggleVideo}
        />

        <ChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
```

### Component: `features/interview-mode/src/components/VideoWindow.tsx`

```typescript
import React, { useEffect, useRef } from 'react';

interface VideoWindowProps {
  stream: MediaStream | null;
  label: string;
  isLocal: boolean;
}

export function VideoWindow({ stream, label, isLocal }: VideoWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex-1 rounded-lg bg-black overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded">
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </div>
  );
}
```

### Component: `features/interview-mode/src/components/Controls.tsx`

```typescript
import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  onMute: () => void;
  onCamera: () => void;
}

export function Controls({
  isMuted,
  isVideoOn,
  onMute,
  onCamera
}: ControlsProps) {
  return (
    <div className="flex gap-4 mb-6 justify-center">
      <button
        onClick={onMute}
        className={`p-3 rounded-full ${
          isMuted ? 'bg-red-600' : 'bg-gray-600'
        } hover:opacity-80 transition`}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </button>

      <button
        onClick={onCamera}
        className={`p-3 rounded-full ${
          !isVideoOn ? 'bg-red-600' : 'bg-gray-600'
        } hover:opacity-80 transition`}
      >
        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
      </button>
    </div>
  );
}
```

### Service: `features/interview-mode/src/services/webrtc.ts`

```typescript
import SimplePeer from 'simple-peer';

export function initWebRTC() {
  const peer = new SimplePeer({
    initiator: location.hash === '#initiator',
    trickle: false,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  });

  let localStream: MediaStream;

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(stream => {
      localStream = stream;
      peer.addStream(stream);
    })
    .catch(err => console.error('Failed to get user media:', err));

  peer.on('error', err => console.error('Peer error:', err));

  return { peer, stream: localStream };
}
```

### Service: `features/interview-mode/src/services/socket.ts`

```typescript
import io from 'socket.io-client';

export function initSocket() {
  const socket = io('http://localhost:3000', {
    auth: {
      token: localStorage.getItem('token')
    }
  });

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('join-interview', {
      interviewId: localStorage.getItem('interviewId')
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  return socket;
}
```

---

## 🔄 Development Workflow

### Step 1: Work on AI Service

```typescript
// Test AI service locally
import * as aiService from './aiService';

const questions = await aiService.generateInterviewQuestions(
  'Software Engineer',
  ['JavaScript', 'React'],
  'medium'
);
console.log(questions);
```

### Step 2: Build Interview Room

```typescript
// Integrate components in InterviewRoom.tsx
import { VideoWindow } from './components/VideoWindow';
import { Controls } from './components/Controls';
import * as aiService from '../ai-integration/src/aiService';
```

### Step 3: Test WebRTC Connection

1. Open two browser windows
2. First window: hash should be `#initiator`
3. Second window: regular hash
4. Video should appear in both windows

### Step 4: Test Socket.io

```bash
# Backend should have Socket.io running
# Frontend WebSocket connects automatically
# Test by opening browser console
```

---

## 🚀 Features to Implement

### Phase 1: Basic Video
- [ ] Local video capture
- [ ] Remote video display
- [ ] Mute/unmute controls
- [ ] Camera on/off

### Phase 2: Chat & Controls
- [ ] Real-time messaging
- [ ] Interview timer
- [ ] Recording start/stop
- [ ] End interview button

### Phase 3: Advanced
- [ ] Screen sharing
- [ ] Interview notes
- [ ] AI-generated questions
- [ ] Performance tracking

### Phase 4: AI Integration
- [ ] Load questions from AI
- [ ] Generate feedback with AI
- [ ] Resume analysis
- [ ] Skill assessment

---

## 🔧 Dependencies

New packages might be needed:
```bash
npm install simple-peer socket.io-client
```

---

## 📊 Key Files Summary

| File | Purpose |
|------|---------|
| `aiService.ts` | Gemini API calls |
| `InterviewRoom.tsx` | Main interview UI |
| `VideoWindow.tsx` | Video display |
| `Controls.tsx` | Camera/mic buttons |
| `webrtc.ts` | WebRTC setup |
| `socket.ts` | Socket.io connection |

---

## 🐛 Debugging Tips

### WebRTC Not Connecting
- Check STUN servers are reachable
- Verify firewall settings
- Check browser console for errors

### Audio/Video Not Working
- Verify camera/mic permissions
- Check getUserMedia is called
- Ensure device is not in use elsewhere

### Socket.io Issues
- Verify backend Socket.io server running
- Check auth token is valid
- Monitor network tab for WebSocket connection

---

## 🔄 Git Workflow for Features

```bash
# Work on AI service
git checkout -b feature/ai-question-generation
nano features/ai-integration/src/aiService.ts
git add features/
git commit -m "feat: implement question generation with Gemini"

# Work on interview room
git checkout -b feature/interview-video
nano features/interview-mode/src/pages/InterviewRoom.tsx
git add features/
git commit -m "feat: add video streaming in interview room"

# Push
git push origin feature/<name>

# Merge to personal branch when done
git checkout Jessy
git merge feature/<name>
git push origin Jessy
```

---

**Remember:** Commit frequently as features are completed. Each significant feature or fix = one commit.
