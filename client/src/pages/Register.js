import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { CredentialsContext } from "../App";
import { handleErrors } from "./Login";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setCredentials] = useContext(CredentialsContext);

  const register = (e) => {
    e.preventDefault();
    fetch(`http://localhost:4000/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then(handleErrors)
      .then(() => {
        setCredentials({
          username,
          password,
        });
        history.push("/");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const history = useHistory();

  return (
    <div>
      <h1>Register</h1>
      {error && <span style={{ color: "red" }}>{error}</span>}
      <form onSubmit={register}>
      <div className="form-group">
        <input
          pattern="[^\s]+"
          className="form-control"
          required
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username (without space)"
        />
        </div>
        <br />
        <div className="form-group">
        <input
          className="form-control"
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
        </div>
        <br />
        <div className="form-group">
        <input type="submit" value="Submit" className="btn btn-primary btn-block"/>
        </div>
      </form>
    </div>
  );
}
