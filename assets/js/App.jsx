import React, { useEffect, useState } from "react";
import { WS_URL } from '../config';
import ConnectedUsers from "./components/ConnectedUsers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MsgForm from './components/MsgForm';
import {user} from './user';
import Msgs from "./components/Msgs";

export default function App() {
    const conn = new WebSocket(WS_URL);

    const JOIN = 'join';
    const PUSH = 'push';
    const MSG = 'msg';

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [state, setState] = useState('IDLE');

    const [chatWith, setChatWith] = useState({});

    const [msgs, setMsgs] = useState([]);

    const onStartConv = user => {
        setState('CHAT')
        setChatWith(user);
    }

    const onMessage = (e) => {
        e.preventDefault();

        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: MSG,
            me: true,
        };
        setMsgs(msgs => [...msgs, sendMessage]);

        conn.send(JSON.stringify(sendMessage));
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
                console.log(data);
            }
            setMsgs(msgs => isMsg ? [...msgs, data]: msgs);
        };
    }, []);

    console.log(state)

    return <div className="card bg-dark mt-4">
        <div className="card-header">
            <div className="card-title">
                <h3 className="card-label">Chat with friends</h3>
            </div>
        </div>
        <div className="card-body">
            { 'IDLE' === state && 
                <ConnectedUsers users={connectedUsers} onStartConv={onStartConv}/>
            }
            <hr/>
            <Msgs msgs={msgs} />

            <hr />
            {'CHAT' === state && <MsgForm onSubmit={onMessage}/>}
        </div>
        <ToastContainer />
    </div>
}