import React, { useEffect, useState } from "react";
import ConnectedUsers from "./components/ConnectedUsers";
import {user} from './user';
import Header from "./components/Header";
import Msgs from "./components/Msgs";
import MsgForm from "./components/MsgForm";
import { notify } from "./services/notify";
import { WS_URL } from "../config";

export default function App() {
    const conn = new WebSocket(WS_URL);

    const JOIN = 'join';
    const PUSH = 'push';
    const MSG = 'msg';
    const CONV = 'NEW_CONVERSATION';

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [state, setState] = useState('IDLE');

    const [convs, setConvs] = useState([]);

    const [conv, setConversation] = useState({});

    const onStartConv = (participant) => {
        setState('CHAT');

        const alreadyExists = convs.filter(
            c => c.creator.id === user.id && c.participant.id === participant.id
        );

        let conversation = null;

        if (alreadyExists.length > 0) {
            conversation = alreadyExists[0];
        }

       if (null === conversation) {
            conversation = {
                id: `${Math.random()}`,
                creator: user,
                participant: participant,
                msgs: [],
            }
            setConvs(items => [...items, conversation]);
       }

       setConversation(c => ({...conversation, ...c}));

       conversation.type = CONV;

       conn.send(JSON.stringify(conversation));
    }

    const closeConv = () => {
        setState('IDLE')  
    }

    const chatWith = conv.participant;

    const onCreatorSubmitMessage = e => {
        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: MSG,
        };

        conn.send(JSON.stringify(sendMessage));

        sendMessage.me = true;

        setConversation(c => ({...c, msgs: [...c.msgs, sendMessage]}));
    }

    useEffect(() => {
        conn.onopen = function () {
            conn.send(JSON.stringify({user: user, type: JOIN}));
        };

        conn.onmessage = function (e) {
            const data = JSON.parse(e.data);
            const isPush = PUSH === data.type && data.user.id !== user.id;

            if (isPush) {
                setConnectedUsers(cu => [...cu, data.user]);
                return
            }

            if (CONV === data.type) {
                const isUserExists = connectedUsers.filter(cu => cu.id === data.creator.id);
                if (0 === isUserExists.length) {
                    setConnectedUsers(cu =>[data.creator, ...cu]);
                }
    
                notify(
                    'New chat',
                    `${data.creator.username} start a conversation`,
                    data.creator.avatar
                );
              
                return;
            }
            
            if (MSG === data.type) {
                setConversation(c => ({...c, msgs: [...(c.msgs || []), data]}));
                notify(
                    `${data.user.username} send you a message`,
                    data.msg,
                    data.user.avatar
                );
                return;
            }
        };
    }, []);

    return <div className="card bg-dark mt-4">
        <Header user={user} />
        <div className="card-body">
            
            { 'IDLE' === state && 
                <ConnectedUsers
                users={connectedUsers} 
                onStartConv={onStartConv}/>
            }

            { 'CHAT' === state && 
                <>
                    <span className="close-conv" onClick={closeConv}>X</span>
                    <p className="text-center">
                        <img src={chatWith.avatar} alt={chatWith.username} width={60} height={60} className="rounded-circle"/>
                        <br/> Chat with <b className="badge bg-success">{chatWith.username}</b>
                    </p>
                    <hr/>
                    <Msgs msgs={conv.msgs} />
                    <hr/>
                    <MsgForm onSubmit={onCreatorSubmitMessage}/>
                </>
            } 
        </div>
    </div>
}