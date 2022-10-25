import React from "react"

export default function Msgs({msgs}) {
    return <div>
        {msgs.map(msg => (
            <Msg msg={msg} key={Math.random()} />
        ))}
    </div>
}

function Msg ({msg}) {
    if (msg.me) {
        return <div>
            <b className="badge bg-danger">Me</b>  {msg.msg}
        </div>
    } else {
        return <div>
            <b className="badge bg-success">{msg.user.username}</b>  {msg.msg}
        </div>
    }
}