function setCurrentPage(pageID) {
    $(".lastpage").removeClass("lastpage");
    $(".currentpage").addClass("lastpage");
    $(".currentpage").removeClass("currentpage");
    $("#" + String(pageID)).addClass("currentpage");
}

function setBPM() {
    lasttimestamp = timestamp;
    timestamp = Date.now();

    if (lasttimestamp != 0) {
        if (timearray.length > 299) {
            timearray.shift();
        }
        let newvalue = timestamp - lasttimestamp;

        if (timearray.length > 0) {
            if (newvalue < average_interval + 100 && newvalue > average_interval - 100) {
                timearray.push(newvalue);
            } else {
                if (timearray.length > 5) {
                    console.log("new value " + String(newvalue) + "trashed");
                } else {
                    timearray.shift();
                    timearray.push(newvalue);
                }
            }
        }else{
            timearray.push(newvalue);
        }

        average_interval = timearray.reduce((a, b) => a + b, 0) / timearray.length;
        console.log(timearray);

        bpm = (1000 / (average_interval)) * 60;

        $("#bpmpreview").html(String(Math.round(bpm * 100) / 100));
    }

    $('#bpmbg').removeClass("bpmtap");
    $('#bpmbg').addClass("bpmtap");
    setTimeout(function () {
        $('#bpmbg').removeClass("bpmtap");
    }, 60);
}

$('#displayBPM').on("click", function () {
    setBPM();
});

var lasttimestamp = 0;
var timestamp = 0;
var tempbpm = 0;
var timearray = [];
var average_interval = 0;

function clearBPM() {
    bpm = 0;
    timearray = [];
    lasttimestamp = 0;
    timestamp = 0;
    average_interval = 0;
    $("#bpmpreview").html("-");
}




$("#bpmconfirm").on("click", function () {
    $("#setBPM").val(Math.round(bpm * 100) / 100);
    setCurrentPage("options");
    clearBPM();
});

$("#bpmcancel").on("click", function () {
    setCurrentPage("options");
    clearBPM();
});

$("#timingBPMbutton").on("click", function () {
    setCurrentPage("displayBPM");
    clearBPM();
});









//Playback functions
var ticksound = new Audio('tick2.wav');
var ticksound2 = new Audio('tick2.wav');
var beatinterval = 0;
var beatactive = false;
var timer;
var current_sound = ticksound;

function tick() {
    beatinterval = 1000 / ($("#setBPM").val() / 60);

    timer = setInterval(function () {
        current_sound.play();
        if (current_sound == ticksound){
            current_sound = ticksound2;
        }else{
            current_sound = ticksound;
        }
    }, beatinterval);
    /*var compare_time = Date.now();
    timer = true;

    if (timer == true){
        if (Date.now() > compare_time + beatinterval){
            ticksound.play();
            console.log("yes");
        }
    }*/


    beatinterval = 1000 / ($("#setBPM").val() / 60);

    $("#pbSpeed").html("BPM: " + String($("#setBPM").val()));
    setCurrentPage("displayPB");
}

function stop() {
    clearInterval(timer);
    //timer = false;
    setCurrentPage("options");
}

$("#button-start").on("click", function () {
    tick();
})

$("#setTimer").change(function () {
    var timerValue = $("#timerValue").val().length;
    if (timerValue == 2) {
        console.log("hello");
    }
})


$("#pbStop").on("click", function () {
    stop();
})