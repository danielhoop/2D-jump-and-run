export default class Translator {
    private locale: string;
    private fallback: string;
    private elements: Array<string>;
    private txt: Record<string, Record<string, string>>;
    private elementTagMapping: Record<string, string>;
    private verbose: boolean;

    constructor(locale: string, fallback: string, elements: Array<string>, elementTagMapping: Record<string, string>, txt: Record<string, Record<string, string>>, verbose: boolean) {
        this.verbose = verbose;
        this.locale = locale;
        this.fallback = fallback;
        this.elements = elements;
        this.elementTagMapping = elementTagMapping;
        this.txt = txt
    }

    setLocale(locale: string): void {
        this.locale = locale;
        this.nameAllElments();
    }

    nameAllElments(): void {
        const { txtForLocale, txtFallback, repeatErrorMsg } = this.getTxtForLocal();

        this.elements.forEach(element => {
            // Acces text by: locale->tag (get tag by through mapping).
            let txt = txtForLocale[this.elementTagMapping[element]];
            if (!txt && repeatErrorMsg) {
                console.log("No text found for element: '" + element + "'. Trying fallback.");
                txt = txtFallback[this.elementTagMapping[element]];
                if (!txt) {
                    console.log("No fallback text found for element: '" + element + "'.");
                    txt = "Text is missing."
                }
            }
            document.getElementById(element).innerText = txt;
        });
    }

    getTxtForTag(tag: string): string {
        const { txtForLocale, txtFallback, repeatErrorMsg } = this.getTxtForLocal();

        let txt = txtForLocale[tag];
        if (!txt && repeatErrorMsg) {
            console.log("No text found for tag: '" + tag + "'. Trying fallback.");
            txt = txtFallback[tag];
            if (!txt) {
                console.log("No fallback text found for tag: '" + tag + "'.");
                txt = "Text is missing."
            }
        }
        return txt;
    }

    private getTxtForLocal() {
        let txtForLocale = this.txt[this.locale];
        const txtFallback = this.txt[this.fallback];
        let repeatErrorMsg = true;
        
        if (!txtForLocale) {
            if (this.verbose) {
                console.log(`No text found for the locale '${this.locale}'. Switching to fallback locale.`);
                repeatErrorMsg = false;
            }
            txtForLocale = txtFallback;
            if (!txtForLocale) {
                console.log(`No text found for the fallback locale '${this.fallback}'.`);
            }
        }

        return { txtForLocale, txtFallback, repeatErrorMsg }
    }
}
