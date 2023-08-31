import { useCallback, useState, useEffect } from "react";
import { useSocket } from "../components/SocketProvider";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("join", roomId);
    },
    [roomId, socket],
  );
  const handleRoomJoin = useCallback(
    (roomId) => {
      navigate(`/rooms/${roomId}`);
    },
    [navigate],
  );
  useEffect(() => {
    socket.on("room_join", handleRoomJoin);
    return () => {
      socket.off("room_join", handleRoomJoin);
    };
  }, [handleRoomJoin, socket]);
  return (
    <>
      <div>
        <form onSubmit={handleSubmitForm}>
          <label htmlFor="">Enter Room No: </label>
          <input
            onChange={(e) => setRoomId(e.target.value)}
            type="number"
            value={roomId}
          />
          <button>Join</button>
        </form>
      </div>
    </>
  );
}
