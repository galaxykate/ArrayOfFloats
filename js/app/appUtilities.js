/**
 * @author Kate
 */

app.drawForces = function(g, p, label) {

    if (!p.isFixed) {
        for (var i = 0; i < p.forces.length; i++) {
            var f = p.forces[i];
            var mag = f.magnitude();
            var m = 7 * Math.pow(mag, -.7);
            var h = (f.force.id * .13 + .4) % 1;
            var offset = p.radius;
            var textPos = Vector.addMultiples(p, 1, f, m);
            if (f.reverse) {
                offset = -p.radius - f.magnitude() * m;
                h -= .2;
                textPos = Vector.addMultiples(p, 1, f, -m);
            }
            g.stroke(h, 1, 1);
            g.fill(h, 1, 1);
            g.strokeWeight(1 * Math.pow(f.magnitude(), .2) + 1);

            var arrowSize = Math.pow(mag, .3) + 2;
            p.drawArrowWithHead(g, f, m, arrowSize, offset);

            if (label) {
                g.fill(h, 1, .3);
                g.text(f.force.name, textPos.x - 18, textPos.y - 20);
            }
        }

    } else {
        g.stroke(0, 0, 0, .3);
        g.strokeWeight(7);
        g.ellipse(p.x, p.y, p.radius, p.radius);

    }

};

// Modes

app.setMode = function(index) {
    app.previousMode = app.mode;

    if (index === 1 && app.inspected === undefined)
        app.evosim.inspectRandom();

    app.currentModeIndex = index;
    app.mode = app.modes[app.currentModeIndex];

    console.log("Mode: " + app.mode.name);
    for (var i = 0; i < app.modeElements.length; i++) {
        if (app.previousMode) {
            $(app.modeElements[i]).removeClass("mode" + app.previousMode.name);
        }

        $(app.modeElements[i]).addClass("mode" + app.mode.name);
    }

    app.viewOffset = app.mode.viewOffset;
    app.updateControls();
    app.mode.onStart();
};

// Fill the edit menu

app.makeSlider = function(sliderSettings) {
    var min = 0;
    var max = 1;
    var val = .5;
    var step = .01;
    if (sliderSettings.min !== undefined)
        min = sliderSettings.min;
    if (sliderSettings.max !== undefined)
        max = sliderSettings.max;
    if (sliderSettings.val !== undefined)
        val = sliderSettings.val;
    if (sliderSettings.step !== undefined)
        step = sliderSettings.step;

    var name = sliderSettings.name;

    var holder = $("<div/>", {

        "class" : "sliderHolder"
    }).appendTo(sliderSettings.holder);

    var labelBar = $("<div/>", {
        "class" : "labelBar",

    }).appendTo(holder);

    var label = $("<span/>", {
        "class" : "label",
        html : name
    }).appendTo(labelBar);

    var valueOutput = $("<span/>", {
        "class" : "value",
        html : val
    }).appendTo(labelBar);

    var onSlide = function(val) {
        valueOutput.html(val);

        if (sliderSettings.onSlide)
            sliderSettings.onSlide(val);
    };

    var slider = $("<div/>", {
        "class" : "menuSlider",
    }).appendTo(holder).slider({
        min : min,
        max : max,
        step : step,
        value : val,
        slide : function(event, ui) {

            onSlide(ui.value);
        }
    });
    onSlide(val);
};

app.createTime = function() {

    // A little time object to keep track of the current time,
    //   how long its been since the last frame we drew,
    //   and how long the app has been running
    var time = {
        date : Date.now(),
        start : Date.now(),
        total : 0,
        elapsed : .1,
        frames : 0,
        updateTime : function() {
            var last = this.date;
            this.date = Date.now();
            this.total = (this.date - this.start) / 1000;
            this.elapsed = (this.date - last) / 1000;

            if (this.elapsed < .01)
                this.elapsed = .01;
            if (this.elapsed > .1)
                this.elapsed = .1;

            this.frames++;

        }
    };
    return time;
};

app.setKeyResponses = function(mappings) {
    console.log("Set key responses");

    $(document).keydown(function(e) {
        if ($(document.activeElement).is(".inspectName")) {
            console.log("content-editable typing");
        } else {
            var key = String.fromCharCode(e.keyCode);
            switch(key) {
            case ' ':
                app.paused = !app.paused;
                return false;
                break;

            case 'M' :
                if (app.currentModeIndex === 0) {
                    app.evosim.inspectRandom();
                    app.setMode(1);
                } else
                    app.setMode(0);
                break;

            case 'D' :
                app.toggleDebug();
                break;
            default:
            }
        }

    });

    $(document).keyup(function(e) {
        app.key = undefined;
    });

};

app.addWorldUI = function(world, holder) {
    var forceHolder = $("<div/>", {
        class : "section forceSection",
    }).appendTo(holder);

    world.activeForces.forEach(function(force) {

        var singleForceHolder = $("<div/>", {
            class : "section",
        }).appendTo(forceHolder);

        app.makeSlider({
            holder : singleForceHolder,
            name : force.name,
            min : force.min,
            max : force.max,
            val : force.strength,
            onSlide : function(val) {
                force.strength = val;
            }
        });

    });
};

app.makeCheckBox = function(name) {
    var div = $("<div/>", {

        "class" : "menuItem"
    }).appendTo(menu);

    var box = $("<input/>", {
        type : "checkbox"
    }).appendTo(div);
    var label = $("<span/>", {
        html : name
    }).appendTo(div);

    box.change(function() {
        settings[name] = $(this).is(":checked");
        app.changeSettings();
    });

};
