/**
 * @author Kate
 */

function bezierVertex(g, p0, p1, r0, theta0, r1, theta1) {
    g.bezierVertex(p0.x + r0 * Math.cos(theta0), p0.y + r0 * Math.sin(theta0), p1.x + r1 * Math.cos(theta1), p1.y + r1 * Math.sin(theta1), p1.x, p1.y);
};

function Eye(face, flip) {
    this.face = face;
    this.flip = flip;

    this.center = new Vector(-5, 0);

    this.radius = 40;

    this.inner = new Vector(0, 0);
    this.outer = new Vector(0, 0);

    this.lowerLid = new Path();
    this.upperLid = new Path();
};

Eye.prototype.update = function() {
    var dna = this.face.aof;

    this.radius = (dna.values[order.eyeRadius] * .1 + .2) * this.face.radius;
    this.inner.setTo(-this.radius, 0);
    this.outer.setTo(this.radius, 0);

    this.irisSize = (dna.values[order.irisSize] * .32 + .4) * this.radius;
    this.topLiner = (dna.values[order.topLiner] * .2) * this.radius;

    var x = utilities.noise((dna.values[order.irisX]) * 2) * (this.radius - this.irisSize) * .6;
    if (this.flip)
        x *= -1;
    x -= this.radius * .1;
    this.center = new Vector(x, 0);

    this.innerLowerTheta = (dna.values[order.innerLid] * 1.9 + -.5);
    this.outerLowerTheta = (dna.values[order.outerLid] * 1.8 + -.5);
    var blink = 2.2 *Math.abs(utilities.noise(currentTime));
    this.innerUpperTheta = -this.innerLowerTheta + blink;
    this.outerUpperTheta = -this.outerLowerTheta + blink;
};

Eye.prototype.draw = function(g) {
    g.pushMatrix();
    if (this.flip) {
        g.scale(-1, 1);
    }
    g.noStroke();
    g.fill(1, 0, 1, .8);
    g.translate(60, -10);
    g.rotate(this.face.eyeTilt * .3 - .2);
    g.ellipse(0, 0, this.radius * .98, this.radius * .8);

    // Iris

    var s = this.irisSize;
    g.pushMatrix();
    g.translate(this.center.x, this.center.y);

    var lvls = 5;
    for (var i = 0; i < lvls; i++) {
        var pct = i / (lvls - 1);
        this.face.irisColor.fill(g, pct - .5);
        var s2 = s - pct * s * .9;
        g.ellipse(0, 0, s2, s2);
    }

    g.fill(1, 0, .0, .8);
    g.ellipse(0, 0, s * .6, s * .6);

    g.fill(1, 0, 1, .3);
    g.ellipse(0, s * -.2, s * .6, s * .4);
    g.fill(1, 0, 1, .6);
    g.ellipse(s * .4, -s * .4, s * .1, s * .1);
    g.popMatrix();

    // upperLid

    // Lower lid
    this.face.baseColor.fill(g, -.2, 1);

    g.noStroke();
    g.beginShape();
    this.inner.vertex(g);
    bezierVertex(g, this.inner, this.outer, this.radius * .8, +this.innerLowerTheta, this.radius * .8, Math.PI - this.outerLowerTheta);
    bezierVertex(g, this.outer, this.inner, this.radius * 1.2, 1.6, this.radius * 1.2, Math.PI - 1.6);
    g.endShape();

    // upper eye
    this.face.baseColor.fill(g, .2, 1);

    g.noStroke();
    g.beginShape();
    this.inner.vertex(g);
    bezierVertex(g, this.inner, this.outer, this.radius * .8, -this.innerUpperTheta, this.radius * .8, Math.PI + this.outerUpperTheta);
    bezierVertex(g, this.outer, this.inner, this.radius * 1.2, -1.6, this.radius * 1.2, Math.PI + 1.6);
    g.endShape();

    // eyeliner
    g.noFill();
    g.stroke(0);
    g.strokeWeight(this.topLiner);
    g.beginShape();
    this.inner.vertex(g);
    bezierVertex(g, this.inner, this.outer, this.radius * .8, -this.innerUpperTheta, this.radius * .8, Math.PI + this.outerUpperTheta);
    g.endShape();

    g.popMatrix();
};

function Face(aof) {
    this.radius = 180;
    this.aof = aof;

    this.baseColor = new KColor(Math.random() * .2 + .6, 1, 1);

    this.path = new Path();

    this.eye0 = new Eye(this, false);
    this.eye1 = new Eye(this, true);

    var chin = new CurvePoint(0, 180);
    var forehead = new CurvePoint(0, -180);

    var cheek0 = new CurvePoint(-140, -50);
    var cheek1 = new CurvePoint(140, -50);

    var jaw0 = new CurvePoint(-120, 80);
    var jaw1 = new CurvePoint(120, 80);

    this.path.points.push(forehead);
    this.path.points.push(cheek0);
    this.path.points.push(jaw0);
    this.path.points.push(chin);
    this.path.points.push(jaw1);
    this.path.points.push(cheek1);
    this.path.smooth();

    this.update();

};

Face.prototype.update = function() {
    this.eye0.update();
    this.eye1.update();

    var pastel = this.aof.values[order.skinPastel];
    this.baseColor = new KColor(this.aof.values[order.skinHue] * .7 + .5, 1.2 - pastel, .3 + pastel);
    this.irisColor = new KColor(this.aof.values[order.irisHue], 1, 1);
    this.eyeTilt = this.aof.values[order.eyeTilt];

};

Face.prototype.draw = function(g) {
    g.noStroke();
    this.baseColor.fill(g, -.2, 1);
    this.baseColor.stroke(g, -.2, 1);

    g.strokeWeight(4);
    this.path.draw(g, true);
    this.path.drawPoints(g);

    this.eye0.draw(g);
    this.eye1.draw(g);
};
