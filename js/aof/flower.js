/**
 * @author Kate
 */

// Make some custom fractals

function Flower(aof) {
    this.radius = 180;
    this.aof = aof;

    var edges = [];
    var nodes = [];

    // recursively make nodes
    this.root = new FlowerNode(this, undefined, 0);
    this.update();
}

Flower.prototype.update = function() {
    var dna = this.aof;

    this.spreadAngle = dna.values[order.spread];
    this.stemColor = new KColor(dna.values[order.hueStart], dna.values[order.saturation], 1);
    this.branchLength = 1 - dna.values[order.bushiness];
    this.branchLengthFalloff = 1 - .2;

    this.root.update();
};

Flower.prototype.draw = function(g) {
    g.pushMatrix();
    g.translate(0, 100);
    g.noStroke();

    g.rotate(Math.PI);
    this.root.draw(g);
    g.popMatrix();

};

function FlowerNode(flower, parent, offset) {
    this.flower = flower;
    this.parent = parent;
    this.offset = offset;
    this.color = new KColor();
    this.depth = 0;
    if (this.parent)
        this.depth = this.parent.depth + 1;

    // Create children
    this.children = [];
    if (this.depth < 5) {
        if (this.depth % 2 === 1) {
            this.children[0] = new FlowerNode(flower, this, -1);
            this.children[1] = new FlowerNode(flower, this, 1);
        } else {
            this.children[0] = new FlowerNode(flower, this, 0);

        }
    }

    console.log("Node" + this.depth + " " + this.offset);
};

FlowerNode.prototype.update = function(g) {
    // set the color and radius
    var dna = this.flower.aof.values;

    if (this.parent) {
        this.radius = this.parent.radius * .9;
        this.length = this.parent.length * .8;
        this.color.setTo(this.parent.color, .1);
        this.color = new KColor((3 + dna[order.hueStart] + .1 * dna[order.hueDiff] * this.depth) % 1, -dna[order.saturation] * this.depth * .08 + .7 + .3 * dna[order.saturation] * (Math.sin(this.depth)), .3 + .1 * this.depth);

        this.leafAspect = .4 + .9 * dna[order.leafAspect];
        this.leafVolume = (5 + 15 * dna[order.leafVolume]) * this.radius * this.radius;
        this.leafLength = Math.sqrt(this.leafVolume) / this.leafAspect;
        this.leafWidth = this.leafVolume / this.leafLength;
        this.leafTheta = Math.atan2(this.leafWidth, this.leafLength);
        this.leafPeak = 1.2 * dna[order.leafShape];
        this.leafCount = 3;

        this.petalCount = Math.floor(10 * dna[order.leafShape]) + 2;

        this.petalAspect = .2 + .6 * dna[order.petalAspect];
         this.petalOffset = .2 + .6 * dna[order.petalOffset];
        this.petalColor = new KColor((dna[order.petalHue] * 1.2 + .9) % 1, dna[order.petalSaturation], 1, .5);

    } else {
        this.radius = 10;
        //    this.length = 5 + 100 * (this.flower.branchLength * Math.pow(this.flower.branchLengthFalloff, this.depth));
        this.length = 70;
        this.color.setTo(this.flower.stemColor, .1);
        this.leafCount = 0;
    }

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].update();

    }
};

FlowerNode.prototype.drawFlowers = function(g) {
    var petalSize = 5 * this.radius;
    var aspect = .1 + .9 * this.petalAspect - .02*this.petalCount;
    var petalH = petalSize * aspect;
    var petalW = petalSize * (1 - aspect);
    // Draw some flowers?  What kind?

    for (var i = 0; i < this.petalCount; i++) {
        this.petalColor.fill(g, .1 * Math.sin(i), .5 + .3 * Math.sin(i + 3) + .2*this.petalAspect);
        g.rotate(Math.PI * 2 / this.petalCount);
        g.ellipse(petalH * 1.5- 1.2*this.petalOffset*petalH, 0, petalH , petalW);

    }
};

FlowerNode.prototype.drawStem = function(g) {
    var r0 = this.parent.radius;
    var r1 = this.radius;
    this.color.fill(g, -.1, 1);
    g.noStroke();

    g.beginShape();

    g.vertex(r0 * .8, r0 * .2);
    g.vertex(0, 0);
    g.vertex(-r0 * .8, r0 * .2);
    g.vertex(-r1 * .8, this.length - r1 * .2);
    g.vertex(0, this.length);
    g.vertex(r1 * .8, this.length - r1 * .2);

    g.endShape();

    // Leaves

    for (var j = 0; j < this.leafCount; j++) {
        g.pushMatrix();
        this.color.fill(g, .3 * Math.sin(j + this.depth), -.3 + .2 * Math.sin(j + this.depth));

        // Move down the stem
        g.translate(0, this.length / this.leafCount);
        var theta = Math.sin(j * 3 + this.depth) + Math.PI / 2;
        g.rotate(theta);

        g.beginShape();
        g.vertex(0, 0);
        g.vertex(this.leafLength * this.leafPeak, this.leafWidth);
        g.vertex(this.leafLength, 0);

        g.vertex(this.leafLength * this.leafPeak, -this.leafWidth);

        g.endShape();
        g.popMatrix();

    }
    g.translate(0, this.length);
    this.color.fill(g, .3, 0);
    g.ellipse(0, 4, r1, r1);

};

FlowerNode.prototype.draw = function(g) {

    var dna = this.flower.aof.values;

    g.pushMatrix();
    g.translate(0, 0);

    var angleSway = .1 * (1.2 + this.depth) * Math.sin(2 * currentTime + this.depth);

    if (this.parent) {
        g.rotate(this.flower.spreadAngle * this.offset + angleSway);
        this.drawStem(g);
        g.rotate(-angleSway);

    } else {

        for (var i = 0; i < 6; i++) {
            g.fill(0, 0, 0, .3);
            var r = 40 * Math.pow((i + 2) / 6, 3);
            g.ellipse(0, -i * 3 + 6, r, r * .3);
        }
    }

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(g);
    }

    if (this.children.length === 0) {
        g.fill(0);

        this.drawFlowers(g);
    }

    g.popMatrix();
};

