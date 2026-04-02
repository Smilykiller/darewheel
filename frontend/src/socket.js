import { io } from 'socket.io-client';

// Because it's empty (), it automatically talks to the Render server it lives on!
const socket = io(); 

export default socket;