import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { connectSocket, getSocket } from '../../services/socket';

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connected, setConnected] = useState(false);

  const createPeerConnection = () => {
    const socket = getSocket();
    if (!socket || !roomId) return null;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video:ice-candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setConnected(true);
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current as MediaStream);
    });

    peerConnectionRef.current = pc;
    return pc;
  };

  useEffect(() => {
    if (!roomId) return;

    const setupCall = async () => {
      try {
        const socket = connectSocket();

        if (!socket) {
          toast.error('Socket connection failed');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit('video:join-room', { roomId });

        socket.on('video:user-joined', async () => {
          const pc = createPeerConnection();
          if (!pc) return;

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('video:offer', {
            roomId,
            offer
          });
        });

        socket.on('video:offer', async ({ offer }) => {
          const pc = createPeerConnection();
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('video:answer', {
            roomId,
            answer
          });
        });

        socket.on('video:answer', async ({ answer }) => {
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('video:ice-candidate', async ({ candidate }) => {
          const pc = peerConnectionRef.current;
          if (!pc || !candidate) return;

          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('video:user-left', () => {
          setConnected(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          toast('Other user left the call');
        });
      } catch (error) {
        console.error(error);
        toast.error('Camera or microphone permission failed');
      }
    };

    setupCall();

    return () => {
      const socket = getSocket();

      if (socket && roomId) {
        socket.emit('video:leave-room', { roomId });
        socket.off('video:user-joined');
        socket.off('video:offer');
        socket.off('video:answer');
        socket.off('video:ice-candidate');
        socket.off('video:user-left');
      }

      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, [roomId]);

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    });
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    });
  };

  const endCall = () => {
    const socket = getSocket();

    if (socket && roomId) {
      socket.emit('video:leave-room', { roomId });
    }

    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    navigate('/meetings');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-900 rounded-lg overflow-hidden flex flex-col animate-fade-in">
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Video Call</h1>
          <p className="text-sm text-gray-300">
            Room: {roomId} {connected ? '| Connected' : '| Waiting for participant'}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            You
          </div>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!connected && (
            <p className="absolute text-gray-300">Waiting for other participant...</p>
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            Remote User
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-800 flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={toggleAudio}
          className="rounded-full"
        >
          {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </Button>

        <Button
          variant="outline"
          onClick={toggleVideo}
          className="rounded-full"
        >
          {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        </Button>

        <Button
          onClick={endCall}
          className="rounded-full bg-red-600 hover:bg-red-700"
          leftIcon={<PhoneOff size={18} />}
        >
          End Call
        </Button>
      </div>
    </div>
  );
};
