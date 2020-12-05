import $ from "jquery";

const allElementsOnPage: Array<string> = [
    "#title",
    "#group_container",
    "#name_modal",
    "#map",
    "#player1",
    "#player2",
    "#player3",
    "#player4",
    "#player5",
    "#player6",
    "#player7",
    "#player8",
    "#player9",
    "#player10",
    "#velocity",
    "#button_left",
    "#button_right",
    "#button_jump",
    "#chat",
    "#chat_open_button",
    "#chat_close_button",
    "#score_modal"
]

const hideAllExcept = function (except: Array<string>): void {
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

const isSmartphoneLayout = function (): boolean {
    return $(window).width() <= 600;
}






// Orientation handling
// https://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
let previousHeightWidth = $(window).width() + $(window).height();
let previousOrientation = window.orientation;
let orientationChangeInterval = null;
let wasSmartphoneLayout = false;

const checkScreenOrientation = function (): void {
    const currentHeightWith = $(window).width() + $(window).height();
    if (window.orientation !== previousOrientation || currentHeightWith != previousHeightWidth) {
        previousOrientation = window.orientation;
        previousHeightWidth = currentHeightWith;

        // Determine which elements to show.
        let elementsToShow = [];
        if (isSmartphoneLayout()) {
            if (!wasSmartphoneLayout) {
                elementsToShow = ["#group_container", "#chat_open_button"];
                wasSmartphoneLayout = true;
            }
        } else {
            elementsToShow = ["#group_container", "#chat"];
            wasSmartphoneLayout = false;
        }
        hideAllExcept(elementsToShow);
    }
};

const addOrientationChangeFunction = function (): void {
    window.addEventListener("resize", checkScreenOrientation, false);
    window.addEventListener("orientationchange", checkScreenOrientation, false);

    // (optional) Android doesn't always fire orientationChange on 180 degree turns
    orientationChangeInterval = setInterval(checkScreenOrientation, 2000);
}

const removeOrientationChangeFunction = function (): void {
    window.removeEventListener("resize", checkScreenOrientation, false);
    window.removeEventListener("orientationchange", checkScreenOrientation, false);
    clearInterval(orientationChangeInterval);
}





export default {
    hideAllExcept,
    isSmartphoneLayout,
    checkScreenOrientation,
    addOrientationChangeFunction,
    removeOrientationChangeFunction
};
