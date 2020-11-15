
const Locale = {
    "en_us": "en_us",
    "de_de": "de_de"
}

const Tag = {
    "enter_nickname": "enter_nickname",
    "proceed": "proceed",
    "choose_group": "choose_group",
    "lobby": "lobby",
    "game_1": "game_1",
    "game_2": "game_2",
    "game_3": "game_3",
    "start_game_1": "start_game_1",
    "start_game_2": "start_game_2",
    "start_game_3": "start_game_3",
    "congratulations": "congratulations",
    "maybe_next_time": "maybe_next_time"
}

const Element = {
    "name_editor_title": "name_editor_title",
    "name_enter_button": "name_enter_button",
    "choose_group_title": "choose_group_title",
    "goup_lobby_title": "goup_lobby_title",
    "group_1_title": "group_1_title",
    "group_2_title": "group_2_title",
    "group_3_title": "group_3_title",
    "button_group_id_1": "button_group_id_1",
    "button_group_id_2": "button_group_id_2",
    "button_group_id_3": "button_group_id_3"
}

const mapping = {
    [Element.name_editor_title]: Tag.enter_nickname,
    [Element.name_enter_button]: Tag.proceed,
    [Element.choose_group_title]: Tag.choose_group,
    [Element.goup_lobby_title]: Tag.lobby,
    [Element.group_1_title]: Tag.game_1,
    [Element.group_2_title]: Tag.game_2,
    [Element.group_3_title]: Tag.game_3,
    [Element.button_group_id_1]: Tag.start_game_1,
    [Element.button_group_id_2]: Tag.start_game_2,
    [Element.button_group_id_3]: Tag.start_game_3
}

const txt = {
    [Locale.en_us]: {
        [Tag.enter_nickname]: "Please enter your nickname",
        [Tag.proceed]: "Proceed",
        [Tag.choose_group]: "Choose your group by clicking on it.",
        [Tag.lobby]: "Lobby",
        [Tag.game_1]: "Game 1",
        [Tag.game_2]: "Game 2",
        [Tag.game_3]: "Game 3",
        [Tag.start_game_1]: "Start game 1!",
        [Tag.start_game_2]: "Start game 2!",
        [Tag.start_game_3]: "Start game 3!",
        [Tag.congratulations]: "Congratulations! You have won the game!",
        [Tag.maybe_next_time]: "Maybe next time..."
    },

    [Locale.de_de]: {
        [Tag.enter_nickname]: "Bitte gib deinen Namen an.",
        [Tag.proceed]: "Fortfahren",
        [Tag.choose_group]: "Wähle eine Gruppe aus, indem du auf sie klickst.",
        [Tag.lobby]: "Lobby",
        [Tag.game_1]: "Spiel 1",
        [Tag.game_2]: "Spiel 2",
        [Tag.game_3]: "Spiel 3",
        [Tag.start_game_1]: "Spiel 1 starten!",
        [Tag.start_game_2]: "Spiel 2 starten!",
        [Tag.start_game_3]: "Spiel 3 starten!",
        [Tag.congratulations]: "Glückwunsch! Du hast gewonnen!",
        [Tag.maybe_next_time]: "Vielleicht beim nächsten Mal..."
    }
}

const valuesToArr = function(obj): Array<string> {
    const arr: Array<string> = [];
    for(const key in obj) {
        arr.push(obj[key]);
    }
    return arr;
}

export default {
    Locale,
    Tag,
    elements: valuesToArr(Element),
    mapping,
    txt
}
