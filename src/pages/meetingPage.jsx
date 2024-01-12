import React, { useEffect, useRef, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { useHistory } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import CopyToClipboard from "react-copy-to-clipboard";
import Peer from "simple-peer";
import { io } from "socket.io-client";
const socket = io("http://localhost:9000"); // Rename to newSocket

function MeetingPage({userStream}) {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [shown, setShown] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
    socket.on("me", (id) => {
      console.log(id);
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
    setShown(true);
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    if (socket) {
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: id,
          signalData: data,
          from: me,
          name: name,
        });
      });
    }

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;

 
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    // Check if callerSignal is valid before calling peer.signal
    if (callerSignal && peer.signal) {
      peer.signal(callerSignal);
    } else {
      console.error("Invalid callerSignal or peer.signal is not available");
    }

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <div className="container bg-black">
        <div className="flex justify-center h-20">
          {receivingCall && !callAccepted ? (
            <div className="caller bg-white w-1/4 h-24 rounded-lg flex flex-col items-center p-2 justify-around fixed">
              <h1>Someone wants to enter this meet?</h1>
              <div className="flex">
                <button onClick={answerCall} className="text-zinc-500 px-4 cursor-pointer">
                  Admit
                </button>
                <button onClick={answerCall} className="text-zinc-500 px-4 cursor-pointer">
                  Deny
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="video-container">
          <div className="video flex justify-center p-5">
            <video
              className="w-1/2 rounded-xl"
              playsInline
              muted
              ref={myVideo}
              autoPlay
            />
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video 
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "800px" }}
              />
            ) : null}
          </div>
        </div>

        {shown ? (
          <div className="fixed top-0 left-0 w-full h-full flex justify-start items-end  bg-black bg-opacity-50 z-50">
            <div className="bg-slate-100 h-4/3 w-1/4 p-6 m-10 rounded shadow-md">
              <div className="flex justify-between">
                <h2 className="text-gray-800 font-medium text-lg">
                  Your Meeting's ready
                </h2>
                <RxCross2
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => setShown(false)}
                />
              </div>
              <h3>Share this code with anyone you want in this meeting.</h3>
              <div className="h-10 w-30 bg-zinc-300 mt-4 rounded-md flex items-center p-3 justify-between">
                <h3>{me}</h3>
                <CopyToClipboard text={me} style={{ marginBottom: "1rem" }}>
                  <MdContentCopy className="cursor-pointer h-6 text-zinc-700 w-10 mt-4" />
                </CopyToClipboard>
              </div>
              <h6 className="text-zinc-600 text-md">
                People who use this code must get your permission before they
                can join.
              </h6>
            </div>
          </div>
        ) : null}

        <div className="myId">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <button onClick={async () => await navigator.clipboard.writeText(me)}>
            Copy ID
          </button>
          <input
            type="text"
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <button onClick={leaveCall}>End Call</button>
            ) : (
              <button onClick={() => callUser(idToCall)}>Call</button>
            )}
            {idToCall}
          </div>
        </div>
      </div>
    </>
  );
}

export default MeetingPage;
