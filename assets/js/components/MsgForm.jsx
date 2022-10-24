import React from "react";

export default function MsgForm({onSubmit}) {

    return <form className="msg" onSubmit={onSubmit}>
        <div className="form-group">
            <label htmlFor="msg" className="form-label">Write your message!!</label>
            <textarea name="msg" id="msg" className="form-control is-valid" cols="30" rows="2">
            </textarea>
        </div>
        <div className="form-group mt-3">
            <button type="submit" className="btn btn-sm btn-primary">Send Message</button>
        </div>
    </form>
}