import ReactPlayer from "react-player";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import RTCconnection from "./RTCconnection";
import { useSocket } from "../components/SocketProvider";

export default function Rooms() {
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const socket = useSocket();
  const { roomId } = useParams();
  const handleScreenSharing = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    const offer = await RTCconnection.getOffer();
    socket.emit("webrtc_offer", {
      roomId: roomId,
      offer: offer,
    });
  }, [roomId, socket]);
  const handleIncomingStream = useCallback(
    async (offer) => {
      console.log(offer);
      console.log("Triggered webrtc offer from server");
      const answer = await RTCconnection.getAnswer(offer);
      socket.emit("webrtc_answer", {
        roomId: roomId,
        answer: answer,
      });
    },
    [roomId, socket],
  );
  useEffect(() => {
    RTCconnection.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS", ev.streams);
      setRemoteStream(remoteStream[0]);
    });
  }, []);
  // peer will be firing this function
  //const handleNegoNeeded = useCallback(async () => {
  //  const offer = await RTCconnection.getOffer();
  //  socket.emit("peer:nego:needed", {
  //    roomId: roomId,
  //    offer: offer,
  //  });
  //}, [roomId, socket]);
  //useEffect(() => {
  //  RTCconnection.peer.addEventListener("negotiationneeded", handleNegoNeeded);
  //  return () => {
  //    RTCconnection.peer.removeEventListener(
  //      "negotiationneeded",
  //      handleNegoNeeded,
  //    );
  //  };
  //}, [handleNegoNeeded]);
  const sendStreams = useCallback(() => {
    myStream.getTracks().forEach((track) => {
      RTCconnection.peer.addTrack(track, myStream);
    });
  }, [myStream]);
  const handleStreamConnection = useCallback(
    (answer) => {
      console.log(answer);
      RTCconnection.setLocalDescription(answer);
      sendStreams();
    },
    [sendStreams],
  );
  // server will be firing this function
  ///const handleNegoNeedIncomming = useCallback(
  ///  async (offer) => {
  ///    const answer = await RTCconnection.getAnswer(offer);
  ///    socket.emit("peer:nego:done", {
  ///      roomId: roomId,
  ///      answer: answer,
  ///    });
  ///  },
  ///  [roomId, socket],
  ///);

  //peer will be setting this
  //const handleNegoNeedFinal = useCallback(async (answer) => {
  //  await RTCconnection.setLocalDescription(answer);
  //}, []);

  useEffect(() => {
    console.log("useeffect being triggered!");
    socket.on("webrtc_offer", handleIncomingStream);
    socket.on("webrtc_answer", handleStreamConnection);
    //socket.on("peer:nego:needed", handleNegoNeedIncomming);
    //socket.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.off("webrtc_offer", handleIncomingStream);
      socket.off("webrtc_answer", handleStreamConnection);
      //socket.off("peer:nego:needed", handleNegoNeedIncomming);
      //socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    handleIncomingStream,
    //handleNegoNeedFinal,
    //handleNegoNeedIncomming,
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
