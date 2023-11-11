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
$("#mirror").on("change", function(){
    if ($("#mirror").is(":checked")){
        $("#player").css("transform", "scaleX(-1)")
    }else{
        $("#player").css("transform", "scaleX(1)")
    }
})


// all the fun youtube api stuff
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '315',
        width: '560',
        videoId: 'ZpbmIKyhmWA',
        playerVars: {
            'playsinline': 1,
            "color": "white",
            "disablekb": 1,
            "controls": 0,
            "iv_load_policy": 3,
            "playsinline": 1,
            "rel": 0
        }
    });
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
            player.cueVideoByUrl({'mediaContentUrl':url})
            $("#thumb").css("background-image", `url(https://img.youtube.com/vi/${inp}/0.jpg)`)
        }
})

var playing = false;

$(document).on("click", "button.play", function () {
    if (player.getPlayerState() != 1){
        player.playVideo()
        playing = true
    }else{
        player.pauseVideo()
        playing = false
    }
})

setInterval(() => {
    if (playing){
        $("#playtime").text(Math.round(player.getCurrentTime() * 100) / 100)
    }    
}, 10);


$(document).on("click", "button.fullscreen", function () {
    if ($("#playerContainer").attr("data-fs") == "false"){
        $("#playerContainer").toggleClass("fullscreen")
        $("#player").css({
            "width": "100vw",
            "height": "100vh"
        })

        $("#playerContainer").attr("data-fs", "true")
    }else{
        $("#playerContainer").toggleClass("fullscreen")
        $("#player").css({
            "width": "unset",
            "height": "unset"
        })

        $("#playerContainer").attr("data-fs", "false")
    }
})