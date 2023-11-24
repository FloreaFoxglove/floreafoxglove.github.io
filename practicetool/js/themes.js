const themes = {
    "light": {
        "bg1": "#ded8cc",
        "bg2": "#f7f6f2",
        "fg1": "#b5a47f",
        "fg2": "#8c794f",
        "txt": "#383631",
        "bg-pattern": `unset`,
        "fg-pattern": `unset`,
        "font-h": "sans-serif",
        "font-p": "monospace"
    },
    "dark": {
        "bg1": "#100f1c",
        "bg2": "#0c1524",
        "fg1": "#514f82",
        "fg2": "#3a3963",
        "txt": "#c5cae0",
        "bg-pattern": `unset`,
        "fg-pattern": `unset`,
        "font-h": "sans-serif",
        "font-p": "monospace"
    },
    "ace": {
        "bg1": "#1d1d1d",
        "bg2": "black",
        "fg1": "#912717",
        "fg2": "#D33E25",
        "txt": "#d4d4d4",
        "bg-pattern": `url("../img/card.png")`,
        "fg-pattern": `url("../img/noise.png")`,
        "font-h": "chinyen",
        "font-p": "monospace"
    }
}
let currentTheme;

const setTheme = function () {
    $(":root").css({
        "--theme-bg-primary": themes[currentTheme]["bg1"],
        "--theme-bg-secondary": themes[currentTheme]["bg2"],
        "--theme-fg-primary": themes[currentTheme]["fg1"],
        "--theme-fg-secondary": themes[currentTheme]["fg2"],
        "--theme-txt-primary": themes[currentTheme]["txt"],
        "--theme-bg-pattern": themes[currentTheme]["bg-pattern"],
        "--theme-fg-pattern": themes[currentTheme]["fg-pattern"],
        "--theme-font-h-primary": themes[currentTheme]["font-h"],
        "--theme-font-p": themes[currentTheme]["font-p"],
    });
    if (currentTheme == "ace"){
        $(".background .side").removeClass("hidden")
    }else{
        $(".background .side").addClass("hidden")
    }
    localStorage.setItem("theme", currentTheme)
}
$(document).ready(function () {
    if (localStorage.getItem("theme")) {
        currentTheme = localStorage.getItem("theme")
    } else {
        localStorage.setItem("theme", "ace")
    }
    $("#theme-select").val(currentTheme)
    setTheme();
})

$("#theme-select").on("change", function () {
    currentTheme = $("#theme-select").val()
    setTheme()
})
