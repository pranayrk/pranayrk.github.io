"use strict";

let CONFIG;

function loadConfig() {
    if(CONFIG && CONFIG.loaded) {
        //TODO: Remove once multiple events on reveal are handled
        return;
    }

    CONFIG = Reveal.getConfig().subreader;
    if(!CONFIG) {
        CONFIG = {};
    }

    if(!CONFIG.dir) {
        CONFIG.dir = "plugin";
    }
    CONFIG.dir += "/subreader/";

    if(!CONFIG.speed) {
        CONFIG.speed = 1;
    }
    CONFIG.loaded = true;
}

function handleCueCommands(cue) {
    if(cue.startsWith("{{gotoslide}}")) {
        const goToSlide = cue.replace("{{gotoslide}}", "").trim();
        Reveal.slide(goToSlide, 0, 0);
        return true;
    }
    switch (cue) {
        case "{{left}}":
            Reveal.left();
            return true;
        case "{{right}}":
            Reveal.right();
            return true;
        case "{{up}}":
            Reveal.up();
            return true;
        case "{{down}}":
            Reveal.down();
            return true;
        case "{{prev}}":
            Reveal.prev();
            return true;
        case "{{next}}":
            Reveal.next();
            return true;
        case "{{pause}}":
            document.getElementById("submedia").pause();
            return true;
        case "{{remove}}":
            removeSubtitle();
            return true;
        default:
            return false;    
    }
}

function removeSubtitle() {
    const subtitle = document.getElementById("subtitle");
    if (subtitle) {
        subtitle.remove();
    }
}

function addSubtitle() {
    if(!CONFIG.src) {
        return;
    }
    removeSubtitle();
    const audio = document.createElement("audio");
    audio.src= CONFIG.dir + "blank.mp3";
    audio.id = "submedia";
    audio.controls = "";
    audio.playbackRate = CONFIG.speed;

    const track = document.createElement("track");
    track.kind = "captions";
    track.label = "English";
    track.srclang = "en";
    track.src = CONFIG.src;
    track.mode = "showing"

    track.addEventListener('cuechange', (event) => {
        const cues = event.target.track.activeCues
        const subtitleText = document.getElementById("subtitle_text");
        if(cues.length > 0) {
            if(!handleCueCommands(cues[0].text)) {
                let text = cues[0].text;
                text = text.replace("\n", "<br/>");
                subtitleText.innerHTML = text;
            }
        } else {
            subtitleText.innerHTML = "";
        }
    });

    audio.appendChild(track)
    audio.textTracks[0].mode = "showing"


    const subtitle = document.createElement("div");
    subtitle.id = "subtitle"

    subtitle.appendChild(audio);

    const subtitleText = document.createElement("div");
    subtitleText.id = "subtitle_text";
    subtitle.appendChild(subtitleText);

    const slides = Reveal.getSlidesElement();
    slides.appendChild(subtitle);

    audio.play();
}

function loadSubtitle(src, speed) {
    CONFIG.src = src;
    if(!speed) {
        speed = 1;
    }
    CONFIG.speed = speed;
    removeSubtitle();
    addSubtitle();
}


window.RevealSubreader = window.SubReader || {
    id: 'RevealSubreader',

    init: function(deck) {
           Reveal.addEventListener( 'ready', function( event ) {
            loadConfig();
            addSubtitle();
        });
        Reveal.on('slidechanged', (event) => {
                const audio = document.getElementById("submedia");
                if(audio) {
                    audio.pause();
                }
        });
        Reveal.on('slidetransitionend', (event) => {
            const state = Reveal.getState();
            if(state.indexh == 0 && state.indexv == 0) {
                removeSubtitle();
            } else {
                if(event.currentSlide.hasAttribute("data-subtitle")) {
                    CONFIG.src = event.currentSlide.getAttribute("data-subtitle");
                    if(event.currentSlide.hasAttribute("data-subtitle-speed")) {
                        CONFIG.speed = event.currentSlide.getAttribute("data-subtitle-speed");
                    }
                    removeSubtitle();
                    addSubtitle();
                }
                else {
                    let audio = document.getElementById("submedia");
                    if(audio) {
                        audio.play();
                    }
                }
            }
        });
    }
}
