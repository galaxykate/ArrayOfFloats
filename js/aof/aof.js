/**
 * @author Kate
 */

var aofCount = 0;
function AoF(count, labels) {
    this.inputMode = 3;
    this.labels = labels;
    if (this.labels) {
        count = this.labels.length;
    }

    this.id = aofCount;
    aofCount++;
    this.values = [];
    for (var i = 0; i < count; i++) {
        this.values[i] = Math.random();
    }

    var aof = this;

};
AoF.prototype.update = function() {

    // clamp all
    for (var i = 0; i < this.values.length; i++) {
        this.values[i] = Math.min(1, Math.max(0, this.values[i]));

    }

    if (this.object)
        this.object.update();

    if (this.view)
        this.view.update();
};

AoF.prototype.setLabels = function(labels) {
    this.labels = labels;
    if (this.view)
        this.view.update();
};

AoF.prototype.setInputMode = function(inputMode) {
    this.inputMode = inputMode;

    if (this.view) {
        this.view.update();
    }
};

AoF.prototype.pingpong = function() {
    for (var i = 0; i < this.values.length; i++) {
        this.values[i] = .5 + .5 * Math.sin(i * 20 + 200 * this.id + currentTime * 2);
    }
};

AoF.prototype.evolve = function() {
    for (var i = 0; i < this.values.length; i++) {
        this.values[i] = utilities.noise(i + .2 * currentTime + 20 * this.id) * .5 + .5;
    }
};

function AoFView(holder) {
    var view = this;
    // Create a view
    this.div = $("<div/>", {
        class : "aof-view",

    }).appendTo(holder);

    this.controls = $("<div/>", {
        class : "aof-controls",
    }).appendTo(this.div);

    var reroll = $("<div/>", {
        html : "&#9860;",
        class : "control-button"
    }).appendTo(this.controls).click(function() {
        setInputMode("random");
    });

    var pingpong = $("<div/>", {
        html : " &#8596;",
        class : "control-button"
    }).appendTo(this.controls).click(function() {
        setInputMode("pingpong");
    });

    var evolve = $("<div/>", {
        html : "<img width=16 src='img/random.png'>",
        class : "control-button"
    }).appendTo(this.controls).click(function() {
        setInputMode("wander");
    });

    var gesture = $("<div/>", {
        html : "<img width=14 src='img/hand-small.png'>",
        class : "control-button"
    }).appendTo(this.controls).click(function() {
        setInputMode("hands");
    });

    var music = $("<div/>", {
        html : "<img width=20 src='img/musicnotes.png'>",
        class : "control-button"
    }).appendTo(this.controls).click(function() {
        setInputMode("music");
    });

    this.valueHolder = $("<div/>", {
        class : "values-holder",

    }).appendTo(this.div);
};
AoFView.prototype.update = function() {
    for (var i = 0; i < this.values.length; i++) {
        var div = this.values[i];
        var v = this.aof.values[i];
        div.innerBar.html(v.toFixed(2));

        var color = new KColor(-v * .5 + 1.05, 1, 1);

        div.css({
            width : (100) + "px",
            backgroundColor : color.toCSS(-.3)
        });

        div.innerBar.css({
            width : (v * 100) + "px",
            backgroundColor : color.toCSS(.4),
            color : color.toCSS(.7)
        });

        if (aof.labels)
            div.label.html(aof.labels[i]);
        else
            div.label.html("");

    }

};

AoFView.prototype.setAoF = function(aof) {
    var view = this;
    this.aof = aof;
    aof.view = this;

    this.values = aof.values.map(function(value, index) {
        var div = $("<div/>", {
            class : "value",

        }).appendTo(view.valueHolder).draggable({
            helper : function() {
                return "<div></div>";
            },

            drag : function(ev, ui) {
                //     console.log(ui);
                var pct = Math.min(1, Math.max(0, ui.position.left / 100));
                aof.values[index] = pct;
                console.log(index + ": " + pct);
                aof.object.update();
                aof.view.update();
            }
        });

        div.innerBar = $("<div/>", {
            class : "value-inner",
        }).appendTo(div);

        var labelVal = "";

        div.label = $("<div/>", {
            class : "value-label",
            html : ""
        }).appendTo(div);
        return div;
    });
    this.update();

};

