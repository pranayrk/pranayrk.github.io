const HOME = "/";
const NOTES = HOME + "pages/";

function loadReveal() {
    Reveal.initialize({
        width: 1240,
        height: 760,
        margin: 0.04,
        hash: true,
        plugins: [ RevealMarkdown, RevealHighlight, RevealNotes, RevealMath.KaTeX, RevealSubreader],
        katex: {
            fleqn: true,
            local: "bin/plugin/math/node_modules/katex"
        },
        subreader: {
            dir: "bin/plugin"
        }
    });

}

function load(content) {
    Reveal.destroy();

    let slides = document.getElementsByClassName("slides")[0];
    slides.innerHTML = content;

    loadReveal();
    Reveal.slide(0);
}

function loadMarkdown(content) {
    load("<section data-markdown>\n" + content + "\n</section>")
}

function loadDir(dir) {
    fetch(NOTES + dir + ".dir")
        .then(res => {
            if(!res.ok) {
                loadMarkdown("**" + dir + "** not found");
                return "";
            }
            return res.text()
        })
        .then(directory => {
            if(!directory) {
                return;
            }
            let content = "";
            const lines = directory.split("\n");
            lines.forEach((line, index) => {
                if(!line) {
                    return;
                }
                if(/^\d+/.test(line)) {
                    check = line.replace(line + ":", "").trim()
                    if(!check) {
                        return;
                    }

                    line = line.substring(0, line.lastIndexOf(")") + 1)
                    content += "* " + line + "\n";
                } else {
                    if(line.startsWith("# ") && index != 0) {
                        content += "\n\n---\n\n";
                    }
                    content += line + "\n"
                }
            });
            loadMarkdown(content)
        });
}

function loadCode(dir, code) {
    fetch(NOTES + dir + ".dir")
        .then(res => {
            if(!res.ok) {
                loadMarkdown("**" + dir + "** not found");
                return "";
            }
            return res.text()
        })
        .then(directory => {
            if(!directory) {
                return;
            }
            let content = "";
            const lines = directory.split("\n");
            let found = false;
            for(let i = 0; i < lines.length; i++) {
                let line = lines[i]
                if(!line) {
                    continue;
                }
                if(line.startsWith(code + ":")) {
                    found = true;
                    let link = line.substring(line.indexOf("(") + 1, line.lastIndexOf(")"))
                    goToLink(link)
                    break;
                }
            }
            if(!found) {
                loadMarkdown("**" + code + "** not found in **" + dir + "**")
            }
        });
}

function goToCode(code) {
    document.getElementById("search").value = code;

    if(!code) {
        window.location = HOME;
        return;
    }

    code = code.toLowerCase(); 

    let i = 0;
    for (; i < code.length && (code[i] < '0' || code[i] > '9'); i++);
    let dir = code.substring(0,i);
    code = code.substring(i);

    if (!code) {
        loadDir(dir)
    } else {
        loadCode(dir, code)
    }
}

function goToLink(link) {
    if(!link) {
        return;
    }
    if(link.startsWith("http")) {
        if(link.startsWith(HOME)) {
            window.location = link;
        } else {
            window.open(link) 
        }
    } else {
        if(link.startsWith("dir:")) {
            loadDir(link.replace("dir:",""));
        } else if (link.startsWith("rev:")) {
            link = link.replace("rev:","");
            fetch(NOTES + "/" + link)
                .then(res => {
                    if(!res.ok) {
                        loadMarkdown("**" + link + "** not found");
                        return "";
                    }
                    return res.text()
                })
                .then(content => {
                    if(!content) {
                        return;
                    }
                    load(content);
                });
        } else if (link.startsWith("md:")) {
            link = link.replace("md:","");
            fetch(NOTES + "/" + link)
                .then(res => {
                    if(!res.ok) {
                        loadMarkdown("**" + link + "** not found");
                        return "";
                    }
                    return res.text()
                })
                .then(content => {
                    if(!content) {
                        return;
                    }
                    loadMarkdown(content);
                });
        }
    }
}

function attachLinkEvent() {
    document.addEventListener('click', function (e) {
        if (e.target.nodeName == 'A') {
            e.stopPropagation();
            e.preventDefault();
            link = e.srcElement.attributes.href.textContent;
            if(!link) {
                return;
            }
            goToLink(link);
        }
    });
}

function loadCSS(state) {
    document.getElementById('state').setAttribute('href','bin/dist/note_theme/' + state + ".css");
}

Reveal.addEventListener('dharma', function() {
    loadCSS('dharma');
}, false );

Reveal.addEventListener('maths', function() {
    loadCSS('maths');
}, false );
