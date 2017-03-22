"use strict";
var gameTimer, gt;
var hearts, maxHearts = 5;
var points;

var game = document.querySelector("#game");
var minGameH = 800;
var minGameW = 800;
var gameCtx = game.getContext("2d");
var gameAlpha = 1;

var images;

var states = {MAINMENU: 0, HIGHSCORE: 1, ENTERNAME: 2, SELECTLEVEL: 3, INGAME: 4, GAMEOVER: 5}; // "enum", ... I miss C#.
var mainColors = {white: "#fafafa", lightred: "#e1c3c3", red: "#6c1212", darkred: "#390909"};
var gameState = states.MAINMENU;

var nameBox = document.querySelector("#enterName");
nameBox.addEventListener("input", function() {
    name = nameBox.value;
    redraw();
});
var name = "", nameNext = false;

var mainMenuHeight = 214;
var mainMenuY;
var mainMenuItems = ["New game", "High-scores"];
var mainMenuSel = -1;

var hsY = 200;
var hsTabH = 50;
var hsTabI = 0;
var hsHoverTab = -1;
var hsColTitles = ["Rank", "Points", "Name", "When"];
var hsPnSize = {width: 41, height: 48};
var hsInfo;
var hsHoverButton = -1;

var diffiY;
var diffiItems = {Easy: 1, Medium: 2, Hard: 4, Extreme: 6};
var diffiSel = -1;

var goMenu = ["Submit score", mainMenuItems[1], "Try again?", "Change difficulty"];
var goMenuIH = 100, goMenuIW, goMenuIY;
var goMenuSel = -1;

var cenixBlocks;

// Events
window.addEventListener("resize", redraw);
game.addEventListener("mousemove", mouseMove);
game.addEventListener("click", mouseClick);

function randomNumber(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
}

function secToMMSS(s) {
    var mm = ("00" + (~~(s / 60) % 60)).substr(-2);
    var ss = ("00" + (s % 60)).substr(-2);
    return mm + ":" + ss;
}

function mouseMove(e) {
    switch (gameState) {
        case states.MAINMENU:
            if (e.y >= mainMenuY && e.y <= mainMenuY + mainMenuItems.length * 100) {
                if (document.body.style.cursor != "pointer") document.body.style.cursor = "pointer";
                
                // We're inside the menu, check what button we're hovering.
                for (var i = 0; i < mainMenuItems.length; i++) {
                    if (e.y >= mainMenuY + 100 * i && e.y <= mainMenuY + (i + 1) * 100) {
                        mainMenuSel = i;
                        redraw();
                        break;
                    }
                }
            } else {
                if (document.body.style.cursor != "default") document.body.style.cursor = "default";
                if (mainMenuSel != -1) {
                    mainMenuSel = -1;
                    redraw();
                }
            }
            break;
        case states.HIGHSCORE:
            
            // Tab hover
            var pointer = false;
            var quadW = Math.ceil(game.width / 4);
            if (e.y >= hsY - 50 && e.y <= hsY) {
                pointer = true;
                hsHoverTab = Math.ceil(e.x / quadW) - 1;
                redraw();
            } else {
                if (hsHoverTab != -1) {
                    hsHoverTab = -1;
                    redraw();
                }
            }
            
            // Bottom buttons hover
            var halfW = Math.ceil(game.width / 2);
            if (e.y >= game.height - 150 && e.y <= game.height - 75) {
                pointer = true;
                hsHoverButton = Math.ceil(e.x / halfW) - 1;
                redraw();
            } else {
                if (hsHoverButton != -1) {
                    hsHoverButton = -1;
                    redraw();
                }
            }
            if (document.body.style.cursor != (pointer ? "pointer" : "default")) document.body.style.cursor = (pointer ? "pointer" : "default");
            break;
        case states.ENTERNAME:
            
            // Only check for hover when name != ""
            if (name != "") {
                
                // Name box positions, gotta calc because we're using transform to center...
                var nbX = nameBox.offsetLeft - (nameBox.offsetWidth / 2);
                var nbY = nameBox.offsetTop - (nameBox.offsetHeight / 2);
                
                nameNext = (e.y >= nbY - 15 && e.y <= nbY + nameBox.offsetHeight + 15 && e.x >= nbX + nameBox.offsetWidth + 20);
                document.body.style.cursor = (nameNext ? "pointer" : "default");
                redraw();
            }
            break;
        case states.SELECTLEVEL:
            var di = Object.keys(diffiItems);
            if (e.y >= diffiY + 100 && e.y <= diffiY + (di.length * 75 + 100)) {
                if (document.body.style.cursor != "pointer") document.body.style.cursor = "pointer";
                
                // Same as in mainmenu, the mouse is inside the selector, where we're at.
                for (var i = 0; i < di.length; i++) {
                    if (e.y >= diffiY + 100 + 75 * i && e.y <= diffiY + 100 + 75 * (i + 1)) {
                        diffiSel = i;
                        redraw();
                        break;
                    }
                }
            } else {
                if (document.body.style.cursor != "default") document.body.style.cursor = "default";
                if (diffiSel != -1) {
                    diffiSel = -1;
                    redraw();
                }
            }
            break;
        case states.GAMEOVER:
            if (gameAlpha != 1) break;
            if (e.y >= goMenuIY && e.y <= goMenuIY + (goMenu.length / 2) * goMenuIH) {
                if (document.body.style.cursor != "pointer") document.body.style.cursor = "pointer";
                
                var ii = 0;
                for (var i = 0; i < goMenu.length; i++) {
                    ii = (i >= goMenu.length / 2 ? 1 : 0);
                    if (e.y >= goMenuIY + (ii * goMenuIH) && e.y <= goMenuIY + (ii * goMenuIH) + goMenuIH && e.x >= (i % 2) * goMenuIW && e.x <= (i % 2) * goMenuIW + goMenuIW) {
                        goMenuSel = i;
                        redraw();
                        break;
                    }
                }
            } else {
                if (document.body.style.cursor != "default") document.body.style.cursor = "default";
                if (goMenuSel != -1) {
                    goMenuSel = -1;
                    redraw();
                }
            }
            break;
    }
}

function mouseClick(e) {
    switch (gameState) {
        case states.MAINMENU:
            if (mainMenuSel == 0) {
                
                // Move on to entering the name
                mainMenuSel = -1;
                gameState = states.ENTERNAME;
                nameBox.style.display = "block";
                document.body.style.cursor = "default";
                redraw();
            } else if (mainMenuSel == 1) {
                showHighscore();
            }
            break;
        case states.HIGHSCORE:
            
            if (hsHoverTab > -1) {
                if (hsTabI != hsHoverTab) {
                    hsTabI = hsHoverTab;
                    redraw();
                }
            }
            if (hsHoverButton == 0) {
                
                // Back to mainmenu
                resetStats();
                gameState = states.MAINMENU;
                document.body.style.cursor = "default";
                redraw();
            } else if (hsHoverButton == 1) {
                
                // Refresh high-scores
                loadHighscore(Object.keys(diffiItems), 0, true);
            }
            break;
        case states.ENTERNAME:
            
            // Hovering "next" area
            if (nameNext) {
                
                // Proceed to select level stage.
                gameState = states.SELECTLEVEL;
                nameBox.style.display = "none";
                document.body.style.cursor = "default";
                nameNext = false;
                redraw();
            }
            break;
        case states.SELECTLEVEL:
            if (diffiSel > -1) startGame()
            break;
        case states.INGAME:
            
            // Loop through and check what cenix block we're clicking.
            var clicked = false;
            for (var i = 0; i < cenixBlocks.length; i++) {
                var cb = cenixBlocks[i];
                for (var y = 0; y < cb.colors.length; y++) {
                    for (var x = 0; x < cb.colors[y].length; x++) {
                        var cx = cb.x + 10 + x * (cb.cSize.width + 5);
                        var cy = cb.y + 10 + y * (cb.cSize.height + 5);
                        if (e.x >= cx && e.x <= cx + cb.cSize.width && e.y >= cy && e.y <= cy + cb.cSize.height) {
                            clicked = true;
                            clearInterval(cb.countdown);
                            
                            var clickedColor = cb.colors[y][x];
                            if (clickedColor == cb.colorsToClick) {
                                
                                // Correct color! +points, gen colors and redraw.
                                addPoints(cb);
                            } else {
                                
                                // Wrong color! -hearts, gen colors and redraw.
                                removeHeart(cb);
                            }
                            break;
                        }
                    }
                    if (clicked) break;
                }
                if (clicked) break;
            }
            break;
        case states.GAMEOVER:
            if (goMenuSel > -1) {
                switch (goMenuSel) {
                    case 0: // Submit score
                        submitScore();
                        break;
                    case 1: // Highscore
                        showHighscore();
                        break;
                    case 2: // Try again?
                        startGame();
                        break;
                    case 3: // Change difficulty
                        selDif();
                        break;
                }
            }
            break;
    }
}

function generateColors() {
    var cInfo = {c: [["", "", ""], ["", "", ""], ["", "", ""]], click: ""}
    for (var y = 0; y < cInfo.c.length; y++) {
        for (var x = 0; x < cInfo.c[y].length; x++) {
            cInfo.c[y][x] = "#" + ("000000" + Math.floor(Math.random() * 16777215).toString(16)).substr(-6);
        }
    }
    cInfo.click = cInfo.c[randomNumber(0, 2)][randomNumber(0, 2)];
    return cInfo;
}

function addPoints(cb) {
    points += 100;
    setupCb(cb);
    redraw();
}

function removeHeart(cb) {
    if (hearts > 0) hearts--;
    if (hearts == 0) {
       gameOver();
    } else {
        setupCb(cb);
    }
    redraw();
}

function gameOver() {
    clearInterval(gameTimer);
    
    // Stop cenixblock timers, remove them, then redraw.
    var i = cenixBlocks.length;
    while (i--) {
        var cb = cenixBlocks[i];
        clearInterval(cb.countdown);
    }
    cenixBlocks = [];
    
    gameAlpha = 0;
    
    // Fade in gameover screen
    gameState = states.GAMEOVER;
    redraw();
    var fadeOut = setInterval(function() {
        gameAlpha += 0.006;
        redraw();
        if (gameAlpha >= 1) {
            gameAlpha = 1;
            clearInterval(fadeOut);
            redraw();
        }
    }, 10);
}

function resetStats() {
    gt = 60;
    hearts = maxHearts;
    points = 0;
    cenixBlocks = [];
}

function startGame() {
    resetStats();
                
    // Create the cenix blocks and start the game.
    var blocks = diffiItems[Object.keys(diffiItems)[diffiSel]];
    for (var b = 0; b < blocks; b++) {
        var cb = {
            x: undefined,
            y: undefined,
            width: 222,
            height: 222,
            time: 10,
            timeLeft: 10,
            countdown: undefined,
            cSize: {width: 64, height: 64},
            colors: undefined,
            colorsToClick: undefined
        };
        setupCb(cb);
        cenixBlocks.push(cb);
    }
    
    gameState = states.INGAME;
    document.body.style.cursor = "default";
    redraw();
    
    // Start gametimer
    gameTimer = setInterval(function () {
        gt--;
        if (gt == 0) gameOver();
        redraw();
    }, 1000);
}

function selDif() {
    gt = 60;
    hearts = maxHearts;
    points = 0;
    diffiSel = -1;
    gameState = states.SELECTLEVEL;
    document.body.style.cursor = "default";
    redraw();
}

function submitScore() {
    var http = new XMLHttpRequest();
    var params = "name=" + name + "&points=" + points + "&difficulty=" + diffiSel + "&timestamp=" + ~~(Date.now() / 1000);
    http.open("POST", "php/submitScore.php", true);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    
    http.onreadystatechange = function() {
        if (http.readyState == XMLHttpRequest.DONE && http.status == 200 && http.responseText == "ok") showHighscore();
    }
    http.send(params);
}

function showHighscore() {
    gameState = states.HIGHSCORE;
    document.body.style.cursor = "default";
    redraw();
    
    // Load highscore recursively
    loadHighscore(Object.keys(diffiItems), 0, true);
}

function loadHighscore(di, i, clearInfo) {
    if (clearInfo) {
        redraw();
        hsInfo = {};
    }
    var http = new XMLHttpRequest();
    http.di = di;
    http.i = i;
    
    // Post data
    var params = "difficulty=" + i;
    http.open("POST", "php/highscore.php", true);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    http.setRequestHeader("Accept", "*/*");
    http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    http.onreadystatechange = viewHighscore;
    http.send(params);
}

function viewHighscore() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        hsInfo[this.di[this.i]] = (this.responseText != "" ? JSON.parse(this.responseText).sort(function (a, b) { return b.points - a.points; }) : null);

        this.i++;
        if (this.i > this.di.length - 1) {

            // Loaded
            redraw();
        } else {
            loadHighscore(this.di, this.i, false);
        }
    }
}

function setupCb(cb) {
    var cInfo = generateColors();
    cb.colors = cInfo.c;
    cb.colorsToClick = cInfo.click;
    cb.timeLeft = cb.time;
    cb.countdown = setInterval(function() {
        console.log(cb.timeLeft);
        if (cb.timeLeft > 0) cb.timeLeft--;
        if (cb.timeLeft == 0) {
            clearInterval(cb.countdown);
            
            removeHeart(cb);
        }
    }, 1000);
}

function getDifPos(blocks) {
    var pos = [];
    switch (blocks) {
        case diffiItems.Easy:
            pos.push({x: ~~((game.width - 222) / 2), y: ~~(214 + ((game.height - 214) - 222) / 2)});
            break;
        case diffiItems.Medium:
            for (var i = 0; i < blocks; i++) {
                pos.push({x: ~~(game.width / 2) * i + ~~(((game.width / 2) - 222) / 2),
                          y: ~~(214 + ((game.height - 214) - 222) / 2)});
            }
            break;
        case diffiItems.Hard:
        case diffiItems.Extreme:
            var hB = blocks / 2;
            for (var i = 0; i < blocks; i++) {
                var yI = (i >= blocks / 2 ? 1 : 0);
                pos.push({x: ~~(game.width / hB) * (i % hB) + ~~(((game.width / hB) - 222) / 2),
                          y: 214 + ~~((game.height - 214) / 2) * yI});
            }
            break;
    }
    return pos
}

function getTimeAgo(t) {
    var diff = Math.abs(~~(Date.now() / 1000) - t);
    var secs = diff;
    
    var minutes = secs / 60;
    secs = ~~(secs % 60);
    if (minutes < 1) {
        return secs + (secs > 1 ? " seconds ago" : " second ago");
    }
    
    var hours = minutes / 60;
    minutes = ~~(minutes % 60);
    if (hours < 1) {
        return minutes + (minutes > 1 ? " minutes ago" : " minute ago");
    }
    
    var days = hours / 24;
    hours = ~~(hours % 60);
    if (days < 1) {
        return hours + (hours > 1 ? " hours ago" : " hour ago");
    }
    days = Math.ceil(days);
    return days + (days > 1 ? " days ago" : " days ago");
}

function redraw() {
    drawMenu();
    if (gameState == states.INGAME) drawGame();
}

function drawGame() {
    gameCtx.save();
    gameCtx.globalAlpha = gameAlpha;
    var dPos = getDifPos(cenixBlocks.length);
    for (var i = 0; i < cenixBlocks.length; i++) {
        var cb = cenixBlocks[i];
        cb.x = dPos[i].x;
        cb.y = dPos[i].y;
        
        // Draw color to click border
        gameCtx.fillStyle = cb.colorsToClick;
        gameCtx.fillRect(cb.x, cb.y, cb.width, cb.height);
        
        // Fill white back
        gameCtx.fillStyle = mainColors.white;
        gameCtx.fillRect(cb.x + 5, cb.y + 5, cb.width - 10, cb.height - 10);
        
        // Draw all the colors
        for (var y = 0; y < cb.colors.length; y++) {
            for (var x = 0; x < cb.colors[y].length; x++) {
                gameCtx.fillStyle = cb.colors[y][x];
                gameCtx.fillRect(cb.x + 10 + x * (cb.cSize.width + 5), cb.y + 10 + y * (cb.cSize.height + 5), cb.cSize.width, cb.cSize.height);
            }
        }
    }
    gameCtx.restore();
}

function drawMenu() {
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    mainMenuY = ~~((window.innerHeight - mainMenuItems.length * 100) / 2);
    gameCtx.save();
    gameCtx.globalAlpha = gameAlpha;
    gameCtx.font = "300 48px Open Sans";
    
    switch (gameState) {
        case states.MAINMENU:
            for (var i = 0; i < mainMenuItems.length; i++) {
                var c = mainColors.red;
                if (mainMenuSel == i) {

                    // Draw selected rectangle and change forecolor
                    gameCtx.beginPath();
                    gameCtx.fillStyle = mainColors.red;
                    gameCtx.fillRect(0, mainMenuY + i * 100, game.width, 100);
                    c = mainColors.white;
                }

                // Draw text
                gameCtx.fillStyle = c;
                var menuTextW = gameCtx.measureText(mainMenuItems[i]).width;
                var menuTextH = gameCtx.measureText("M").width; // Width of M is almost the height, approx.
                gameCtx.fillText(mainMenuItems[i], (game.width - menuTextW) / 2, mainMenuY + i * 100 + (100 - menuTextH) / 2 + menuTextH);
            }
            break;
        case states.HIGHSCORE:
            
            // Draw title
            gameCtx.fillStyle = mainColors.red;
            gameCtx.font = "300 48px Open Sans";
            var hsTitle = "High-scores";
            var hsTitleW = gameCtx.measureText(hsTitle).width;
            var hsTitleH = gameCtx.measureText("M").width;
            gameCtx.fillText(hsTitle, (game.width - hsTitleW) / 2, (150 - hsTitleH) / 2 + hsTitleH);
            
            // Draw column bar
            gameCtx.fillRect(0, hsY, game.width, hsTabH);
            
            // Draw column titles
            var di = Object.keys(diffiItems);
            var colTW = ~~(game.width / di.length);
            var quadW = Math.ceil(game.width / 4);
            for (var i = 0; i < di.length; i++) {
                var dnW = gameCtx.measureText(di[i]).width;
                var c = mainColors.red;
                var colTextX = i * colTW + (colTW - dnW) / 2;
                
                // Draw selected tab
                if (i == hsTabI) {
                    c = mainColors.white;
                    gameCtx.fillRect(i * quadW, hsY - 50, quadW, 50);
                }
                
                gameCtx.font = "300 36px Open Sans";
                gameCtx.fillStyle = c;
                gameCtx.fillText(di[i], colTextX, hsY - 10);
            }
            
            // Draw hs cols
            gameCtx.font = "300 18px Open Sans";
            var halfW = ~~(game.width / 2);
            var hsColTW = halfW / 4;
            var hsColH = gameCtx.measureText("M").width;
            var hsColXs = [];
            for (var ci = 0; ci < hsColTitles.length; ci++) {
                var hsColW = gameCtx.measureText(hsColTitles[ci]).width;
                var x = halfW / 2 + ci * hsColTW + (hsColTW - hsColW) / 2;
                hsColXs.push(x);
                gameCtx.fillStyle = mainColors.white;
                gameCtx.fillText(hsColTitles[ci], x, hsY + (50 - hsColH) / 2 + hsColH);
            }
            
            // Draw hs info
            if (hsInfo != undefined && hsTabI > -1) {
                gameCtx.fillStyle = mainColors.red;
                var info = hsInfo[Object.keys(hsInfo)[hsTabI]];
                if (info != null) {
                    for (var i = 0; i < info.length; i++) {
                        var tH = hsColH;
                        var fontWeight = "300";
                        if (i == 0) {
                            
                            // Make #1 place bold
                            fontWeight = "bold";
                            tH = gameCtx.measureText("M").width;
                        }
                        var y = hsY + hsTabH + 15 + (25 * i) + tH;
                        
                        gameCtx.font = fontWeight + " 18px Open Sans";
                        gameCtx.fillText(i + 1, hsColXs[0], y);
                        gameCtx.fillText(info[i].points, hsColXs[1], y);
                        gameCtx.fillText(info[i].name, hsColXs[2], y);
                        gameCtx.fillText(getTimeAgo(info[i].timestamp), hsColXs[3], y);
                    }
                    
                    // Draw prev and next buttons, TODO: make it dynamic, both are enabled for now.
                    var pnBtnW = halfW / 2;
                    var pnY = (hsY + 50) + ~~(((game.height - (hsY + 50 + 150)) - hsPnSize.height) / 2);
                    for (var p = 0; p < 2; p++) {
                        var x = ~~(p * (halfW + pnBtnW) + (pnBtnW - hsPnSize.width) / 2);
                        //hsPageBtns.push({x: x, y: pnY, width: 48, height: 48});

                        // Draw arrow
                        gameCtx.beginPath();
                        gameCtx.fillStyle = mainColors.lightred;

                        if (p == 0) {

                            // Triangle pointing towards left/right
                            gameCtx.moveTo(x, pnY + (hsPnSize.height / 2)); // Move to left center
                            gameCtx.lineTo(x + hsPnSize.width, pnY + hsPnSize.height) // Line to bottom right
                            gameCtx.lineTo(x + hsPnSize.width, pnY); // Line to top right
                        } else {

                            // Triangle pointing towards right
                            gameCtx.moveTo(x + hsPnSize.width, pnY + (hsPnSize.height / 2)); // Move to right center
                            gameCtx.lineTo(x, pnY + hsPnSize.height); // Line to bottom left
                            gameCtx.lineTo(x, pnY); // Line to top left
                        }

                        gameCtx.fill();
                    }
                }
            }
            
            // Draw selected button rectangle
            if (hsHoverButton > -1) {
                gameCtx.fillStyle = mainColors.red;
                gameCtx.fillRect(hsHoverButton * halfW, game.height - 150, halfW, 75);
            }
            
            // Draw back button
            gameCtx.font = "300 48px Open Sans";
            gameCtx.fillStyle = (hsHoverButton == 0 ? mainColors.white : mainColors.red);
            var hsBackT = "Back";
            var hsBackW = gameCtx.measureText(hsBackT).width;
            gameCtx.fillText(hsBackT, (halfW - hsBackW) / 2, game.height - 150 + hsTitleH + (60 - hsTitleH) / 2);
            
            // Draw refresh button;
            gameCtx.fillStyle = (hsHoverButton == 1 ? mainColors.white : mainColors.red);
            var hsRefreshT = "Refresh";
            var hsRefreshW = gameCtx.measureText(hsRefreshT).width;
            gameCtx.fillText(hsRefreshT, halfW + (halfW - hsBackW) / 2, game.height - 150 + hsTitleH + (60 - hsTitleH) / 2);
            
            break;
        case states.ENTERNAME:
            var nbX = nameBox.offsetLeft - (nameBox.offsetWidth / 2);
            var nbY = nameBox.offsetTop - (nameBox.offsetHeight / 2);
            var nblW = gameCtx.measureText("Name").width;
            var nblH = gameCtx.measureText("M").width;
            var nC = (nameNext ? mainColors.white : mainColors.red);

            // Draw rectangle block thing if we're hoverig the right side of the nameBox
            if (nameNext) {
                var nbY = nameBox.offsetTop - (nameBox.offsetHeight / 2);
                gameCtx.fillStyle = mainColors.red;
                gameCtx.fillRect(0, nbY - 15, game.width, nameBox.offsetHeight + 15 * 2);
            }

            // Draw label before the namebox
            gameCtx.font = "300 36px Open Sans";
            gameCtx.fillStyle = nC;
            gameCtx.fillText("Name", nbX - nblW, nbY + nblH - (44 - nblH) * 2);

            // Draw next "button"
            if (name != "") gameCtx.fillText("Next", nbX + nameBox.offsetWidth + 20, nbY + nblH - (44 - nblH) * 2);
            break;
        case states.SELECTLEVEL:
            
            // Set Y-origo for all select diffi content.
            var di = Object.keys(diffiItems);
            diffiY = ~~((game.height - (100 + di.length * 75)) / 2);

            // Draw title
            gameCtx.fillStyle = mainColors.red;
            var titleW = gameCtx.measureText("Select difficulty").width;
            var titleH = gameCtx.measureText("M").width;
            gameCtx.fillText("Select difficulty", (game.width - titleW) / 2, diffiY + titleH);

            // Draw difficulties
            gameCtx.font = "300 36px Open Sans";
            for (var d = 0; d < di.length; d++) {
                var c = mainColors.red;
                if (d == diffiSel) {

                    // Draw selected difficulty and change forecolor
                    gameCtx.beginPath();
                    gameCtx.fillStyle = mainColors.red;
                    gameCtx.fillRect(0, diffiY + 100 + d * 75, game.width, 75);
                    c = mainColors.white;
                }

                // Draw text
                var diffiW = gameCtx.measureText(di[d]).width;
                var diffiH = gameCtx.measureText("M").width;
                gameCtx.fillStyle = c;
                gameCtx.fillText(di[d], (game.width - diffiW) / 2, diffiY + 100 + d * 75 + (75 - diffiH) + 5);
            }
            break;
        case states.INGAME:
            
            // Fill red block
            gameCtx.fillStyle = mainColors.red;
            gameCtx.beginPath();
            gameCtx.fillRect(0, (mainMenuHeight - 100) / 2, game.width, 100);

            // Fill circle
            gameCtx.fillStyle = mainColors.darkred;
            gameCtx.beginPath();
            var cX = (game.width - 150) / 2;
            var cY = 32;
            gameCtx.arc(75 + cX, 75 + cY, 75, 0, 2 * Math.PI);
            gameCtx.fill();

            // Draw hearts
            var heartSectionW = (game.width - 150) / 2;
            var heartsWidth = maxHearts * 48 + 10 * (maxHearts - 1);
            var hX = (heartSectionW - heartsWidth) / 2;
            var hY = (mainMenuHeight - 48) / 2;
            for (var h = 0; h < hearts; h++) {
                gameCtx.drawImage(images["heart"], hX + 58 * h, hY);
            }
            for (var rip = 0; rip < (maxHearts - hearts); rip++) {
                gameCtx.drawImage(images["heart-dark"], hX + 58 * (hearts + rip), hY);
            }

            // Draw timer
            var mmSS = secToMMSS(gt);
            gameCtx.font = "300 48px Open Sans";
            gameCtx.fillStyle = mainColors.white;
            var timeWidth = gameCtx.measureText(mmSS).width;
            var timeX = cX + (150 - timeWidth) / 2;
            var timeY = cY + (150 - Math.ceil(gameCtx.measureText("M").width)) / 2 + Math.ceil(gameCtx.measureText("M").width) - 5; // Using M for approx height
            gameCtx.fillText(mmSS, timeX, timeY, timeWidth);

            // Draw points
            var pText = points + " point" + (points == 1 ? "" : "s");
            var pWidth = gameCtx.measureText(pText).width;
            var pTextX = cX + 150 + (cX - pWidth) / 2;
            var pTextY = (mainMenuHeight - 100) / 2 + (100 - Math.ceil(gameCtx.measureText("M").width)) / 2 + Math.ceil(gameCtx.measureText("M").width) - 5;
            gameCtx.fillText(pText, pTextX, pTextY, pWidth);
            break;
        case states.GAMEOVER:
            
            // Draw scorebar.
            var scoreBarH = 125;
            var scoreBarY = ~~((game.height - scoreBarH) / 3);
            gameCtx.fillStyle = mainColors.red;
            gameCtx.fillRect(0, scoreBarY, game.width, scoreBarH);
            
            // Get difficulty
            var d = diffiItems[Object.keys(diffiItems)[diffiSel]];
            switch (d) {
                case diffiItems.Easy:
                    d = "Easy";
                    break;
                case diffiItems.Medium:
                    d = "Medium";
                    break;
                case diffiItems.Hard:
                    d = "Hard";
                    break;
                case diffiItems.Extreme:
                    d = "Extreme";
                    break;
            }
            
            // Draw title
            gameCtx.font = "300 64px Open Sans";
            var goT = "Game over, " + name + "!";
            var goW = gameCtx.measureText(goT).width;
            var goH = gameCtx.measureText("M").width;
            gameCtx.fillText(goT, (game.width - goW) / 2, scoreBarY - 50 - goH);
            
            // Draw score
            var sbText = points + " point" + (points == 1 ? "" : "s") + " – " + d;
            var sbtW = gameCtx.measureText(sbText).width;
            var sbtH = gameCtx.measureText("M").width;
            gameCtx.fillStyle = mainColors.white;
            gameCtx.fillText(sbText, (game.width - sbtW) / 2, scoreBarY + (scoreBarH - sbtH) / 2 + sbtH - 10);
            
            // Draw menu
            gameCtx.font = "300 48px Open Sans";
            goMenuIW = ~~(game.width / 2);
            goMenuIY = scoreBarY + scoreBarH + 50;
            var ii = 0;
            for (var i = 0; i < goMenu.length; i++) {
                ii = (i >= goMenu.length / 2 ? 1 : 0);
                var c = mainColors.red;
                if (i == goMenuSel) {
                    
                    // Draw selected bar
                    c = mainColors.white;
                    gameCtx.fillStyle = mainColors.red;
                    gameCtx.fillRect((i % 2) * goMenuIW, goMenuIY + ii * goMenuIH, goMenuIW, goMenuIH);
                }
                
                // Draw menu text
                var goitW = gameCtx.measureText(goMenu[i]).width;
                var goitH = gameCtx.measureText("M").width;
                gameCtx.fillStyle = c;
                gameCtx.fillText(goMenu[i], (i % 2) * goMenuIW + (goMenuIW - goitW) / 2, goMenuIY + ii * goMenuIH + (goMenuIH - goitH) / 2 + goitH - 5);
            }
            break;
    }
    gameCtx.restore();
}

function drawHeart() {
    // TODO.
}

function initialize() {
    hearts = maxHearts;
    
    // Load images
    images = {};
    var heartImg = new Image();
    var darkHeartImg = new Image();
    heartImg.onload = function() {
        images["heart"] = heartImg;
        darkHeartImg.onload = function() {
            images["heart-dark"] = darkHeartImg;
            
            // Set mainmenu Y already
            mainMenuY = (window.innerHeight - mainMenuItems.length * 100) / 2;
            
            // Images loaded, proceed to draw the menu
            redraw();
        }
        darkHeartImg.src = "img/heart-dark.png";
    }
    heartImg.src = "img/heart.png";
}
window.addEventListener("load", function() {
    redraw();
    initialize();
});