var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var borderSize = 40;
canvas.width = width - borderSize;
canvas.height = height - borderSize;
canvas.style = "position:absolute; left: 50%; top: 50%; transform: translate(-50%,-50%)";
canvas.style.backgroundColor = "white";

document.body.appendChild(canvas);
var renderSaveCount = 0; // Counts the number of mouse events that we did not have to render the whole scene

var arrow = {
    x : width/2,
    y : height/2,
    image : new Image()
};
var mouse = {
    x : null,
    y : null,
    changed : false,
    changeCount : 0,
}


arrow.image.src = 'https://d30y9cdsu7xlg0.cloudfront.net/png/35-200.png';

function drawImageLookat(img, x, y, lookx, looky){
     ctx.setTransform(1, 0, 0, 1, x, y);
     ctx.rotate(Math.atan2(looky - y, lookx - x) - Math.PI / 2); // Adjust image 90 degree anti clockwise (PI/2) because the image  is pointing in the wrong direction.
     ctx.drawImage(img, -img.width / 2, -img.height / 2);
     ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default not needed if you use setTransform for other rendering operations
}
function drawCrossHair(x,y,color){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
}

function mouseEvent(e) {  // get the mouse coordinates relative to the canvas top left
    var bounds = canvas.getBoundingClientRect(); 
    mouse.x = e.pageX - bounds.left;
    mouse.y = e.pageY - bounds.top;
    mouse.cx = e.clientX - bounds.left; // to compare the difference between client and page coordinates
    mouse.cy = e.clienY - bounds.top;
    mouse.changed = true;
    mouse.changeCount += 1;
}
document.addEventListener("mousemove",mouseEvent);
var renderTimeTotal = 0;
var renderCount = 0;
ctx.font = "18px arial";
ctx.lineWidth = 1;
// only render when the DOM is ready to display the mouse position
function update(){
    if(arrow.image.complete && mouse.changed){ // only render when image ready and mouse moved
        var now = performance.now();
        mouse.changed = false; // flag that the mouse coords have been rendered
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // get mouse canvas coordinate correcting for page scroll
        var x = mouse.x - scrollX;
        var y = mouse.y - scrollY;
        drawImageLookat(arrow.image, arrow.x, arrow.y, x ,y);
        // Draw mouse at its canvas position
        drawCrossHair(x,y,"black");
        // draw mouse event client coordinates on canvas
        drawCrossHair(mouse.cx,mouse.cy,"rgba(255,100,100,0.2)");
       
        // draw line from arrow center to mouse to check alignment is perfect
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.globalAlpha = 0.2;
        ctx.moveTo(arrow.x, arrow.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Display how many renders that were not drawn and approx how much time saved (excludes DOM time to present canvas to display)
        renderSaveCount += mouse.changeCount -1;
        mouse.changeCount = 0;
        var timeSaved = ((renderTimeTotal / renderCount) * renderSaveCount);
        var timeRatio = ((timeSaved / renderTimeTotal) * 100).toFixed(0);

        ctx.fillText("Avoided "+ renderSaveCount + " needless renders. Saving ~" + timeSaved.toFixed(0) +"ms " + timeRatio + "% .",10,20);
        // get approx render time per frame
        renderTimeTotal += performance.now()-now;
        renderCount += 1;

    }
    requestAnimationFrame(update);

}
requestAnimationFrame(update);
