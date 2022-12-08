import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import user from "reducers/user";

const Main = () => {
    const dispatch = useDispatch();
    const accessToken = useSelector((store) => store.user.accessToken);
    const navigate = useNavigate();

    useEffect( () => {
        if (!accessToken) {
            navigate("/login");
        }
    }, []);

    return (
    <>
    <div className="main-page">
      <h1>Welcome!</h1>
      <h2>Now you are logged in </h2>
        <button
            type="button"
            onClick={() => {
            dispatch(user.actions.setAccessToken(null));
            navigate("/login");
            }}> 
            Log Out
        </button>
    </div> 
    </>
    )
}

export default Main;