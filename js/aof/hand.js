/**
 * @author Kate
 */

var leapMult = .06;
var Hand = Class.extend({

    init : function(xMult) {
        this.xMult = xMult;
        this.points = [];

        // create five fingers
        this.fingers = [];
        this.wrist = new Vector(8 * this.xMult, 0, 0);
        this.points.push(this.wrist);
        for (var i = 0; i < 5; i++) {
            this.fingers[i] = new Finger(this, i);
            this.points = this.points.concat(this.fingers[i].joints);
        }

        for (var i = 0; i < this.points.length; i++) {
            this.points[i].screen = new Vector();
        }

    },

    setToLeap : function(hand) {
        if (leapCount % 100 === 1) {
            //  console.log(hand);
        }
        var p = hand.palmPosition;

        this.wrist.setTo(p[0], p[1], p[2]);
        this.wrist.mult(leapMult);
        this.wrist.debugBox.position.set(this.wrist.x, this.wrist.y, this.wrist.z);
        for (var i = 0; i < this.fingers.length; i++) {
            this.fingers[i].setToLeap(hand.fingers[i]);
        }
    },

    addToScene : function(scene) {
        pts = pts.concat(this.points);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({
            color : 0x001100
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.scale.set(1, 1, 1);
        cube.position.set(this.wrist.x, this.wrist.y, this.wrist.z);
        scene.add(cube);
        this.wrist.debugBox = cube;

        for (var i = 0; i < this.fingers.length; i++) {
            this.fingers[i].addToScene(scene);
        }
    }
});

var Finger = Class.extend({
    init : function(hand, index) {
        this.joints = [];
        var len = .8 * (1 + .4 * Math.sin(index * .8 + .2));
        this.angle = -(index - 2) * .1 + .4;
        if (index === 0) {
            this.angle += .35;
            len *= .8;
        }

        this.angle *= hand.xMult;
        this.angle += Math.PI * .5;

        var start = new Vector(hand.wrist);
        start.x += .6 * (index - 2) * hand.xMult;
        start.z += .27 * (index - 2);
        start.y += -.1 * (index - 2);
        this.joints.push(start);
        var jointCount = 4;

        var last = start;
        for (var i = 0; i < jointCount; i++) {
            var joint = new Vector(last);
            joint.z += (len) * Math.sin(this.angle);
            joint.x += (len) * Math.cos(this.angle);
            joint.y += .2 * Math.pow(i, .1) - .2;
            len *= .93;
            this.joints.push(joint);
            last = joint;
        }
    },

    setToLeap : function(finger) {
        for (var i = 0; i < finger.bones.length; i++) {
            var j = finger.bones[i].prevJoint;
            this.joints[i].setTo(j[0], j[1], j[2]);
            this.joints[i].mult(leapMult);
               this.joints[i].z *= -1;
             this.joints[i].debugCube.position.set(this.joints[i].x, this.joints[i].y, this.joints[i].z);

            if (i === finger.bones.length - 1) {
                var j = finger.bones[i].nextJoint;
                this.joints[i + 1].setTo(j[0], j[1], j[2]);
                this.joints[i + 1].z *= -1;
                this.joints[i + 1].mult(leapMult);
                this.joints[i + 1].debugCube.position.set(this.joints[i + 1].x, this.joints[i + 1].y, this.joints[i + 1].z);

            }
        }
    },

    addToScene : function(scene) {
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({
            color : 0x001100
        });
        for (var i = 0; i < this.joints.length; i++) {
            var p = this.joints[i];
            if (i > 2)
                pts.push(p);
            var r = .5 * (1 - .6 * (i / this.joints.length));

            var cube = new THREE.Mesh(geometry, material);
            cube.scale.set(r, r, r);
            scene.add(cube);
            cube.position.set(p.x, p.y, p.z);
            p.debugCube = cube;
        }
    }
});
