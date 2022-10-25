import React from "react";

export default function ConnectedUsers({users, onStartConv}) {

    return <div className="users">
        <h3>Online users:</h3>
        {users.map(user => <div key={user.id}>
            <div className="text-center">
                <img src={user.avatar} alt="Man" width={60} height={60} className="rounded-circle" />
                <br/>
                <button className="btn text-light btn-sm" onClick={() => onStartConv(user)}>{ user.username }</button>
            </div>
        </div>)}
        {!users.length && <h6 className="text-center text-warning">
            No user online
        </h6>}
    </div>
}