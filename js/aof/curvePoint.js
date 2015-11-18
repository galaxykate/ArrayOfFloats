/**
 * @author Kate
 */

CurvePoint = Vector.extend({
    init : function(x, y) {
        this._super(x, y);
    },

    setAngle : function() {

    },

    setCP : function(index, r, theta) {
        this["cp" + index] = new Vector(this);
        this["cp" + index].addPolar(r, theta);
        this["cp" + index].r = r;
        this["cp" + index].theta = theta;
    },

    draw : function(g) {
        g.stroke(0);
        g.strokeWeight(1);
        g.line(this.x, this.y, this.cp0.x, this.cp0.y);
        g.line(this.x, this.y, this.cp1.x, this.cp1.y);

        g.noStroke();
        g.fill(0);
        g.ellipse(this.x, this.y, 5, 5);

        g.fill(.4, 1, 4);
        g.ellipse(this.cp0.x, this.cp0.y, 5, 5);

        g.fill(.55, 1, 1);
        g.ellipse(this.cp1.x, this.cp1.y, 5, 5);
    }
});

function Path() {
    this.points = [];
}

Path.prototype.smooth = function() {
    var count = this.points.length + 1;
    for (var i = 0; i < count; i++) {
        var p0 = this.points[(i + this.points.length - 1) % this.points.length];
        var p1 = this.points[(i + this.points.length) % this.points.length];
        var p2 = this.points[(i + this.points.length + 1) % this.points.length];

        var angle = p0.getAngleTo(p2);
        p1.setCP(0, p0.getDistanceTo(p1) * .3, angle);
        p1.setCP(1, p1.getDistanceTo(p2) * .3, angle - Math.PI);
        console.log(angle);
    }
};

Path.prototype.drawPoints = function(g) {

    for (var i = 0; i < this.points.length; i++) {
        this.points[i].draw(g);
    }

};

Path.prototype.draw = function(g, close) {
    var last = undefined;
    var count = this.points.length;
    g.beginShape();
    if (close)
        count += 1;

    for (var i = 0; i < count; i++) {
        var p = this.points[i % this.points.length];
        if (last === undefined) {
            g.vertex(p.x, p.y);
        } else {
            var cp0 = last.cp1;
            var cp1 = p.cp0;

            g.bezierVertex(cp0.x, cp0.y, cp1.x, cp1.y, p.x, p.y);

        }
        last = p;

    }
    g.endShape();

};
