/*global $*/
/*global _*/
//consts
const right = 1;
const left = 2;
const up = 4;
const down = 8;
const downAndRight = 16;
const downAndLeft = 32;
const upAndRight = 64;
const upAndLeft = 128;
const downRight = down | right | downAndRight;
const downLeft = down | left | downAndLeft;
const upRight = up | right | upAndRight;
const upLeft = up | left | upAndLeft;
const upRightDown = up | right | down | upAndRight | downAndRight;
const upLeftDown = up | left | down | upAndLeft | downAndLeft;
const rightUpLeft = right | up | left | upAndRight | upAndLeft;
const rightDownLeft = right | down | left | downAndLeft | downAndRight;
const allRound = up | down | left | right | downAndLeft | downAndRight | upAndRight | upAndLeft;
const dirs = [[1,0,right],[-1,0,left],[0,-1,up],[0,1,down],[1,1,downAndRight],[-1,1,downAndLeft],[1,-1,upAndRight],[-1,-1,upAndLeft]];


//Globals
const SIZE = 19;
let gameboard = $("gameBoard");
let room = [];
let player;
let mobs = {};
let pause = true;
let gameStage = 0;
let playerName = "";
const rememberTxt = ["Are you sure you don't remember?", 
"Try a little Harder.", 
"What letter did it start with?",
"Now you are just playing dumb...",
"You can't be that forgetfull can you?",
"You are supposed to be typing in the box."]
let nameTries = 0;

class Game {
}

//if the class only has tile it is walkble
function isWalkable(i,j) {
    if($(`#${i + "-" + j}`).attr('class') != "tile") 
        return false;
    return true;
}


class Mob {
    static pilar = "Pilar";
    static stone = "Stone";
    static mob = "Mob";
    constructor(i,j,color,type) {
        this.i = i;
        this.j = j;
        this.color = color;
        this.type = type;
        this.class = color + type;
        this.active = false;
        $(`#${i + "-" + j}`).addClass(this.class);
    }
    getDesc() {
        return this.color + " " + this.type;
    }
    activate() {
        $(`#${this.i + "-" + this.j}`).removeClass(this.class);
        this.class = this.color + "Mob";
        $(`#${this.i + "-" + this.j}`).addClass(this.class);
        this.active = true;
        gameStage++;
    }
    removeSelf() {
        $(`#${this.i + "-" + this.j}`).removeClass(this.class);
        delete mobs[this.class]
    }
}

class Player {
    constructor(i,j) {
        //I am sorry I is y j is x and its too late to change it
        this.i = i;
        this.j = j;
        this.facing = [-1,0];
        this.inventory = {};
        $(`#${i + "-" + j}`).addClass("player");
    }
    move(y,x) {
        this.facing = [y,x];
        let i = this.i + y;
        let j = this.j + x;
        //dont walk into walls
        if(!isWalkable(i,j)) {
            return;
        }
        ///$(`#${this.i + "-" + this.j}`).animate() do this later?
        $(`#${this.i + "-" + this.j}`).removeClass("player");
        $(`#${i + "-" + j}`).addClass("player");
        this.i = i;
        this.j = j;
    }
    pickup(mob) {
        showPause(`You picked up a ${mobs[mob].getDesc()}.`);
        this.inventory[mob] = mobs[mob];
        mobs[mob].removeSelf();
    }
    use() {
        let i = this.i + this.facing[0];
        let j = this.j + this.facing[1];
        let target = $(`#${i + "-" + j}`).attr('class');
        if(target.includes("redStone")) {
            this.pickup("redStone");
        } else if(target.includes("blueStone")) {
            this.pickup("blueStone");
        } else if(target.includes("greenStone")) {
            this.pickup("greenStone");
        } else if(target.includes("redPilar")) {
            if(this.inventory["redStone"]) {
                mobs["redPilar"].activate();
            }
        } else if(target.includes("bluePilar")) {
            if(this.inventory["blueStone"]) {
                mobs["bluePilar"].activate();
            }
        } else if(target.includes("greenPilar")) {
            if(this.inventory["greenStone"]) {
                mobs["greenPilar"].activate();
            }
        }
    }
}


//mainish
$(document).ready(function() {
    mapInit();
    init();
    playIntro();
    $(document).keydown(function() {
        //console.log(event.key)
        if(event.key == "Enter") {
            if(gameStage == 0) {
                if($("#name").val() != "") {
                    gameStage++;
                    playerName = $("#name").val().replace(/^\w/, c => c.toUpperCase());
                    $("infoTxt").html(`<p>${playerName}, you feel compeled to awaken your fellow golems</p>`);
                    $("infoTxt").append(`<p>"WASD" to move, "Space" to interact and "Enter" to pause</p>`);
                } else {
                    if(nameTries < rememberTxt.length) {
                        $("infoTxt").append(`<p>${rememberTxt[nameTries++]}</p>`);
                    }
                }
            } else {
                pause = !pause;
                if(pause) {
                    $("info").show();
                    $("infoTxt").html(`<p>${playerName} nothing to see here, continue on your quest.</p>`);
                } else {
                    $("info").hide();
                }
            }
        }
        else if(!pause) {
            if(event.key == "w") player.move(-1, 0);
            else if(event.key == "a") player.move(0, -1);
            else if(event.key == "s") player.move(+1, 0);
            else if(event.key == "d") player.move(0, +1);
            else if(event.key == " ") player.use();
        }
        if(gameStage == 4) {
            showPause("Congratulations you have awoken your friends!!!");
            gameStage++;
        }
        
        //ai move?
    });
});

function gameloop() {
}

function getAround(i,j) {
    //console.log("getting Around");
    let curr = room[i][j];
    let around = 0;
    for (const dir in dirs) {
        //console.log(dirs[dir]);
        let newI = dirs[dir][0] + i;
        let newJ = dirs[dir][1] + j;
        if(newI < 0 || newJ < 0 || newI >= SIZE || newJ >= SIZE) {
            around = around | dirs[dir][2];
            continue;
        }
        if(curr == room[newI][newJ]) {
            around = around | dirs[dir][2];
        }
    }
    console.log(`Tile ${i}, ${j}: ${around}`);
    //see if statements in getImg from mapGen.py
    //if self.desc == "fence":
    if(curr == "w") {
        if (!(around ^ allRound)) {
            if(i == 0 && j == 0) return "TTL";
            if(i == 0 && j == 18) return "TTR";
            return "TTC"; //self.tileArr[17]
        }
        if (around & up) {
            if (around & right) {
                if (around & down) {
                    if (around & left) {
                        if (!(around & upAndRight))
                            return "TR";//self.tileArr[7]
                        if (!(around & upAndLeft))
                            return "BR";//self.tileArr[13]
                        if (!(around & downAndRight))
                            return "TL";//self.tileArr[6]
                        if (!(around & downAndLeft))
                            return "BL";//self.tileArr[12]
                    }
                    return "BC";//self.tileArr[3]
                }
                if (around & left)
                    return "L";//self.tileArr[10]
                return "ITR";//self.tileArr[4]
            }
            if (around & left) {
                if (around & down)
                    return "TC";//self.tileArr[15]
                return "IBR";//self.tileArr[16]
            }
        }
        if (around & down) {
            if (around & right) {
                if (around & left) {
                    return "R";//self.tileArr[8]
                }
                return "ITL";//self.tileArr[2]
            }
            if (around & left) {
                return "IBL";//self.tileArr[14]
            }
        }
    }
    return "C";//self.tileArr[1]
}

function showPause(message) {
    pause = true;
    $("info").show();
    $("infoTxt").html("");
    $("infoTxt").append(`<p>${message}</p>`);
}
function playIntro() {
    gameStage = 0;
    pause = true;
    $("info").show();
    $("infoTxt").html("");
    $("infoTxt").append("<p>You wake up and have in a state of alarm.</p>");
    $("infoTxt").append("<p>You try and remember your name, what is it?</p>");
    $("infoTxt").append('<input text="text" id="name">');
}
function init() {
    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
            let tileClass = "";
            if(room[i][j] == "w") {
                let around = getAround(i,j);
                tileClass += " wall" + around;
            }
            gameboard.append(`<div id="${i}-${j}" class="tile${tileClass}"></div>`);
            if(room[i][j] == "B") {
                let temp = new Mob(i,j,"blue","Pilar");
                mobs["bluePilar"] = temp;
            } else if(room[i][j] == "R") {
                mobs["redPilar"] = new Mob(i,j,"red","Pilar");
            } else if(room[i][j] == "G") {
                mobs["greenPilar"] = new Mob(i,j,"green","Pilar");
            } else if(room[i][j] == "b") {
                mobs["blueStone"] = new Mob(i,j,"blue","Stone");
            } else if(room[i][j] == "r") {
                mobs["redStone"] = new Mob(i,j,"red","Stone");
            } else if(room[i][j] == "g") {
                mobs["greenStone"] = new Mob(i,j,"green","Stone");
            } else if(room[i][j] == "C") { //implement chests later
                mobs[""] = new Mob(i,j,"chest","Closed");
            } else if(room[i][j] == "p") {
                player = new Player(i,j);
            }
        }
    }
}
function mapInit() {
    room.push("wwwwwwwwwwwwwwwwwww");
    room.push("wwwwwwwwwwwwwwwwwww");
    room.push("wBfffffffffffffffRw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wgfffffffffffffffbw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wfffffffffffffffffw");
    room.push("wpfffffffrfffffffGw");
    room.push("wwwwwwwwwwwwwwwwwww");
}
