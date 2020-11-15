import $ from "jquery";

const allElementsOnPage: Array<string> = [
    "#title",
    "#group_container",
    "#name_modal",
    "#map",
    "#player1",
    "#player2",
    "#player3",
    "#velocity",
    "#button_left",
    "#button_right",
    "#button_jump",
    "#chat",
    "#chat_open_button",
    "#chat_close_button",
    "#score_modal"
]

const hideAllExcept = function(except: Array<string>): void {
    allElementsOnPage.forEach(element => {
        except.forEach(notHideElement => {
            if (element != notHideElement) {
                $(element).css("visibility", "hidden");
            }
        })
    });
    except.forEach(element => {
        $(element).css("visibility", "visible");
    })
} 

const isSmartphoneLayout = function(): boolean {
    return $(window).width() <= 600;
}

export default {
    hideAllExcept,
    isSmartphoneLayout
};
