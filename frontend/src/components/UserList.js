import React from "react";

const UserList = ({ users = [], disconnectedUsers = [] }) => { // Valores predeterminados
  return (
    <div className="card">
      <div className="card-header">Users</div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item list-group-item-success">
          <strong>Connected Users:</strong>
        </li>
        {users.map((user, index) => (
          <li key={index} className="list-group-item">
            {user}
          </li>
        ))}
        <li className="list-group-item list-group-item-danger">
          <strong>Disconnected Users:</strong>
        </li>
        {disconnectedUsers.map((user, index) => (
          <li key={index} className="list-group-item">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;