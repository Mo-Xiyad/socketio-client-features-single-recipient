import { FormEvent, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";
import { io } from "socket.io-client";
import IMessage from "../interfaces/IMessage";
import { IUser } from "../interfaces/IUser";
import { Room } from "../interfaces/Room";

const ADDRESS = "http://localhost:3030"; // <-- address of the BACKEND PROCESS //https://github.com/Mo-Xiyad/socket-io-chat-back-end
const socket = io(ADDRESS, { transports: ["websocket"] });

const Home = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
  const [chatHistory, setChatHistory] = useState<IMessage[]>([]);

  const [room, setRoom] = useState<Room>("blue");
  const [singleRecipient, setSingleRecipient] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connection established!");
    });

    socket.on("loggedIn", () => {
      console.log("you're logged in!");

      setLoggedIn(true);

      fetchOnlineUsers();

      socket.on("newConnection", () => {
        console.log("watch out! a new challenger appears!");

        fetchOnlineUsers();
      });
    });

    socket.on("message", (newMessage: IMessage) => {
      console.log("a new message appeared!");

      setChatHistory((chatHistory) => [...chatHistory, newMessage]);
    });
  }, []);

  const handleUsernameSubmit = (e: FormEvent) => {
    e.preventDefault();

    socket.emit("setUsername", { username: username, room: room });
  };

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newMessage: IMessage = {
      text: message,
      sender: username,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    socket.emit("sendMessage", {
      message: newMessage,
      room: singleRecipient ?? room,
    });

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
  };

  const fetchOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + "/online-users");
      if (response) {
        let data: { onlineUsers: IUser[] } = await response.json();

        setOnlineUsers(data.onlineUsers);
      } else {
        console.log("error fetching the online users");
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(room);
  return (
    <Container fluid className="px-4">
      <Row className="my-3" style={{ height: "95vh" }}>
        <Col md={10} className="d-flex flex-column justify-content-between">
          <Form onSubmit={handleUsernameSubmit} className="d-flex">
            <FormControl
              placeholder="Insert your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loggedIn}
            />
          </Form>

          <ListGroup>
            {chatHistory.map((message, i) => (
              <ListGroupItem key={i}>
                <strong>{message.sender}</strong>
                <span className="mx-1"> | </span>
                <span>{message.text}</span>
                <span className="ml-2" style={{ fontSize: "0.7rem" }}>
                  {new Date(message.timestamp).toLocaleTimeString("en-US")}
                </span>
              </ListGroupItem>
            ))}
          </ListGroup>

          <Form onSubmit={handleMessageSubmit}>
            <FormControl
              placeholder="Insert your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={2} style={{ borderLeft: "2px solid black" }}>
          <div className="mb-3">Connected users:</div>
          <ListGroup>
            {onlineUsers.length === 0 && (
              <ListGroupItem>No users yet!</ListGroupItem>
            )}
            {onlineUsers
              .filter((user) => user.room === room)
              .map((user) => (
                <ListGroupItem
                  onClick={() => setSingleRecipient(user.socketId)}
                  key={user.socketId}
                >
                  {user.username}
                </ListGroupItem>
              ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
