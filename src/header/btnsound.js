{
    let EVENT_CLICK = Laya.Event.CLICK;
    let SOUND_INITED = false;

    class BtnSound extends ui.Game.BtnSoundUI {
        constructor () {
            super();

            this.initVoice();
        }

        initVoice () {
            let soundstatus = !!SOUNDSTATUS.CUR;

            this.stateDisabled.visible = !soundstatus;
            this.stateEnabled.visible = soundstatus;

            if(SOUND_INITED == true){return;}
            SOUND_INITED = true;

            Laya.SoundManager.musicMuted = !soundstatus;
            Laya.SoundManager.soundMuted = !soundstatus;
        }
        setVoiceStatus  () {
            switch(SOUNDSTATUS.CUR){
                case SOUNDSTATUS.ON:
                    SOUNDSTATUS.CUR = SOUNDSTATUS.OFF;

                    Laya.SoundManager.musicMuted = true;
                    Laya.SoundManager.soundMuted = true;

                    Laya.SoundManager.stopAllSound();
                    break;
                case SOUNDSTATUS.OFF:
                    SOUNDSTATUS.CUR = SOUNDSTATUS.ON;

                    Laya.SoundManager.musicMuted = false;
                    Laya.SoundManager.soundMuted = false;
                    break;
            }

            this.initVoice();
        }
    }
    Sail.class(BtnSound, "Com.Game.BtnSound");
}