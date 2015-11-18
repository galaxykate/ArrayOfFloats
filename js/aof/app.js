/**
 * @author Kate
 */
var displayMode;
var inputMode;
var audioSpectrum;

var aofObject,
    aofView,
    aof;

var order;

function buildOrder(labels) {
    order = {};
    for (var i = 0; i < labels.length; i++) {
        order[labels[i]] = i;
    }
}

console.log("Load song");
var dancer = new Dancer();

// Using an audio object
var audio = new Audio();
audio.src = "audio/" + "Kamarinskaya" + ".mp3";
dancer.load(audio);

$("#nowPlaying").html(name);

audio.currentTime = 53.5;
audio.volume = .4;

function loadSong(name) {

    dancer.play();

}

function setInputMode(name) {
    dancer.pause();
    inputMode = name;
    $("#visualization .title").html(inputMode + " to " + displayMode);

    if (inputMode == "random") {
        console.log("randomize");
        for (var i = 0; i < aof.values.length; i++) {
            aof.values[i] = Math.random();
        }
        aof.update();
    }

    switch(inputMode) {
    case "music" :
        loadSong();
        break;
    default:
        break;
    }
}

function setDisplayMode(name) {
    displayMode = name;
    $("#visualization .title").html(inputMode + " to " + displayMode);

    switch(displayMode) {
    case "flower":
        var labels = "spread angleSkew bushiness hueStart hueDiff wiggle leafVolume leafShape leafVariation leafCount leafAspect saturation variation flowerSecondary petalOffset petalAspect petalCount petalHue petalSaturation".split(" ");
        buildOrder(labels);
        aofObject = new Flower(aof);
        aof.setLabels(labels);
        aof.object = aofObject;

        break;
    case "bird":
var labels = [];
        buildOrder(labels);
        aofObject = new Bird(aof);
        aof.setLabels(labels);
        aof.object = aofObject;

        break;
    case "face":
        var labels = ["eyeRadius", "topLiner", "irisSize", "irisHue", "irisX", "irisY", "eyeTilt", "skinHue", "skinPastel", "innerLid", "outerLid"];
        buildOrder(labels);
        aofObject = new Face(aof);
        aof.setLabels(labels);
        aof.object = aofObject;

        break;
    case "flock":
        aofObject = new Flock(aof);
        break;
    };

};

function start() {

    $("#display-mode").change(function() {
        setDisplayMode($(this).val());
    });

    setInterval(function() {
        if (inputMode === "pingpong") {
            aof.pingpong();
            aof.update();
        }

        if (inputMode === "wander") {
            aof.evolve();
            aof.update();
        }

        if (inputMode === "music") {
            audioSpectrum = dancer.getSpectrum();
            var count = Math.floor(512 / 30);

            for (var i = 0; i < aof.values.length; i++) {
                aof.values[i] = 0;
            }
            for (var i = 0; i < audioSpectrum.length; i++) {
                var bucket = Math.floor(i / count);
                aof.values[bucket] += .3 * audioSpectrum[i] * (i + 1);
            }

            // Set all the buckets

            aof.update();
        }

    }, 20);

    aof = new AoF(20);
    aofView = new AoFView($("#nav .content"));

    aofView.setAoF(aof);

    setDisplayMode("flower");
    setInputMode("randomize");

    var viz = $("#visualization");
    viz.css({
        height : "400px"
    });

    // Leap motion control
    var controller = new Leap.Controller();
    controller.connect();
    var leapCount = 0;
    Leap.loop(function(frame) {
        leapCount++;

        frame.hands.forEach(function(hand, index) {
            if (leapCount < 1000 && leapCount % 10 === 0)
                console.log(hand);
            if (aof.inputMode === 3) {

                aof.values[0] = hand.stabilizedPalmPosition[0] * .01;
                aof.values[1] = hand.stabilizedPalmPosition[1] * .01;
                aof.values[2] = hand.stabilizedPalmPosition[2] * .01;

                aof.values[3] = hand.direction[0] + .5;
                aof.values[4] = hand.direction[1] + .5;

                console.log("hand input");

            }
            aof.update();
        });

    });

    var canvas = $("<canvas/>").appendTo($("#visualization .content")).css({
        width : "100%",
        height : "100%",
        position : "absolute",
        top : "0px",
        left : "0px"
    });

    this.processing = new Processing(canvas.get(0), function(g) {

        // Set the size of processing so that it matches that size of the canvas element
        var w = canvas.width();
        var h = canvas.height();

        g.size(w, h);
        g.colorMode(g.HSB, 1);
        g.ellipseMode(g.CENTER_RADIUS);
        g.background(1, 0, 1);
        g.draw = function() {
            g.background(.55, .2, 1);

            currentTime = Date.now() * .001;
            g.pushMatrix();
            g.translate(g.width / 2, g.height / 2);
            aofObject.draw(g);

            g.popMatrix();
        };

    });

};
$(document).ready(function() {

    var path = window.location.pathname;
    var pageName = path.split("/").pop().split(".");
    start(pageName, getUrlVars());
});

// http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var currentTime = 0;

var noiseObj;
