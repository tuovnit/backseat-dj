import { io } from "socket.io-client";

module.exports = {
    socket: io(`${process.env.EXPO_PUBLIC_BASE_URL}`, {
        autoConnect: false
    })
};
