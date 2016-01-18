// Events
window.addEventListener("resize", drawMenu, false);

var gameTimer, gt = 60;
var maxHearts = 5;
var hearts;
var points = 0;
var menu = document.querySelector("#menu");
var images;
var states = {"MAINMENU": 0, "INGAME": 1}; // "enum", rip I miss C#.
var gameState = states.MAINMENU;

function randomNumber(min, max) {
    return ~~(Math.random() * max | 0) + min;
}

function secToMMSS(s) {
    var mm = ("00" + (~~(s / 60) % 60)).substr(-2);
    var ss = ("00" + (s % 60)).substr(-2);
    return mm + ":" + ss;
}

function drawMenu() {
    menu.width = window.innerWidth;
    var ctx = menu.getContext("2d");
    ctx.save();
    
    if (gameState == states.MAINMENU) {
        
    } else if (gameState == states.INGAME) {
        
        // Fill red block
        ctx.fillStyle = "#6c1212";
        ctx.beginPath();
        ctx.fillRect(0, (menu.height - 100) / 2, menu.width, 100);

        // Fill circle
        ctx.fillStyle = "#390909";
        ctx.beginPath();
        var cX = (menu.width - 150) / 2;
        var cY = 32;
        ctx.arc(75 + cX, 75 + cY, 75, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // Draw hearts
        var heartSectionW = (menu.width - 150) / 2;
        var heartsWidth = maxHearts * 48 + 10 * (maxHearts - 1);
        var hX = (heartSectionW - heartsWidth) / 2;
        var hY = (menu.height - 48) / 2;
        for (var h = 0; h < hearts; h++) {
            ctx.drawImage(images["heart"], hX + 58 * h, hY);
        }
        for (var rip = 0; rip < (maxHearts - hearts); rip++) {
            ctx.drawImage(images["heart-dark"], hX + 58 * (hearts + rip), hY);
        }

        // Draw timer
        var mmSS = secToMMSS(gt);
        ctx.font = "300 48px Open Sans";
        ctx.fillStyle = "#fafafa";
        var timeWidth = ctx.measureText(mmSS).width;
        var timeX = cX + (150 - timeWidth) / 2;
        var timeY = cY + (150 - Math.ceil(ctx.measureText("M").width)) / 2 + Math.ceil(ctx.measureText("M").width) - 5; /* Using M for approx height */
        ctx.fillText(mmSS, timeX, timeY, timeWidth);

        // Draw points
        var pText = points + " point" + (points == 1 ? "" : "s");
        var pWidth = ctx.measureText(pText).width;
        var pTextX = cX + 150 + (cX - pWidth) / 2;
        var pTextY = (menu.height - 100) / 2 + (100 - Math.ceil(ctx.measureText("M").width)) / 2 + Math.ceil(ctx.measureText("M").width) - 5;
        ctx.fillText(pText, pTextX, pTextY, pWidth);
    }
}

function drawHeart() {
    // TODO.
}

function startLevel(level) {
    
    // Start gametimer
    gameTimer = setInterval(function () {
        gt--;
        if (gt == 0) {
            clearInterval(gameTimer);
            
            // Time's up!
            // TODO: show score etc.
        }
        drawMenu();
    }, 1000);
}

function initialize() {
    
    // TESTING PURPOSES ONLY
    //var cb = new CenixBlock("test", 10, this);
    //console.log(cb);

    hearts = maxHearts;
    
    // Load images
    images = {};
    var heartImg = new Image();
    var darkHeartImg = new Image();
    heartImg.onload = function() {
        images["heart"] = heartImg;
        darkHeartImg.onload = function() {
            images["heart-dark"] = darkHeartImg;
            
            // Images loaded, proceed to draw the menu.
            drawMenu();
        }
        darkHeartImg.src = "img/heart-dark.png";
    }
    heartImg.src = "img/heart.png";
}

/* CenixBlock "class" - to organize all the blocks properly. */
function CenixBlock (id, time, parent) {
    this.id = id;
    this.parent = parent;
    
    // Graphics
    this.canvas = document.querySelector("#" + this.id);
    this.canvas.cb = this;
    this.canvas.addEventListener("mousedown", this.mouseClick);
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false; // So we can draw pixel-perfect stuff
    
    // Countdown timer
    this.time = time;
    this.timeLeft;
    this.countdown;
    
    // Color management
    this.cSize = {width: 64, height: 64};
    this.colors;
    this.colorToClick;
    this.genColors();
}

CenixBlock.prototype.mouseClick = function(e) {
    var mouseX = e.x - this.offsetLeft;
    var mouseY = e.y - this.offsetTop;
    for (var y = 0; y < this.cb.colors.length; y++) {
        for (var x = 0; x < this.cb.colors[y].length; x++) {
            var cx = 10 + x * (this.cb.cSize.width + 5);
            var cy = 10 + y * (this.cb.cSize.height + 5);
            if (mouseX >= cx && mouseX <= cx + this.cb.cSize.width && mouseY >= cy && mouseY <= cy + this.cb.cSize.height) {
                clearInterval(this.cb.countdown); // Stop timer from going crazy.
                
                // Check if you clicked the correct color.
                var clickedColor = this.cb.colors[y][x];
                if (clickedColor == this.cb.colorToClick) {
                    
                    // Correct color! +points, gen colors and redraw.
                    this.cb.parent.points += 100;
                    console.log("Points: " + this.cb.parent.points);
                    this.cb.genColors();
                } else {
                    
                    // Wrong color! -hearts, gen colors and redraw.
                    if (this.cb.parent.hearts > 0) this.cb.parent.hearts--;
                    if (this.cb.parent.hearts == 0) {

                        // Game over!
                        this.cb.canvas.style.display = "none";
                        document.querySelector("#failed").style.display = "block";
                    } else {
                        this.cb.genColors();
                    }
                }
                drawMenu();
            }
        }   
    }
}

CenixBlock.prototype.redraw = function(cb) {
    this.context.save();
    
    // Set to a random color and draw the 10px border
    this.colorToClick = this.colors[randomNumber(0, 2)][randomNumber(0, 2)];
    this.context.lineWidth = 10;
    this.context.fillStyle = "#fafafa";
    this.context.fillRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);
    this.context.strokeStyle = this.colorToClick;
    this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (var y = 0; y < this.colors.length; y++) {
        for (var x = 0; x < this.colors[y].length; x++) {
            this.context.fillStyle = this.colors[y][x];
            this.context.fillRect(10 + x * (this.cSize.width + 5), 10 + y * (this.cSize.height + 5), this.cSize.width, this.cSize.height);
        }
    }
    this.context.restore();
    if (typeof(cb) == "function") cb(this); // Throw callback
}

CenixBlock.prototype.genColors = function() {
    this.colors = [["", "", ""], ["", "", ""], ["", "", ""]];
    for (var y = 0; y < this.colors.length; y++) {
        for (var x = 0; x < this.colors[y].length; x++) {
            this.colors[y][x] = "#" + ("000000" + ~~(Math.random() * 16777215).toString(16)).substr(-6);
        }
    }
    
    // Redraw()
    this.redraw(function (e) {
        
        //Countdown timer
        e.timeLeft = e.time;
        e.countdown = setInterval(function() {
            console.log(e.timeLeft);
            if (e.timeLeft > 0) e.timeLeft--;
            if (e.timeLeft <= 0) {
                clearInterval(e.countdown);
                
                // Redraw!
                if (e.parent.hearts > 0) e.parent.hearts--;
                if (e.parent.hearts == 0) {
                    clearInterval(e.countdown);
                    
                    // Game over!
                    e.canvas.style.display = "none";
                    document.querySelector("#failed").style.display = "block";
                } else {
                    e.genColors();
                }
                drawMenu();
            }
        }, 1000);
    });
}

initialize();