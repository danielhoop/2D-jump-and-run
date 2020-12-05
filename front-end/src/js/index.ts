import $ from "jquery";

import Lang from "../config/lang";
import Translator from "./Translator";
import dom from "./DomOperator";
import Game from "./Game";
import Chat from "./Chat"
import {
    createUser,
    User,
} from "./User";
import {
    SocketData,
    SocketEvent,
    UserData,
    constants,
    GameStartData,
    PlayerPosition,
    Scores,
    ScorePayload,
} from "./types";
import { Player } from "./Player";
import { GlobalState } from "./GlobalState";
import { MapData } from "./MapTypes";
import domOperator from "./DomOperator";


// Orientation handling
// https://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
let previousHeightWidth = $(window).width() + $(window).height();
let previousOrientation = window.orientation;
let orientationChangeInterval = null;

const checkScreenOrientation = function () {
    const currentHeightWith = $(window).width() + $(window).height();
    if (window.orientation !== previousOrientation || currentHeightWith != previousHeightWidth) {
        previousOrientation = window.orientation;
        previousHeightWidth = currentHeightWith;

        // Determine which elements to show.
        let elementsToShow = [];
        if (dom.isSmartphoneLayout()) {
            elementsToShow = ["#group_container", "#chat_open_button"];
        } else {
            elementsToShow = ["#chat", "#group_container"];
        }
        dom.hideAllExcept(elementsToShow);
    }
};

const addOrientationChangeFunction = function () {
    window.addEventListener("resize", checkScreenOrientation, false);
    window.addEventListener("orientationchange", checkScreenOrientation, false);

    // (optional) Android doesn't always fire orientationChange on 180 degree turns
    orientationChangeInterval = setInterval(checkScreenOrientation, 2000);
}

const removeOrientationChangeFunction = function () {
    window.removeEventListener("resize", checkScreenOrientation, false);
    window.removeEventListener("orientationchange", checkScreenOrientation, false);
    clearInterval(orientationChangeInterval);
}


// Other functions
const setUserNameAndChangeFocus = function (user: User, socket: WebSocket) {
    const name = $("#name_editor").val().toString();
    if (name != "") {
        user.name = name;
        $("#name_editor").val("");
        $("#msg_sender_initially").text(name);
        $("#" + constants.GROUP_0).children(".group_members").append(
            '<div class="group_member" id="group_member_id_' + user.id + '">' + name + '</div>');

        // Determine which elements to show.
        let elementsToShow = [];
        if (dom.isSmartphoneLayout()) {
            elementsToShow = ["#group_container", "#chat_open_button"];
        } else {
            elementsToShow = ["#chat", "#group_container"];
        }
        dom.hideAllExcept(elementsToShow);

        // Add orientation change function to event listener.
        addOrientationChangeFunction();

        // Tell the server the name of the user.
        const userData: UserData = {
            name: user.name,
            userId: user.id,
            roomId: user.roomId,
            groupId: user.groupId
        }
        const msg: SocketData = {
            type: SocketEvent.USER_DATA,
            roomId: user.roomId,
            payload: userData
        }
        socket.send(JSON.stringify(msg));
    }
}

const readMsgClearAndSend = function (chat: Chat): void {
    const val = $("#chat_editor").val().toString();
    if (val != "") {
        $("#chat_editor").val("");
        chat.sendMsg(val);
    }
}

const startGame = function (user: User, groupId: string, socket: WebSocket) {
    /* const memberIds: Array<string> = [];
    $("#" + groupId).children(".group_members").children().each(function () {
        const id = $(this).attr('id');
        memberIds.push(id.substring("group_member_id_".length));
    }); */
    console.log(user);
    console.log(groupId);
    if (user.groupId == constants.GROUP_0 || user.groupId != groupId) {
        return;
    }
    const userData: UserData = {
        name: user.name,
        userId: user.id,
        roomId: user.roomId,
        groupId: user.groupId
    }
    const msg: SocketData = {
        type: SocketEvent.START_GAME_SERVER,
        roomId: user.roomId,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}

const moveUserToGroup = function (user: User, groupId: string, socket: WebSocket) {
    // Send data to socket
    const userData: UserData = {
        name: user.name,
        userId: user.id,
        roomId: user.roomId,
        groupId: groupId
    }
    const msg: SocketData = {
        type: SocketEvent.USER_CHANGES_GROUP,
        roomId: user.roomId,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}

const constLength = function (x: number, length: number, add = "0") {
    let a = x + "";
    while (a.length < length) {
        a = add + a;
    }
    return a;
}

const msToMmSsMs = function (ms: number): string {
    const mm = Math.floor(ms / 60000);
    ms = ms % 60000;
    const ss = Math.floor(ms / 1000);
    ms = ms % 1000;

    return constLength(mm, 2) + ":" + constLength(ss, 2) + "." + constLength(ms, 3);
}

let game: Game = undefined;
const translator = new Translator(Lang.Locale.de_de, Lang.Locale.en_us, Lang.elements, Lang.mapping, Lang.txt, true);

$(document).ready(function () {

    translator.nameAllElments();

    // Create a user
    const user: User = createUser("unknown");

    // Open model to give username.
    dom.hideAllExcept(["#name_modal"]);
    $("#name_editor").focus();

    // Web socket.
    if (window["WebSocket"]) {

        // Create socket
        const socket = GlobalState.getInstance().getSocket();

        // On close
        socket.onclose = function () {
            console.log("Websocket connection closed.");
        };

        // Only if socket has opened, create event handlers!
        // And inside is 'socket.onmessage'
        socket.onopen = function () {
            console.log("Websocket connection established.");
            $("#no_connection_to_server").remove();

            // Event handler on user name.
            $("#name_editor").keypress(function (event) {
                const keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == 13) {
                    setUserNameAndChangeFocus(user, socket);
                }
            });
            $("#name_enter_button").on("click", function () {
                setUserNameAndChangeFocus(user, socket);
            });

            // Chat
            const chat = new Chat(socket, user);

            $("#chat_editor").keypress(function (event) {
                const keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == 13) {
                    readMsgClearAndSend(chat);
                }
            });
            $("#chat_send_button").on("click", function () {
                readMsgClearAndSend(chat);
            });
            $("#chat_open_button").on("click", function () {
                dom.hideAllExcept(["#chat", "#chat_close_button"]);
            })
            $("#chat_close_button").on("click", function () {
                // Determine which elements to show.
                let elementsToShow = [];
                if (dom.isSmartphoneLayout()) {
                    elementsToShow = ["#group_container", "#chat_open_button"];
                } else {
                    elementsToShow = ["#chat", "#group_container"];
                }
                dom.hideAllExcept(elementsToShow);
            })

            // On message...
            socket.onmessage = function (e) {
                const data: SocketData = JSON.parse(e.data);
                // console.log("Received message:"); console.log(data);

                if (data.type == SocketEvent.POSITION) {
                    const playerPosition = data.payload as PlayerPosition;
                    game.updatePlayerPosition(playerPosition);


                } else if (data.type == SocketEvent.CHAT_MESSAGE) {
                    chat.receiveMsg(data.payload);


                } else if (data.type == SocketEvent.USER_DATA) {
                    // If the user has no id, then it must be initialized.
                    const payload: UserData = data.payload;

                    if (!user.id) {
                        if (payload.name) {
                            user.name = payload.name;
                        }
                        user.id = payload.userId;
                    }


                } else if (data.type == SocketEvent.USER_CHANGES_GROUP) {
                    const payload: UserData = data.payload;
                    if (payload.userId == user.id) {
                        user.groupId = payload.groupId;
                        user.roomId = payload.roomId;
                    }
                    $("#group_member_id_" + payload.userId).remove();
                    // If no groupId was given, then just remove from group completely.
                    if (payload.groupId) {
                        $("#" + payload.groupId).children(".group_members").append(
                            '<div class="group_member" id="group_member_id_' + payload.userId + '">' + payload.name + '</div>');
                    }


                } else if (data.type == SocketEvent.START_GAME_CLIENT) {

                    removeOrientationChangeFunction();
                    $("#bg_lake").remove();

                    const payload = data.payload as GameStartData;
                    const otherPlayers = payload.players;
                    for (let i = 0; i < otherPlayers.length; i++) {
                        if (otherPlayers[i].userId == user.id) {
                            otherPlayers.splice(i, 1);
                        }
                    }
                    game = new Game(
                        new Player(user, Player.PLAYER_1, true),
                        Player.createOtherPlayers(otherPlayers));
                    game.setMap(payload.mapData);
                    game.start();


                } else if (data.type == SocketEvent.NEXT_LVL) {
                    const mapData = data.payload as MapData;
                    game.stop();
                    game.setMap(mapData);
                    game.start();


                } else if (data.type == SocketEvent.END_GAME) {
                    // Make canvas small.
                    game.CANVAS_ELEMENTS.forEach(element => {
                        $(element).attr("height", 1);
                        $(element).attr("width", 10);
                    });

                    // Stop game and read scores from payload.
                    game.stop();

                    const scorePayload: ScorePayload = data.payload;

                    // This game
                    const thisGameScores = scorePayload.thisGame;
                    thisGameScores.forEach(score => {
                        $("#score_table_this").append(
                            `<tr class="score_row"><td><div class="score_name">${score.name}</div></td><td class="score_time">${msToMmSsMs(score.totalTime)}</td></tr>`
                        );
                    });

                    // Hall of fame (all games)
                    const allGamesScores = scorePayload.allGames;
                    allGamesScores.forEach(score => {
                        $("#score_table_all").append(
                            `<tr class="score_row"><td><div class="score_name">${score.name}</div></td><td class="score_time">${msToMmSsMs(score.totalTime)}</td></tr>`
                        );
                    });

                    domOperator.hideAllExcept(["#score_modal"]);

                    // Play sound.
                    if (thisGameScores[0].userId == user.id) {
                        $("body").append('<div id="bg_lake" class="bg_image"></div>');
                        new Audio("./sound/Congratulations.mp3").play();
                        $("#score_title").text(translator.getTxtForTag(Lang.Tag.congratulations));
                    } else {
                        $("body").append('<div id="bg_gondola" class="bg_image bg_blurred"></div>');
                        new Audio("./sound/MaybeNextTime.mp3").play();
                        $("#score_title").text(translator.getTxtForTag(Lang.Tag.maybe_next_time));
                    }

                }

            }

            // Changing the group
            $("#" + constants.GROUP_0).on("click", function () {
                moveUserToGroup(user, constants.GROUP_0, socket);
            })
            $("#" + constants.GROUP_1).on("click", function () {
                moveUserToGroup(user, constants.GROUP_1, socket);
            });
            $("#" + constants.GROUP_2).on("click", function () {
                moveUserToGroup(user, constants.GROUP_2, socket);
            });
            $("#" + constants.GROUP_3).on("click", function () {
                moveUserToGroup(user, constants.GROUP_3, socket);
            });

            // Start a game
            $("#" + constants.BUTTON_GROUP_1).on("click", function () {
                startGame(user, constants.GROUP_1, socket);
            })
            $("#" + constants.BUTTON_GROUP_2).on("click", function () {
                startGame(user, constants.GROUP_2, socket);
            })
            $("#" + constants.BUTTON_GROUP_3).on("click", function () {
                startGame(user, constants.GROUP_3, socket);
            })
        };
    }

    // Show element that says - no connection possible (after 800 ms)
    // If the connection was established, then nothing will happen, because the element was deleted.
    let i = 0;
    const interv = setInterval(() => {
        if (i == 1) {
            clearInterval(interv);
        } else {
            $("#no_connection_to_server").css("visibility", "visible");
            i++;
        }
    }, 800);
});