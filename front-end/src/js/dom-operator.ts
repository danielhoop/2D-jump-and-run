import $ from "jquery";

const allElementsOnPage: Array<string> = [
    "#overlay",
    "#name-modal",
    "#game",
    "#chat",
    "#chat-open-button"
]

const hideAllExcept = function(except: Array<string>): void {
    allElementsOnPage.forEach(element => {
        except.forEach(notHideElement => {
            if (element != notHideElement) {
                $(element).hide();
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
