import React, { useEffect, useState } from "react";
import ConnectedUsers from "./components/ConnectedUsers";
import {user} from './user';
import Header from "./components/Header";
import Msgs from "./components/Msgs";
import MsgForm from "./components/MsgForm";
import { notify } from "./services/notify";
import { WS_URL } from "../config";

export default function App() {
    const ws = new WebSocket(WS_URL);

    const JOIN = 'USER_JOINED';
    const MSG = 'NEW_MESSAGE';
    const CONV = 'NEW_CONVERSATION';

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [state, setState] = useState('IDLE');

    const [currentConversation, setCurrentConversation] = useState({});

    const chatWith = currentConversation.participant;

    const onUserStartConversation = (participant) => {
        setState('CHAT');

        const conversation = {
            id: `${Math.random()}`,
            creator: user,
            participant: participant,
            msgs: [],
        }

        setCurrentConversation(c => ({...conversation, ...c}));

        conversation.type = CONV;
        ws.send(JSON.stringify(conversation));
    }

    const onUserCloseConversation = () => {
        setState('IDLE')  
    }
    const onCreatorSubmitMessage = e => {
        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: MSG,
        };

        ws.send(JSON.stringify(sendMessage));

        sendMessage.me = true;

        setCurrentConversation(c => ({...c, msgs: [...c.msgs, sendMessage]}));
    }

    useEffect(() => {
        ws.onopen = function () {
            ws.send(JSON.stringify({user: user, type: JOIN}));
        };

        ws.onmessage = function (e) {
            const data = JSON.parse(e.data);
            const isPush = JOIN === data.type && data.user.id !== user.id;
            const isUserAlreadyJoined = connectedUsers.filter(u => u.user.id === data.user.id).length > 0;

            if (isPush && !isUserAlreadyJoined) {
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
                setCurrentConversation(c => ({...c, msgs: [...(c.msgs || []), data]}));
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
                onUserStartConversation={onUserStartConversation}/>
            }

            { 'CHAT' === state && 
                <>
                    <span className="close-conv" onClick={onUserCloseConversation}>X</span>
                    <p className="text-center">
                        <img src={chatWith.avatar} alt={chatWith.username} width={60} height={60} className="rounded-circle"/>
                        <br/> Chat with <b className="badge bg-success">{chatWith.username}</b>
                    </p>
                    <hr/>
                    <Msgs msgs={currentConversation.msgs} />
                    <hr/>
                    <MsgForm onSubmit={onCreatorSubmitMessage}/>
                </>
            } 
        </div>
    </div>
}