// clamp function keeps value between two numbers
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// angle function calculates angle between two points
const calculateAngle = (startX, startY, endX, endY) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angleInRadians * (180 / Math.PI) + 180;

    // Convert to positive angles
    let positiveAngle = (angleInDegrees + 360) % 360;

    return positiveAngle;
}

// position given a starting point, angle and distance
const calculateCoordinates = (startX, startY, distance, angleInDegrees) => {
    // Convert the angle from degrees to radians
    const angleInRadians = (angleInDegrees * Math.PI) / 180;

    // Calculate the new coordinates
    const newX = startX + distance * Math.cos(angleInRadians);
    const newY = startY + distance * Math.sin(angleInRadians);

    return {
        x: newX,
        y: newY
    };
}

// calculate distance between two points
const calculateDistance = (x1, y1, x2, y2) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance;
}

// create list of coordinates from each core
const getCoreCoordinates = (cores) => {
    let coordinates = [];
    cores.each(function (i, obj) {
        coordinates.push([i, (parseInt($(obj).css("left").replace(/px/, "")) + 12), (parseInt($(obj).css("top").replace(/px/, "")) + 12), $(obj).attr("data-state")]);
    });
    return coordinates;
}


// global object variables
var coreSize = 24;
var coreHitbox = 48;
var maxMovement = 800;
var lineQoLArea = 36;
var lineWidth = 12;
var moving = false;

// create a list of cores to refer to later
var cores = {
    0: {
        x: 180,
        y: 92,
        state: "possessed"
    },
    1: {
        x: 240,
        y: 112,
        state: "empty"
    },
    2: {
        x: 480,
        y: 600,
        state: "empty",
        object: "objWheel",
        width: 208,
        height: 208
    }
};
var currentCore = 0;

createCores(cores);
initialize();

function createCores(coreList) {
    $("#playField").html("");
    for (let core in coreList) {
        $("#playField").append(`
            <div class="core" data-state="${coreList[core].state}" style="left:${coreList[core].x - (coreHitbox / 2)}px; top:${coreList[core].y - (coreHitbox / 2)}px;">
                <div class="coreVisuals"></div>
            </div>
        `);

        if (coreList[core].state == "possessed") {
            $("#lineQoLArea").css({
                "left": coreList[core].x - (lineQoLArea / 2),
                "top": coreList[core].y - (lineQoLArea / 2)
            })
        }

        $("#graphics").html("");
        if (coreList[core].object) {
            $("#graphics").append(`
                <div id="${coreList[core].object}" style="left:${coreList[core].x - (coreList[core].width / 2)}px; top:${coreList[core].y - (coreList[core].height / 2)}px; width:${coreList[core].width}px; height:${coreList[core].height}px;"></div>
            `);
        }
    }

    $(".core").css({
        "width": coreHitbox,
        "height": coreHitbox
    })
    $(".core>.coreVisuals").css({
        "width": coreSize,
        "height": coreSize
    })
}

function initialize() {
    $("#line").css({
        "width": lineWidth,
        "height": lineWidth
    })
    $("#lineQoLArea").css({
        "width": lineQoLArea,
        "height": lineQoLArea
    })
}

//CONTROLS
// when clicking the currently possessed core... 
$(document).on("mousedown", '.core[data-state="possessed"]', function (event) {
    event.preventDefault();
    moving = true;

    $('#line').css({
        "left": cores[currentCore].x - (lineWidth / 2),
        "top": cores[currentCore].y - (lineWidth / 2),
        "opacity": 1
    });

    var mouse = {
        x: event.pageX,
        y: event.pageY
    }
    updateLine(mouse);
})


// when releasing the mouse button
$(document).mouseup(function () {
    if (moving) {
        coreSwitch();
        moving = false;
        $('#line').css({
            "opacity": 0,
            "width": 12
        });
    }

})


// mouse position to be referred to later
$(document).mousemove(function (event) {
    if (moving) {
        var mouse = {
            x: event.pageX,
            y: event.pageY
        }
        updateLine(mouse);
    }
})


// FUNCTIONS CALLED BY CONTROL
// update the line length and angle
function updateLine(mouse) {
    let line = {
        startX: mouse.x,
        startY: mouse.y,
        endX: cores[currentCore].x - (lineWidth / 2),
        endY: cores[currentCore].y - (lineWidth / 2)
    }
    let distance = clamp(calculateDistance(line.startX, line.startY, line.endX, line.endY), 12, maxMovement);
    let direction = calculateAngle(line.startX, line.startY, line.endX, line.endY);

    $('#line').css({
        "width": distance,
        "transform": `rotate(${direction}deg)`
    });
    lineQoL(line, distance, direction);
}

function invertLine(coordinates) {
    let line = {
        startX: coordinates.startX,
        startY: coordinates.startY,
        endX: coordinates.endX,
        endY: coordinates.endY
    }
    let distance = clamp(calculateDistance(line.startX, line.startY, line.endX, line.endY), 12, maxMovement);
    let direction = calculateAngle(line.endX, line.endY, line.startX, line.startY);

    $('#line').css({
        "left": coordinates.startX - (lineWidth / 2),
        "top": coordinates.startY - (lineWidth / 2),
        "width": distance,
        "transform": `rotate(${direction}deg)`
    });
    lineQoL(line, distance, direction);
}

//update the placement of the line checker
function lineQoL(coords, distance, angle) {
    let position = calculateCoordinates(coords.endX, coords.endY, distance, angle);
    let offset = (lineQoLArea / 2) - (lineWidth / 2);
    $('#lineQoLArea').css({
        "left": position.x - offset,
        "top": position.y - offset
    })
}

//check if core is nearby and jump to it
function coreSwitch() {
    let position = {
        x: parseInt($("#lineQoLArea").css("left").replace(/px/, "")) + (lineQoLArea / 2),
        y: parseInt($("#lineQoLArea").css("top").replace(/px/, "")) + (lineQoLArea / 2)
    }

    let newCore;
    let curCore;
    let newCoreDistance = lineQoLArea + 1
    for (let core in cores) {
        if (cores[core].state != "possessed") {
            let distance = calculateDistance(position.x, position.y, cores[core].x, cores[core].y)
            if ((distance < (lineQoLArea - 8)) && (distance < newCoreDistance)) {
                newCore = core;
                newCoreDistance = distance;
            }
        } else {
            curCore = core;
        }
    }

    if (newCore) {
        let coordinates = {
            startX: cores[newCore].x,
            startY: cores[newCore].y,
            endX: cores[curCore].x,
            endY: cores[curCore].y
        }
        invertLine(coordinates);
        cores[curCore].state = "empty";
        cores[newCore].state = "possessed";
        currentCore = newCore;

        createCores(cores);
    } else {
        $("#lineQoLArea").css({
            "left": cores[curCore].x - (lineQoLArea / 2),
            "top": cores[curCore].y - (lineQoLArea / 2)
        });
    }
}







// ui related code
$("#btnSoul").click(function () {
    $("#playField").toggleClass("hidden");
    $("#overlaySoul").toggleClass("hidden");


    $("#btnUse").toggleClass("hidden");
})

// SENDING INPUT
$("#testInput").on("keydown", function (e) {
    if (e.keyCode == 13) {
        console.log($("#testInput").val());
        $("#testInput").val("");
    }
});













// actions
const ACTIONLIST = {
    "objWheel": {
        type: "move",
        horizontal: 200,
        vertical: 30,
        animation: {
            type: "rotate",
            spins: 4
        },
        used: false
    }
}

$("#btnUse").click(function () {
    if (cores[currentCore].object in ACTIONLIST) { //check if action is available
        switch (ACTIONLIST[cores[currentCore].object].type) {
            case 'move':
                actMove();
                break;
            default:
                console.log(`No function has been defined for action: ${ACTIONLIST[cores[currentCore].object].type}`);
                break;
        }
    }

    function actMove() {
        if (ACTIONLIST[cores[currentCore].object].used == false) {
            console.log(cores[currentCore].object)
            $(`#${cores[currentCore].object}`).css({
                "left": 200,
                "top": 30,
                "transform": `rotate(calc(360deg * ${ACTIONLIST[cores[currentCore].object].animation.spins}))`
            })
            ACTIONLIST[cores[currentCore].object].used = true;
        }else{
            $(`#${cores[currentCore].object}`).css({
                "left": -200,
                "top": -30,
                "transform": `rotate(calc(-360deg * ${ACTIONLIST[cores[currentCore].object].animation.spins}))`
            })
            ACTIONLIST[cores[currentCore].object].used = false;
        }
    }
})