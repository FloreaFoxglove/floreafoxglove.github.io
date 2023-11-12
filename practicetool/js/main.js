// open tools menu
$("button.tools").on("click", function () {
    if ($("nav").attr("data-active") == "true") {
        $("main").css("flex-shrink", "0")
        $("nav").attr("data-active", "false")
    } else {
        $("main").css("flex-shrink", "1")
        $("nav").attr("data-active", "true")
    }
})



// mirror iframe
$(".outerCard.mirror").on("click", function () {
    $(".outerCard.mirror").animate({
        textIndent: 0
    }, {
        duration: 200,
        step: function (now, fx) {
            $(this).css('transform', `scaleX(${1-fx.pos})`);
        },
        complete: function () {
            if ($(this).attr("data-active") == "false") {
                $(this).attr("data-active", "true")
                $("#player").css("transform", "scaleX(-1)")
            } else {
                $(this).attr("data-active", "false")
                $("#player").css("transform", "scaleX(1)")
            }
        }
    }).animate({
        textIndent: 1
    }, {
        duration: 300,
        step: function (now, fx) {
            $(this).css('transform', `scaleX(${fx.pos})`);
        }
    });
})


// all the fun youtube api stuff
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '315',
        width: '560',
        videoId: '8QFdjDeSXHk',
        playerVars: {
            'playsinline': 1,
            "color": "white",
            "disablekb": 1,
            "controls": 0,
            "iv_load_policy": 3,
            "playsinline": 1,
            "rel": 0
        },
        events: {
            'onStateChange': flipPlaybackSymbol
          }
    });
    $("#player").removeAttr("allowfullscreen")
    $("#player").removeAttr("allow")
    player.addEventListener('onStateChange', flipPlaybackSymbol())
}

const flipPlaybackSymbol = function () {
    if (player.getPlayerState() == 1){
        $(".fa-play").addClass("hidden")
        $(".fa-pause").removeClass("hidden")
    }
    if (player.getPlayerState() == -1 || player.getPlayerState() ==  0 || player.getPlayerState() == 2){
        $(".fa-play").removeClass("hidden")
        $(".fa-pause").addClass("hidden")
    }
}

// https://img.youtube.com/vi/3F_8OIY1kgA/0.jpg
$(document).on("click", "button.confirm", function () {
    let inp = $("#videoUrl").val()
    let yt = "https://www.youtube-nocookie.com/embed/"
    let url;

    if (inp.includes("youtu")) {
        if (inp.includes(".com/")) {
            inp = inp.split(".com/").pop()
        }
        if (inp.includes(".be/")) {
            inp = inp.split(".be/").pop()
        }
        inp = inp.replace("watch?v=", "")
        inp = inp.split("&")[0]
        inp = inp.split("?")[0]

        url = yt.concat(inp)
        player.cueVideoByUrl({
            'mediaContentUrl': url
        })
        // $("#thumb").animate({"opacity": "1"}, 200)
        // $("#thumb").css("background-image", `url(https://img.youtube.com/vi/${inp}/0.jpg)`)
    }
    $("#videoTitle").text(player.getIframe().title)
})

let playInterval;
$(document).on("click", ".c.play", function () {
    flipPlaybackSymbol()
    if (player.getPlayerState() != 1) {
        player.playVideo()
        // $("#thumb").animate({"opacity": "0"}, 200)
        if (!playInterval) {
            setInterval(() => {
                $("#playtime").text(Math.round(player.getCurrentTime() * 100) / 100)
            }, 10);
        }
    } else {
        // player.setPlaybackRate(0)
        player.pauseVideo()
        clearInterval(playInterval)
    }
})

$(document).on("click", ".c.fullscreen", function () {
    $("#optionContainer").toggleClass("fullscreen")
    $(".outerCard.play").toggleClass("fullscreen")
})