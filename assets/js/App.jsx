import React, { useEffect, useState } from "react";
import { WS_URL } from '../config';
import ConnectedUsers from "./components/ConnectedUsers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {user} from './user';
import Header from "./components/Header";
import Conversation from "./components/Conversation";

export default function App() {
    const conn = new WebSocket(WS_URL);

    const JOIN = 'join';
    const PUSH = 'push';
    const MSG = 'msg';

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [state, setState] = useState('IDLE');

    const [chatWith, setChatWith] = useState({});

    const [msgs, setMsgs] = useState([]);

    // const [convs, setConvs] = useState([]);

    const onStartConv = (participant) => {
        setState('CHAT');
        setChatWith(participant);
    }

    const closeConv = e => {
        setState('IDLE')  
    }

    const onMessage = (e) => {
        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: MSG,
        };
        conn.send(JSON.stringify(sendMessage));

        sendMessage.me = true;

        setMsgs(msgs => [...msgs, sendMessage]);
    }

    useEffect(() => {

        conn.onopen = function () {
            conn.send(JSON.stringify({user: user, type: JOIN}));
        };

        conn.onmessage = function (e) {
            const data = JSON.parse(e.data);

            const isPush = PUSH === data.type && data.user.id !== user.id;
            if (isPush) {
                setConnectedUsers(connectedUsers => [...connectedUsers, data.user]);
                toast.success(`${data.user.username} joined 😲!!`);
            }

            const isMsg = MSG === data.type;
            if (isMsg) {
                setMsgs(msgs => isMsg ? [...msgs, data]: msgs);
            }
        };
    }, []);

    return <div className="card bg-dark mt-4">
            <Header user={user} />
        <div className="card-body">
            
            { 'IDLE' === state && 
                <ConnectedUsers users={connectedUsers} onStartConv={onStartConv}/>
            }

            { 'CHAT' === state && 
                <>
                    <span className="close-conv" onClick={closeConv}>X</span>
                    <Conversation chatWith={chatWith} msgs={msgs} onMessage={onMessage} />
                </>
            } 
        </div>
        <ToastContainer />
    </div>
}