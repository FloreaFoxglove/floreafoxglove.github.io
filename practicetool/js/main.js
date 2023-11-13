const clamp = function (min, max, val) {
    return Math.min(max, Math.max(min, val));
}

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
            "rel": 0,
            "vq": "hd1080"
        },
        events: {
            'onStateChange': playerStateChange,
            'onReady': playerReady
        }
    });
   
}

const playerReady = function () {
    $("#player").removeAttr("allowfullscreen")
    $("#player").removeAttr("allow")
    player.addEventListener('onStateChange', flipPlaybackSymbol())
    $("#videoTitle").text(player.getIframe().title)
    setLoopTime(0, ".start");
    setLoopTime(100, ".end");
}

const playerStateChange = function () {
    if (player.getPlayerState() == 1) {
        setInterval(function () {
            var progress = (player.getCurrentTime() / player.getDuration()) * 100;
            $("#scrubberButton").css("--progress", `${progress}%`);
        }, 1000)
    }
    flipPlaybackSymbol();
}

const flipPlaybackSymbol = function () {
    if (player.getPlayerState() == 1) {
        $(".fa-play").addClass("hidden")
        $(".fa-pause").removeClass("hidden")
    }
    if (player.getPlayerState() == -1 || player.getPlayerState() == 0 || player.getPlayerState() == 2) {
        $(".fa-play").removeClass("hidden")
        $(".fa-pause").addClass("hidden")
    }
}



// player controls
// playback
let playInterval;
$(document).on("click", ".c.play", function () {
    flipPlaybackSymbol()
    if (player.getPlayerState() != 1) {
        player.playVideo()
        // $("#thumb").animate({"opacity": "0"}, 200)
        if (!playInterval) {
            playInterval = setInterval(() => {
                $("#playtime").text(Math.round(player.getCurrentTime() * 100) / 100)
            }, 10);
        }
    } else {
        // player.setPlaybackRate(0)
        player.pauseVideo()
        clearInterval(playInterval)
    }
})

// fullscreen
$(document).on("click", ".c.fullscreen", function () {
    $("#optionContainer").toggleClass("fullscreen")
    $(".outerCard.play").toggleClass("fullscreen")
    $("button.tools").toggleClass("fullscreen")
})

// frame reverse
$(document).on("click", ".c.frame-prev", function () {
    player.seekTo(player.getCurrentTime()-(1/59));
    $("#scrubberButton").css("--progress", `${player.getCurrentTime()/player.getDuration() * 100}%`);
})

// frame advance
$(document).on("click", ".c.frame-next", function () {
    player.seekTo(player.getCurrentTime()+(1/59));
    $("#scrubberButton").css("--progress", `${player.getCurrentTime()/player.getDuration() * 100}%`);
})

// scrubber stuff
$(document).on("mousedown", "#scrubberButton", function () {
    let currentPlayState = player.getPlayerState();
    let bounds = $("#scrubber")[0].getBoundingClientRect();
    let scrubberWidth = bounds.right - bounds.left;
    let clickPosition;
    let percent;
    $(document).on("mousemove", function (event) {
        clickPosition = event.pageX - bounds.left;
        percent = clamp(0, 1, (clickPosition / scrubberWidth));
        $("#scrubberButton").css("--progress", `${percent*100}%`);
        player.seekTo(player.getDuration() * percent, false)
    })
    $(document).on("mouseup", function () {
        $("#scrubberButton").css("--progress", `${percent*100}%`);
        player.seekTo(player.getDuration() * percent, true);
        if (currentPlayState == 1){
            player.playVideo();
        }
        $(document).off("mousemove");
        $(document).off("mouseup");
    })
})



// option cards



// set video
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
    }
    $("#videoTitle").text(player.getIframe().title)
})

const cardFlip = function (el, func){
    $(el).animate({
        textIndent: 0
    }, {
        duration: 200,
        step: function (now, fx) {
            $(this).css('transform', `scaleX(${1-fx.pos})`);
        },
        complete: function () {
            if ($(this).attr("data-active") == "false") {
                $(this).attr("data-active", "true")
            } else {
                $(this).attr("data-active", "false")
            }
            func()
        }
    }).animate({
        textIndent: 1
    }, {
        duration: 300,
        step: function (now, fx) {
            $(this).css('transform', `scaleX(${fx.pos})`);
        }
    });
}

// mirror iframe
const mirrorVideo = function(){
    if ($(".outerCard.mirror").attr("data-active") == "true") {
        $("#player").css("transform", "scaleX(-1)")
    } else {
        $("#player").css("transform", "scaleX(1)")
    }
}

$(".outerCard.mirror .cardBack").on("click", function () {
    cardFlip(".outerCard.mirror", mirrorVideo);
})
$(".outerCard.mirror .close").on("click", function () {
    cardFlip(".outerCard.mirror", mirrorVideo);
})

// loop video
const activateLoop = function(){
    return
}

const setLoopTime = function(timePercent, el){
    let time = player.getDuration() * (timePercent / 100)
    let minutes = Math.floor(time/60);
    let seconds = (time - (minutes * 60))
    let secondstring = seconds;
    if (seconds < 10){
        secondstring = `0${seconds}`
    }
    $(`.loop-indicator${el}`).css("--time", `${timePercent * 100}%`)
    $(`span.time${el}`).text(`${minutes}:${secondstring}`)
}

$(".outerCard.loop .cardBack").on("click", function () {
    cardFlip(".outerCard.loop", activateLoop);
})
$(".outerCard.loop .close").on("click", function () {
    cardFlip(".outerCard.loop", activateLoop);
})