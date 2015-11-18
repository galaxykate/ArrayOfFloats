/**
 * @author Kate
 */

// Make some custom fractals

var birdCount = 0;
function Bird(aof) {
    this.size = 5;
    this.radius = 180;
    this.aof = aof;
    birdCount++;
    this.id = birdCount;

    this.flapCycle = Math.random();
    this.update();
}

Bird.prototype.update = function() {
    var acceleration = utilities.noise(this, currentTime);
    this.flapCycle += acceleration;
    var dna = this.aof;

    this.featherSize = 10;
    this.featherVerts = 20;
    this.fAngle0 = .5;
    this.fAngle1 = 2.5;
};

Bird.prototype.drawFeather = function(g, pct) {

    g.pushMatrix();
    g.rotate(-Math.PI / 2 + (pct * (this.wingSpread + .5) + -.5 * this.forwardRow));
    g.translate(-5 * this.size * this.compression * pct, 2 * this.size + 2 * this.size * this.compression * this.forwardRow);

    var length = 20 * (1 + .5 * Math.sin(3 * pct + .4)) * this.size * this.compression;
    var width = 4 * (.3 + .2 * Math.sin(pct)) * this.size;

    var center = new Vector(0, length);
    g.beginShape();
    g.fill(pct * .2, 1, 1);
    g.vertex(0, 0);

    for (var i = 0; i < this.featherVerts + 1; i++) {
        var pct = i / this.featherVerts;

        var theta = -Math.PI - 3 * pct;
        var r = width;
        g.vertex(center.x + r * Math.cos(theta), center.y*(Math.pow(pct, .4) )+ r * Math.sin(theta));

    }

    g.endShape();

    g.popMatrix();

};

Bird.prototype.drawWing = function(g) {
    g.pushMatrix();
    g.translate(this.size * 5, 0);
    g.beginShape();
    g.vertex(0, -this.size * 5);
    g.vertex(0, this.size * 5);
    drawArc(g, new Vector(0, 0), Math.PI, -this.forwardRow, 5, this.size * 5 * this.compression, this.size * 15 * this.compression);
    g.endShape();

    g.ellipse(0, 0, 10, 10);

    g.rotate(-this.forwardRow);
    g.translate(8 * this.size, 0);

    var featherCount = 10;
    for (var i = 0; i < featherCount + 1; i++) {
        this.drawFeather(g, i / featherCount);
    }
    g.popMatrix();

};

Bird.prototype.draw = function(g) {
    //   this.forwardRow = Math.sin(2 * currentTime);
    this.forwardRow = .5 + .5 * Math.sin(2 * currentTime);
    this.forwardRow = 1.7 * Math.pow(this.forwardRow, .6) - .8;

    this.wingSpread = Math.sin(2 * currentTime) + 1;
    this.compression = .8 + .2 * Math.sin(2 * currentTime);

    g.pushMatrix();
    g.translate(0, 30);
    g.noStroke();
    g.fill(0, 0, 0, .2);
    g.ellipse(0, 0, this.size * 5, this.size * 12);

    g.fill(.4, .5, .6, .2);
    this.drawWing(g);
    g.fill(.8, .5, .6, .2);
    g.scale(-1, 1);
    this.drawWing(g);

    g.popMatrix();

};

function drawArc(g, center, theta0, theta1, segments, r0, r1) {
    var dr = r1 - r0;
    var dtheta = theta1 - theta0;
    for (var i = 0; i < segments + 1; i++) {
        var pct = i / segments;
        var theta = pct * dtheta + theta0;
        var r = pct * dr + r0;
        g.vertex(center.x + r * Math.cos(theta), center.y + r * Math.sin(theta));
    }

};
