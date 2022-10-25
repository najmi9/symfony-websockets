import React, { useEffect, useState } from "react";
import Msgs from './Msgs';
import MsgForm from './MsgForm';
import {user} from '../user';

export default function Conversation({conv, conn, send, onmessage}) {
    const MSG = 'msg';

    const chatWith = conv.participant;


    const [conversation, setConversation] = useState(conv);

    conn.onmessage = e => {
        console.log('bing');
        const data = JSON.parse(e.data);

        const isMsg = MSG === data.type;
        if (!isMsg) {
            return;
        }

        setConversation(c => ({...c, msgs: [...c.msgs, data]}));
    }

    const onCreatorSubmitMessage = e => {
        const form = Object.fromEntries(new FormData(e.target));

        const sendMessage = {
            user: user,
            to: chatWith,
            msg: form.msg,
            type: MSG,
        };
        send(JSON.stringify(sendMessage));

        sendMessage.me = true;

        setConversation(c => ({...c, msgs: [...c.msgs, sendMessage]}));
    }

    return <div>
        <p className="text-center">
            <img src={chatWith.avatar} alt={chatWith.username}  width={60} height={60} className="rounded-circle"/>
            <br/> Chat with <b className="badge bg-success">{chatWith.username}</b>
        </p>
        <hr/>
        <Msgs msgs={conversation.msgs} />
        <hr/>
        <MsgForm onSubmit={onCreatorSubmitMessage}/>
    </div>
}