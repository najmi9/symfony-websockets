import React, { useState } from "react";
import ConnectedUsers from "./components/ConnectedUsers";
import {user} from './user';
import Header from "./components/Header";
import Msgs from "./components/Msgs";
import MsgForm from "./components/MsgForm";
import { WS_URL } from "../config";

export default function App() {
    const ws = new WebSocket(WS_URL);

    const USER_JOINED = 'USER_JOINED';
    const NEW_MESSAGE = 'NEW_MESSAGE';
    const NEW_CONVERSATION = 'NEW_CONVERSATION';

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [state, setState] = useState('IDLE');

    const [currentConversation, setCurrentConversation] = useState({});

    const [conversations, setConversations] = useState([]);

    const chatWith = currentConversation.participant;

    const onUserStartConversation = (participant) => {
        setState('CHAT');

        const isConversationExists = conversations.filter(c => c.creator.id === user.id && c.participant.id === participant.id);

        let conversation = null;
        if (isConversationExists.length > 0) {
            conversation = isConversationExists[0];
        } else {
            conversation = {
                id: `${Math.random()}`,
                creator: user,
                participant: participant,
                msgs: [],
                type: NEW_CONVERSATION,
            }

            setConversations(cs => [...cs, conversation]);
        }

        setCurrentConversation(c => ({...conversation, ...c}));
        ws.send(JSON.stringify(conversation));
    }

    const onUserCloseConversation = () => setState('IDLE');

    const onCreatorSubmitMessage = e => {
        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: NEW_MESSAGE,
        };

        ws.send(JSON.stringify(sendMessage));

        sendMessage.me = true;

        setCurrentConversation(c => ({...c, msgs: [...c.msgs, sendMessage]}));
    }

    ws.onopen = () => ws.send(JSON.stringify({user: user, type: USER_JOINED}));

    ws.onmessage = e => {
        const data = JSON.parse(e.data);

        switch (data.type) {
            case USER_JOINED:
                const isUserAlreadyJoined = connectedUsers.filter(u => u.id === data.user.id).length;
                if (data.user.id !== user.id && 0 === isUserAlreadyJoined) {
                    setConnectedUsers(cu => [...cu, data.user]);
                }
                break;
            case NEW_CONVERSATION:
                // remove connected users, use conversations instead
                // each conversation has id as primary key
                const isUserExists = connectedUsers.filter(cu => cu.id === data.creator.id);
            
                if (0 === isUserExists.length) {
                    setConnectedUsers(cu => [data.creator, ...cu]);
                }

                break;
            case NEW_MESSAGE:
                // find the conversation
                // add the message to the conversation
                console.log(data);
                setCurrentConversation(c => ({...c, msgs: [...(c.msgs || []), data]}));
                break;
        }
    };

    return <div className="card bg-dark mt-4">
        <Header user={user} />
        <div className="card-body">
            
            { 'IDLE' === state && <>
                <ConnectedUsers
                users={connectedUsers} 
                onUserStartConversation={onUserStartConversation} />

                {/* <Conversations conversations={conversations} /> */}
            </>
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