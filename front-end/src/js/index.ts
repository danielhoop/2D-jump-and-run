import game from "./game";
import jQuery from "./jquery-2.1.3.min";

const websocketGame = {
    socket: null,
};

(function($) {
    // Start the game.
    $(document).ready(game);

    if (window["WebSocket"]) {
        const socket = new WebSocket("ws://localhost:8000");
        socket.onopen = function(e) {
            console.log("Websocket connection established.");
        };
        socket.onclose = function(e) {
            console.log("Websocket connection closed.");
        };

        websocketGame.socket = socket;
    }
})(jQuery);