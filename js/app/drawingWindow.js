/**
 * @author Kate
 */

var DrawingWindow = Class.extend({
    init : function(div) {

        this.div = div;
        this.center = new Vector(div.width() * .5, div.height() * .5);

    },

    createThree : function() {

        var holder = $("<div>", {
            class : "three-holder"
        }).appendTo(this.div);

        var w = this.div.width();
        var h = this.div.height();
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer({
            alpha : true
        });
        renderer.setSize(w, h);
        holder.append(renderer.domElement);
        $(renderer.domElement).addClass("three");

     this.threeScene = scene;
      

        // Place camera on x axis

        var cameraTheta = 0;
        var cameraR = 10;
        var count = 0;
        var projector = new THREE.Projector();

        function render() {
            t =  (Date.now() - startT)*.001;

            cameraR = 1*Math.sin(.7*Math.PI*t/5) + 25;
            cameraTheta = .2*t*Math.PI/5;
            camera.position.set(cameraR * Math.cos(cameraTheta), cameraR * Math.sin(cameraTheta), -3);
            camera.up = new THREE.Vector3(0, 0, 1);
            camera.lookAt(new THREE.Vector3(0, 0, 10));
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            //   if (count % 10 === 0)
            setScreenPos(pts);
            count++;

        }

        render();

        function setScreenPos(vArray) {
            var p = new THREE.Vector3(0, 0, 0);
            for (var i = 0; i < vArray.length; i++) {
                var v = vArray[i];
                p.x = v.x;
                p.y = v.y;
                p.z = v.z;
                projector.projectVector(p, camera);

                p.x = p.x * w / 2;
                p.y = -(p.y * h / 2);
                v.screen.setTo(p);

                //  if (i === 5)
                //    console.log(v.screen);
            }

        }

    },

    createProcessing : function() {
        var that = this;

        /*
         var bg = $("<div/>", {
         "class" : "bg"
         }).appendTo(this.div).css({
         width : "100%",
         height : "100%",
         position : "absolute",
         top : "0px",
         left : "0px",
         });
         */

        var holder = $("<div/>", {
            "class" : "p5-holder"
        }).appendTo(this.div).css({
            width : "100%",
            height : "100%",
            position : "absolute",
            top : "0px",
            left : "0px",
            //borderRadius : "15px",
            // "-webkit-mask-image" : "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC)",
        });

        // add a canvas

        var canvas = $("<canvas/>").appendTo(holder).css({
            width : "100%",
            height : "100%"
        });

        var processingInstance = new Processing(canvas.get(0), function(g) {

            // Set the size of processing so that it matches that size of the canvas element
            var w = canvas.width();
            var h = canvas.height();

            g.size(w, h);
            g.colorMode(g.HSB, 1);
            g.ellipseMode(g.CENTER_RADIUS);

            g.draw = function() {

                that.world.update();

                g.pushMatrix();
                g.translate(that.center.x, that.center.y);

                that.world.draw(g);
                g.popMatrix();
            };
        });

        return processingInstance;
    },

    makeDraggable : function() {

        var that = this;

        function setToCanvasRelative(p, event) {
            var x = event.pageX - that.div.offset().left - that.center.x;
            var y = event.pageY - that.div.offset().top - that.center.y;

            p.setTo(x, y);
            p.sub(app.viewOffset);
        };

        // Draggability
        var dragStart = new Vector();
        var dragCurrent = new Vector();
        var dragLast = new Vector();

        var clickPos = new Vector();
        var mousePos = new Vector();
        this.div.click(function(ev) {
            setToCanvasRelative(clickPos, ev);
            if (that.world.click)
                that.world.click(clickPos);
        });

        this.div.mousemove(function(ev) {
            setToCanvasRelative(mousePos, ev);

            if (that.world.mousemove && !app.isDragging)
                that.world.mousemove(mousePos);
        });

        this.div.dblclick(function(ev) {
            setToCanvasRelative(clickPos, ev);
            if (that.world.dblClick)
                that.world.dblClick(clickPos);

        });

        this.div.draggable({
            start : function(event, ui) {

                app.isDragging = true;
                setToCanvasRelative(dragStart, event);

                dragLast.setTo(dragStart);
                if (that.world.startDrag)
                    that.world.startDrag(dragStart, event, ui);
            },

            drag : function(event, ui) {
                setToCanvasRelative(dragCurrent, event);

                var delta = Vector.sub(dragCurrent, dragLast);
                if (that.world.drag)
                    that.world.drag(dragCurrent, delta, event, ui);

                dragLast.setTo(dragCurrent);

            },
            stop : function(event, ui) {
                if (that.world.stopDrag)
                    that.world.stopDrag(dragCurrent, event, ui);

                app.isDragging = false;
            },
            helper : function() {
                //debugger;
                return $("<div></div>");
            }
        });

    }
});

