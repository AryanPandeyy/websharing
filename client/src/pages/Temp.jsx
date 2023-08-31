import { useCallback, useEffect, useState, useMemo } from "react";
import { useSocket } from "../components/SocketProvider";
//import RTCconnection from "./RTCconnection";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";

export default function Temp() {
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const socket = useSocket();
  const { roomId } = useParams();
  const peerConnection = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    [],
  );
  const handleScreenSharing = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    // local stream
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
    peerConnection.onicecandidate = (e) => {
      console.log("candidate event", e);
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", {
          roomId: roomId,
          candidate: e.candidate,
        });
      }
    };
    setMyStream(stream);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("webrtc_offer", {
      roomId: roomId,
      offer: offer,
    });
  }, [peerConnection, roomId, socket]);
  const handleIceCandidates = useCallback(
    async (candidate) => {
      console.log("Ice candidate from peer to remote", candidate);
      await peerConnection.addIceCandidate(candidate);
    },
    [peerConnection],
  );
  const handleIncomingStream = useCallback(
    async (offer) => {
      console.log(offer);
      console.log("Triggered webrtc offer from server");
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("webrtc_answer", {
        roomId: roomId,
        answer: answer,
      });
    },
    [peerConnection, roomId, socket],
  );
  const sendStreams = useCallback(() => {
    myStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, myStream);
    });
    console.log("send tracks ");
    peerConnection.onicecandidate = (e) => {
      console.log("candidate event", e);
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", {
          roomId: roomId,
          candidate: e.candidate,
        });
      }
    };
  }, [myStream, peerConnection, roomId, socket]);
  const handleStreamConnection = useCallback(
    async (answer) => {
      //myStream.getTracks().forEach((track) => {
      //  peerConnection.addTrack(track, myStream);
      //}
      console.log("send tracks ");
      console.log("handleStreamConnection", answer);
      //sendStreams();
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    },
    [peerConnection, roomId, socket],
  );

  useEffect(() => {
    peerConnection.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS", ev.streams);
      setRemoteStream(remoteStream[0]);
    });
  }, [peerConnection]);
  useEffect(() => {
    console.log("useeffect being triggered!");
    socket.on("webrtc_offer", handleIncomingStream);
    socket.on("webrtc_ice_candidate", handleIceCandidates);
    socket.on("webrtc_answer", handleStreamConnection);
    return () => {
      socket.off("webrtc_offer", handleIncomingStream);
      socket.off("webrtc_answer", handleStreamConnection);
      socket.off("webrtc_ice_candidates", handleIceCandidates);
    };
  }, [
    handleIceCandidates,
    handleIncomingStream,
    handleStreamConnection,
    socket,
  ]);
  return (
    <>
      <div>
        {myStream && <ReactPlayer playing url={myStream} />}
        {remoteStream && <ReactPlayer playing url={remoteStream} />}
        <button onClick={handleScreenSharing}>Share Screen</button>
      </div>
    </>
  );
}
