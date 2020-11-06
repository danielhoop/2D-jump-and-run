import $ from "jquery";

const allElementsOnPage: Array<string> = [
    "#title",
    "#group-container",
    "#name-modal",
    //".game-canvas",
    "#map",
    "#palyer1",
    "#palyer2",
    "#palyer3",
    "#velocity",
    "#gamepad",
    "#chat",
    "#chat-open-button"
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

export default {
    hideAllExcept
};
