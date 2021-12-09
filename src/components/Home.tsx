import { Container } from "react-bootstrap";
import { io } from "socket.io-client";

const ADDRESS = "http://localhost:3030"; // <-- address of the BACKEND PROCESS
const socket = io(ADDRESS, { transports: ["websocket"] });

const Home = () => {
  return <Container fluid className="px-4"></Container>;
};

export default Home;
