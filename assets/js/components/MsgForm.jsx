import React, { useRef } from "react";

export default function MsgForm({onSubmit}) {
    const ref = useRef(null);

    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!ref.current?.value) {
            return;
        }

        if (onSubmit) {
            onSubmit(e);
        }

        ref.current.value = '';
        ref.current.focus();
    }

    const onKeyUp = e => {
        if ('Enter' === e.code) {
            onFormSubmit(e);
        }
    }

    return <form className="msg row" onSubmit={onFormSubmit}>
        <div className="form-group col-9">
            <input type="text" name="msg" id="msg" className="form-control is-valid" placeholder="Write your message!!" ref={ref}/>
        </div>
        <div className="form-group col-3">
            <button type="submit" className="btn btn-sm btn-primary" onKeyUp={onKeyUp}>Send</button>
        </div>
    </form>
}