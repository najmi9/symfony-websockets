import React from "react";

export default function Header({user}) {
    return  <div className="card-header">
    <div className="card-title d-flex justify-content-between">
        <h3 className="card-label">
            Hi <b className="badge bg-danger">{user.username}</b>
        </h3>
        <p>
            <img src={user.avatar} alt={user.username} width={45} height={45} className="rounded-circle"/>
        </p>
    </div>
</div>
}