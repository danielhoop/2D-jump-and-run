import $ from "jquery";

const allElementsOnPage: Array<string> = [
    "#title",
    "#group-container",
    "#name-modal",
    "#map",
    "#player1",
    "#player2",
    "#player3",
    "#velocity",
    "#button-left",
    "#button-right",
    "#button-jump",
    "#chat",
    "#chat-open-button",
    "#chat-close-button",
    "#score-modal"
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
