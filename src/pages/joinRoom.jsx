import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/header";
import Peer from "simple-peer";
import {io} from "socket.io-client";
const socket = io("http://localhost:9000");

const JoinRoom = ({setUserStream}) => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
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
      });

    socket.on("me", (id) => {
      console.log(id);
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      console.log(data.from)
      setName(data.name);
      console.log(data.name)
      setCallerSignal(data.signal);
      console.log(data.signal)
    });
  }, []);

  const callUser = (idToJoin) =>{
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })
    peer.on("signal", (data) => {
      socket.emit("callUser",{
        userToCall: idToJoin,
        signalData: data,
        from: me,
        name: me
      })

    })
    peer.on("stream",(stream)=>{
      userVideo.current.srcObject = stream;
    })
    socket.on("callAccepted", (signal) =>{
      setCallAccepted(true)
      peer.signal(signal)
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
          <button className="rounded-3xl bg-blue-600 text-white p-3 w-36" onClick={()=>callUser(idToJoin)}>Join Now</button>

          </div>
			</div>
    </>
  );
};

export default JoinRoom;
