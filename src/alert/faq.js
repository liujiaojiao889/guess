{
    let EVENT_CLICK = Laya.Event.CLICK;

    class Faq extends ui.Alert.FaqUI {
        constructor () {
            super();
            this.name = "faq";
            this.group = "help";

            this.init();
        }

        init () {
            this.mainPanel.vScrollBarSkin = "";
            this.btnClose.on(EVENT_CLICK, this, this.close);
            this.btnSkip.on(EVENT_CLICK, this, this.close);
        }

        onOpened () {
            console.log("Faq opened");
        }
        onClosed () {
            console.log("Faq closed");
        }
    }
    Sail.class(Faq, "Alert.Faq");
}