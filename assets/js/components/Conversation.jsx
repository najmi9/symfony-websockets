import React from "react";
import Msgs from './Msgs';
import MsgForm from './MsgForm';

export default function Conversation({chatWith, msgs, onMessage}) {
    return <div>
        <p className="text-center">
            <img src={chatWith.avatar} alt={chatWith.username}  width={60} height={60} className="rounded-circle"/>
            <br/> Chat with <b className="badge bg-success">{chatWith.username}</b>
        </p>
        <hr/>
        <Msgs msgs={msgs} />
        <hr/>
        <MsgForm onSubmit={onMessage}/>
    </div>
}