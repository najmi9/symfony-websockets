import React from "react";

export default function ConnectedUsers({users, onStartConv}) {

    return <div className="users">
        <h3>Connected users:</h3>
        {users.map(user => <div key={user.id}>
            <div className="text-center bg-secondary">
                <img src={`https://randomuser.me/api/portraits/men/${user.id}.jpg`} alt="Man" width={80} height={80} className="rounded-circle" />
                <br/>
                <button className="btn btn-light btn-sm" onClick={() => onStartConv(user)}>{ user.username }</button>
            </div>
        </div>)}
    </div>
}