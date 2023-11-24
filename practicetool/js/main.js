var player;
let loop = {
    "active": false,
    ".start": 0,
    ".end": 0,
    "rest": 0
};

let loops = {
    "max": $("#speed-loops").val(),
    "current": 0,
    "rate": 0,
    "playing": false
}

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

function onYouTubeIframeAPIReady() {
    let id
    if (localStorage.getItem("last-id")) {
        id = localStorage.getItem("last-id")
    } else {
        id = '8QFdjDeSXHk';
    }
    player = new YT.Player('player', {
        height: '315',
        width: '560',
        videoId: id,
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
    $("#player").removeAttr("allowfullscreen")
    $("#player").removeAttr("allow")

}

const getPlayPercent = function (time) {
    return time / player.getDuration() * 100
}


const flipPlaybackSymbol = function () {
    if (player.getPlayerState() == 1) {
        $(".fa-play").addClass("hidden")
        $(".fa-pause").removeClass("hidden")
        if (loops["playing"] == false) {
            loops["max"] = $("#speed-loops").val();
            loops["current"] = 0;
            loops["rate"] = $("#speed-rate").val();
        }
    }
    if (player.getPlayerState() == -1 || player.getPlayerState() == 0 || player.getPlayerState() == 2) {
        $(".fa-play").removeClass("hidden")
        $(".fa-pause").addClass("hidden")
        if (loops["playing"] == false) {
            loops["current"] = 0;
            $(".c.loop-count").text(loops["current"])
        }
    }
}


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

        id = localStorage.setItem("last-id", inp)
        url = yt.concat(inp)
        player.cueVideoByUrl({
            'mediaContentUrl': url
        })
    }
    setLoopTime(0, ".start");
    setLoopTime(100, ".end");
})

const cardFlip = function (el, func) {
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
const mirrorVideo = function () {
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
const activateLoop = function () {
    $(".loop-indicator").toggleClass("hidden");
    $(".c.restart>span").toggleClass("hidden");
    $(".loopspeed").toggleClass("disabled");

    if (loop["active"] == true) {
        loop["active"] = false;
    } else {
        loop["active"] = true;
    }
}

const setLoopTime = function (timePercent, el) {
    let time = player.getDuration() * (timePercent / 100)
    let minutes = Math.floor(time / 60);
    let seconds = Math.round((time - (minutes * 60)))
    let secondstring = seconds;
    if (seconds < 10) {
        secondstring = `0${seconds}`
    }
    loop[el] = time;
    $(`.loop-indicator${el}`).css("--time", `${timePercent}%`)
    $(`button.time${el} > span`).text(`${minutes}:${secondstring}`)
}

$(".outerCard.loop .cardBack").on("click", function () {
    cardFlip(".outerCard.loop", activateLoop);
})
$(".outerCard.loop .close").on("click", function () {
    cardFlip(".outerCard.loop", activateLoop);
})

const setLoopWithButton = function (el) {
    let val = getPlayPercent(player.getCurrentTime());
    setLoopTime(val, el);
}
const setLoopWithSlider = function (el) {
    const setLoopSlider = function (e) {
        if (e.type == 'touchmove'){
            let touch = e.touches[0] || e.changedTouches[0];
            clickPosition = touch - bounds.left
            alert(clickPosition)
        }else{
            clickPosition = e.pageX - bounds.left;
        }
        val = clamp(0, 1, (clickPosition / scrubberWidth));
        $(el).css("--time", `${val*100}%`);
    }

    const end = function () {
        setLoopTime(val * 100, el);
    
        document.removeEventListener("touchmove", setLoopSlider)
        document.removeEventListener("touchend", end)
        document.removeEventListener("mousemove", setLoopSlider)
        document.removeEventListener("mouseup", end)
    }

    let val = getPlayPercent(loop[el]) / 100;
    let bounds = $("#scrubber")[0].getBoundingClientRect();
    let scrubberWidth = bounds.right - bounds.left;
    let clickPosition;
    
    document.addEventListener("mousemove", setLoopSlider)
    document.addEventListener("mouseup", end)
    document.addEventListener("touchmove", setLoopSlider)
    document.addEventListener("touchend", end)
}

$("button.time.start").on("click", function () {
    setLoopWithButton(".start")
})
$("button.time.end").on("click", function () {
    setLoopWithButton(".end")
})

$(".loop-indicator.start").on("mousedown", function () {
    setLoopWithSlider(".start")
})
$(".loop-indicator.end").on("mousedown", function () {
    setLoopWithSlider(".end")
})

document.querySelectorAll(".loop-indicator.start").forEach((item) => {
    item.addEventListener("touchstart", function () {
        setLoopWithSlider(".start")
    })
});

document.querySelectorAll(".loop-indicator.end").forEach((item) => {
    item.addEventListener("touchstart", function () {
        setLoopWithSlider(".end")
    })
});

// $(".loop-indicator.start").on("touchstart", function () {
//     setLoopWithSlider(".start")
// })
// $(".loop-indicator.end").on("touchstart", function () {
//     setLoopWithSlider(".end")
// })

$("#looprest").on("change", function () {
    loop["rest"] = $("#looprest").val()
})



// speed
const setSpeed = function (val) {
    if (val) {
        player.setPlaybackRate(parseFloat(val))
    } else {
        player.setPlaybackRate(1)
    }
}

$(".outerCard.speed .cardBack").on("click", function () {
    cardFlip(".outerCard.speed", setSpeed);
})
$(".outerCard.speed .close").on("click", function () {
    cardFlip(".outerCard.speed", setSpeed);
    $(".c.loop-count").addClass('hidden')
    $("#speed-rate").val(0)
})

$("#playback-speed").on("change", function () {
    setSpeed($("#playback-speed").val());
})

$("#speed-rate").on("change", function () {
    if ($("#speed-rate").val() != 0) {
        $(".c.loop-count").removeClass('hidden')
        $(".c.loop-count").text(0)
    } else {
        $(".c.loop-count").addClass('hidden')
    }
})

// player controls
// playback
let playInterval = 0;
let restInterval = false;

var ticksound = new Audio('../assets/sfx/tick2.wav');
var ticksound2 = new Audio('../assets/sfx/tick2.wav');

var current_sound = ticksound;

function speedup() {
    if (loops["rate"] > 0 && $("#playback-speed").val() < 1) {
        loops["current"] += 1
        if (loops["current"] >= loops["max"]) {
            loops["current"] = 0;

            let newspeed = Math.round((parseFloat($("#playback-speed").val()) + parseFloat($("#speed-rate").val())) * 10) / 10
            if (newspeed > 1) {
                newspeed = 1;
            }
            $("#playback-speed").val(String(newspeed)).change()
            player.setPlaybackRate(newspeed)
        }
        $(".c.loop-count").text(loops["current"])
    }
}

const restartAndLoop = function () {
    if (loop["active"]) {
        player.pauseVideo()
        restInterval = loop["rest"];
        if (restInterval > 0) {
            $("#rest-display").removeClass("hidden")
            $("#rest-display h2").text(restInterval)
            let pause = setInterval(() => {
                current_sound.play();
                current_sound = ticksound2 ? ticksound : ticksound2
                restInterval -= 1;
                $("#rest-display h2").text(restInterval)
                if (restInterval < 1) {
                    speedup()
                    clearInterval(pause)
                    pause = false
                    player.seekTo(loop[".start"])
                    player.playVideo()
                    restInterval = 0
                    $("#rest-display").addClass("hidden")
                }
            }, 1000);
        } else {
            player.seekTo(loop[".start"])
            player.playVideo()
            speedup()
        }
    }
}

const playTimer = function () {
    if (!playInterval) {
        playInterval = setInterval(() => {
            let progress = (player.getCurrentTime() / player.getDuration()) * 100;
            $("#scrubberButton").css("--progress", `${progress}%`);
            if (player.getCurrentTime() >= (loop[".end"])) {
                loops["playing"] = true;
                restartAndLoop();
                setTimeout(() => {
                    loops["playing"] = false;
                }, 3000)
            }
        }, 500);
    }
}

$(document).on("click", ".c.play", function () {
    flipPlaybackSymbol()
    if (player.getPlayerState() != 1) {
        player.playVideo()
        // $("#thumb").animate({"opacity": "0"}, 200)
        playTimer()
    } else {
        // player.setPlaybackRate(0)
        player.pauseVideo()
        clearInterval(playInterval)
        playInterval = false
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
    player.seekTo(player.getCurrentTime() - (1 / 59));
    $("#scrubberButton").css("--progress", `${player.getCurrentTime()/player.getDuration() * 100}%`);
})

// frame advance
$(document).on("click", ".c.frame-next", function () {
    player.seekTo(player.getCurrentTime() + (1 / 59));
    $("#scrubberButton").css("--progress", `${player.getCurrentTime()/player.getDuration() * 100}%`);
})

// restart
$(document).on("click", ".c.restart", function () {
    if (loop["active"] == false) {
        player.seekTo(0)
    } else {
        player.seekTo(loop[".start"])
    }
})

// scrubber stuff
const scrubVideo = function () {
    const scrubMove = function (e) {
        if (e.type == 'touchmove'){
            let touch = e.touches[0] || e.changedTouches[0];
            clickPosition = touch - bounds.left
        }else{
            clickPosition = e.pageX - bounds.left;
        }

        percent = clamp(0, 1, (clickPosition / scrubberWidth));
        $("#scrubberButton").css("--progress", `${percent*100}%`);
        player.seekTo(player.getDuration() * percent, false)
    }

    const scrubOff = function () {
        $("#scrubberButton").css("--progress", `${percent*100}%`);
        player.seekTo(player.getDuration() * percent, true);
        if (currentPlayState == 1) {
            player.playVideo();
        }
    
        document.removeEventListener("mousemove", scrubMove);
        document.removeEventListener("mouseup", scrubOff);
        document.removeEventListener("touchmove", scrubMove);
        document.removeEventListener("touchend", scrubOff);
    }

    let currentPlayState = player.getPlayerState();
    let bounds = $("#scrubber")[0].getBoundingClientRect();
    let scrubberWidth = bounds.right - bounds.left;
    let clickPosition;
    let percent;

    document.addEventListener("touchmove", scrubMove)
    document.addEventListener("touchend", scrubOff)
    document.addEventListener("mousemove", scrubMove)
    document.addEventListener("mouseup", scrubOff)
}

document.querySelector("#scrubberButton").addEventListener("touchstart", scrubVideo)
$(document).on("mousedown", "#scrubberButton", function () {
    scrubVideo()
})






const playerReady = function () {
    player.addEventListener('onStateChange', flipPlaybackSymbol())
    $("#videoTitle").text(player.getIframe().title)
    $("#optionContainer").removeClass("hidden")
    setLoopTime(0, ".start");
    setLoopTime(100, ".end");
}

const playerStateChange = function () {
    if (player.getPlayerState() == 1) {
        playTimer()
    } else if (player.getPlayerState() == 0) {
        restartAndLoop();
    } else {
        clearInterval(playInterval)
        playInterval = false;
    }
    flipPlaybackSymbol();
}