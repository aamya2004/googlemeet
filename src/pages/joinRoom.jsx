import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/header";
import Peer from "simple-peer";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addUserVideo, selectUserVideos } from '../store/slice';
const socket = io("http://localhost:9000");


const JoinRoom = () => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const navigate = useNavigate();
  const userVideo = useRef();
  const connectionRef = useRef();
  const location = useLocation();
  const idToJoin = location.state ? location.state.idToJoin : "";

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        userVideo.current.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing user media:', error);
      })

    socket.on("me", (id) => {
      console.log(id);
      setMe(id);
    });
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })
    peer.on("signal", (data) => {
      console.log(data, idToJoin, me);
      socket.emit("callUser", {
        userToCall: idToJoin,
        signalData: data,
        from: me,
        name: me
      })
    })
    socket.on("callAcceptedTrue", (signal) => {
      console.log(signal);
      peer.signal(signal)
      // navigate("/MeetingPage");
    })
    connectionRef.current = peer
  }

  return (
    <>
      <Header />
      <div className="video-container flex items-center justify-around mt-20 align-middle">
        <div className="video">
          <video playsInline muted ref={userVideo} autoPlay style={{ width: "600px" }} />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl my-10">Ready to join?</h2>
          <button className="rounded-3xl bg-blue-600 text-white p-3 w-36" onClick={() => callUser()}>Join Now</button>
        </div>
      </div>
    </>
  );
};

export default JoinRoom;
