// Aquesta es la classe principal que encapsula el joc
var IocPuzzle = function () {


    this.gameCanvas = document.getElementById('game-canvas');
    this.gameContext = this.gameCanvas.getContext("2d");

    this.uiManager = new UIManager(this.gameCanvas, this);

    this.gameObjects = [[], [], []]; // Cada array correspon a una capa, sent 0 la primera en dibuixarse i 2 la última


    // Funció amb autocrida
    this.inputController = (function () {
        // The keycodes that will be mapped when a user presses a button.
        // Original code by Doug McInnes
        var KEY_CODES = {
                32: 'space'
            },

            MOUSE_CODES = {
                0: 'button1',
                1: 'button2',
                2: 'button3'
            },

        // Creates the array to hold the KEY_CODES and sets all their values
        // to false. Checking true/flase is the quickest way to check status
        // of a key press and which one was pressed when determining
        // when to move and which direction.
            KEY_STATUS = {},
            MOUSE_STATUS = {},
            MOUSE_LAST_POSITION = {x: 0, y: 0};


        for (var code in KEY_CODES) {
            KEY_STATUS[KEY_CODES[code]] = false;
        }
        /**
         * Sets up the document to listen to onkeydown events (fired when
         * any key on the keyboard is pressed down). When a key is pressed,
         * it sets the appropriate direction to true to let us know which
         * key it was.
         */
        document.onkeydown = function (e) {
            // Firefox and opera use charCode instead of keyCode to
            // return which key was pressed.
            var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
            if (KEY_CODES[keyCode]) {
                e.preventDefault();
                KEY_STATUS[KEY_CODES[keyCode]] = true;
            }
        };
        /**
         * Sets up the document to listen to ownkeyup events (fired when
         * any key on the keyboard is released). When a key is released,
         * it sets teh appropriate direction to false to let us know which
         * key it was.
         */
        document.onkeyup = function (e) {
            var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
            if (KEY_CODES[keyCode]) {
                e.preventDefault();
                KEY_STATUS[KEY_CODES[keyCode]] = false;
            }
        };

        document.onkeydown = function (e) {
            // Firefox and opera use charCode instead of keyCode to
            // return which key was pressed.
            var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
            if (KEY_CODES[keyCode]) {
                e.preventDefault();
                KEY_STATUS[KEY_CODES[keyCode]] = true;
            }
        };

        this.gameCanvas.onmousedown = function (e) {
            MOUSE_STATUS[MOUSE_CODES[e.button]] = true;
            MOUSE_LAST_POSITION.x = e.layerX;
            MOUSE_LAST_POSITION.y = e.layerY;

            e.preventDefault();

            //console.log("MouseDown", MOUSE_LAST_POSITION, e.button);
        };


        this.gameCanvas.onmouseup = function (e) {
            MOUSE_STATUS[MOUSE_CODES[e.button]] = false;
            MOUSE_LAST_POSITION.x = e.layerX;
            MOUSE_LAST_POSITION.y = e.layerY;
            e.preventDefault();

            //console.log("MouseUp", MOUSE_LAST_POSITION);
        };

        this.setMouseButtons = function () {

        };

        // Deshabilita el menú contextual del canvas
        this.gameCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };

        return {
            KEY_CODES: KEY_CODES,
            KEY_STATUS: KEY_STATUS,
            MOUSE_STATUS: MOUSE_STATUS,
            MOUSE_LAST_POSITION: MOUSE_LAST_POSITION

        }
    }).bind(this)();

    var gameLoop = function () {
        window.requestAnimationFrame(gameLoop);

        this.currentScreen.update();

        this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);


        for (var layer = 0; layer < 3; layer++) {
            for (var i = 0; i < this.gameObjects[layer].length; i++) {
                //console.log(this.gameObjects[layer][i]);
                if (this.gameObjects[layer][i].alive) {
                    this.gameObjects[layer][i].update();
                } else {
                    //console.log("Esborrant del array BEFORE:", this.gameObjects[layer].length)
                    this.gameObjects[layer].splice(i, 1);
                    //console.log("Esborrant del array AFTER:", this.gameObjects[layer].length)
                }

            }
        }

    }.bind(this);

    this.start = function () {
        console.log("Start");
        this.loadScreen(new StartScreen(this));
        this.score = 0;
        gameLoop();
    };


    this.loadScreen = function (screen, transition) {
        var game = this;

        if (transition) {
            // Iniciem transició
            this.uiManager.makeTransition(function () {

            })
        } else {
            game.currentScreen = screen;
            screen.active = true;
            screen.start();
        }


    };


    this.restart = function () {
        console.log("Restart");
    }

};


// Classe per gestionar la interficie
var UIManager = function (canvas, game) {
    this.scoreText = document.getElementById('score');
    this.messageText = document.getElementById('messages');
    this.gameCanvas = canvas;
    this.game = game;

    this.update = function () {
        this.scoreText.innerHTML = this.game.score;
    };

    this.showMessage = function (message, time) { // Temps en milisegons
        this.messageText.innerHTML = message;
        this.fadeIn(this.messageText);

        setTimeout(function () {
            this.fadeOut(this.messageText);
        }.bind(this), time);
    };

    this.hideMessage = function () {
        this.fadeIn(this.messageText);
    };

    this.makeTransition = function (callback) {
        this.fadeOut(this.gameCanvas);

        setTimeout(function () {
            this.fadeIn(this.gameCanvas);
            callback();
        }.bind(this), 3000); // la transició dura 3s, la duració del efecte depèn del CSS
    };

    this.fadeIn = function (element) {
        element.style.opacity = 1;
    };

    this.fadeOut = function (element) {
        element.style.opacity = 0;
    };

};


var StartScreen = function (game) {
    this.active = true;

    this.update = function () {
        if (!this.active) {
            return;
        }

        if (game.inputController.MOUSE_STATUS.button1 || game.inputController.KEY_STATUS.space) {
            game.uiManager.showMessage("Començant el joc", 3000);
            game.loadScreen(new GameScreen(game));
            this.active = false;
            this.alive = false;
        }
    };

    this.start = function () {

        console.log("iniciant start screen")

        game.gameObjects = [[], [], []];
        this.alive = true;
    };

};


var GameScreen = function (game) {
    this.active = true;
    this.gameContext = game.gameContext;
    this.movingPieces = 0;
    this.game = game;
    this.fallingPieces = 0;
    this.dirty = [];

    this.update = function () {

        if (!this.active) {
            return;
        }

        switch (this.state) {
            // TODO: Afegir un estat per discernir entre esperar selecció i esperar adjecent
            case this.states.WAITING_FOR_SELECTION:
                this.updateWaitingSelection();
                this.queued = [];
                break;

            case this.states.MOVING_PIECES:
                this.updateMovingPieces();
                break;

            case this.states.FALLING_PIECES:
                this.updateFallingPieces();
                break;
        }

        // Buidem la cua de peces en espera de caure

        this.queued = [];
    };

    this.updateWaitingSelection = function () {

        if (this.fallingPieces > 0) {
            this.state = this.states.FALLING_PIECES;

        } else if (game.inputController.MOUSE_STATUS.button1) {
            this.toggleSelected();
        } else if (game.inputController.KEY_STATUS.space) {
            this.forceCheck();
        }
    }

    this.updateMovingPieces = function () {
        // No fem res, només esperem que acabi el moviment
        if (this.movingPieces <= 0) {
            if (this.fallingPieces > 0) {
                this.state = this.FALLING_PIECES;
            } else {
                this.state = this.WAITING_FOR_SELECTION;
            }
        }
    };


    this.updateFallingPieces = function () {
        //console.log("Falling:" , this.fallingPieces);
        // No fem res, només esperem que acabi el moviment
        if (this.fallingPieces <= 0) {
            //alert("Ja no quedan peces falling");
            this.state = this.states.WAITING_FOR_SELECTION;
            // Comprovem coincidencies
            this.queued = []; // No hi han de haver més en cua
            this.checkDirty();

        }
    };

    this.start = function () {
        console.log("iniciant game screen");
        game.uiManager.fadeIn(game.uiManager.scoreText);
        game.uiManager.fadeIn(game.gameCanvas);

        game.gameObjects = [[], [], []];
        this.board = [];

        this.state = this.states.WAITING_FOR_SELECTION;
        this.alive = true;

        this.queued = [];



        this.selected = null;

        this.respawnBoard();
    };

    this.toggleSelected = function () {

        /////////////////////////////////////////////////////
        //for (var i=0; i<game.gameObjects[1].length; i++) {
        //    var item = game.gameObjects[1][i];
        //    if (item.getGridCoords()) {
        //        var pos = item.getGridCoords();
        //
        //        if (pos.x <0 || pos.y<0) {
        //            console.log(item.getGridCoords());
        //
        //            // Recorrem tota la graella cercant aquest item
        //            for (var x=0; x<9;x++) {
        //                for (var y=0; y<9; y++) {
        //                    if (this.board[x][y] === item) {
        //                        console.log("s'ha trobat a: ", x, y);
        //                        alert("Trobat");
        //                        break;
        //                    }
        //                }
        //            }
        //        }
        //
        //    }
        //}
        //
        //alert("check");


        //////////////////////////////////////////////


        var clickedCoords = this.canvasToGridCoords(game.inputController.MOUSE_LAST_POSITION),
            clicked, selected;


        if (this.selected) {
            // Comprovem si s'ha clicat un adjecent

            //console.log("---------------------------------");

            if (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y) {
                //console.log("Mateixa casella");
                return;
            } else if ((clickedCoords.x === this.selected.x - 1 && clickedCoords.y === this.selected.y)
                || (clickedCoords.x === this.selected.x + 1 && clickedCoords.y === this.selected.y)
                || (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y - 1)
                || (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y + 1)) {

                console.log("es adjecent");

                //// Intercanviem les posicions
                //// TODO: fer el moviment real entre les peces
                //this.board[item2.x][item2.y] = this.selected;
                //this.board[item1.x][item1.y] = aux;


                // TODO Compte! this.selected fa referencia al marcador i no pass al objecte que hi ha sota!
                clicked = this.board[clickedCoords.x][clickedCoords.y];
                //console.log("clicked:", clicked.getGridCoords(), type);
                selected = this.board[this.selected.x][this.selected.y]

                this.switchPosition(selected, clicked);


                var checked = this.checkBoard([selected, clicked]);


                console.log("*****************************************");
                if (checked.length > 0) {

                    console.log("successes:", checked);
                    this.removeChecked(checked);


                } else {
                    // Revertim el canvi de posició
                    //aux = this.board[item2.x][item2.y];
                    //this.board[item2.x][item2.y] = this.board[item1.x][item1.y];
                    //this.board[item1.x][item1.y] = aux;
                    //this.board[item2.x][item2.y].setCoords(item2);
                    //this.board[item1.x][item1.y].setCoords(item1);
                    //

                    //alert("Revert");
                    this.selected.alive = false;
                    this.selected = null;
                    // TODO: No hi ha coincidencies


                    //var index = game.gameObjects[2].indexOf(this.selected);
                    //game.gameObjects[2].splice(index, 1);


                    console.log("No hi ha cap coincidencia, revert");
                    this.switchPosition(clicked, selected);
                }


            } else {
                // No es adjecent, descartem la selecció anterior
                this.selected.alive = false;
                this.selected = null;
                // TODO: eliminar de la llista de gameobjects
                //var index = game.gameObjects[2].indexOf(this.selected);
                //game.gameObjects[2].splice(index, 1);


                console.log("no es adjecent");

            }
            console.log("***************************");

            //console.log("---------------------------------");


            //this.selected.setCoords(clickedCoords); // En qualsevol cas no es redibuixa el mateix


        } else if (!this.selected) {
            console.log("Nou selector");
            this.selected = new Selected(this);
            game.gameObjects[2].push(this.selected);
            this.selected.start(clickedCoords);

        }
    };

    this.removeChecked = function (checked) {
        if (!checked) {
            return;
        }


        for (var i = 0; i < checked.length; i++) {

            for (var x = checked[i].from.x; x <= checked[i].to.x; x++) {
                for (var y = checked[i].from.y; y <= checked[i].to.y; y++) {
                    this.board[x][y].explode();
                }
            }
        }
    };

    this.switchPosition = function (item1, item2) {

        if (!item1 || !item2) {
            console.warn("Un dels objectes no existeix");
            return; // Si algun dels dos no existeix es cancel·la el canvi
        }

        var aux = item2,
            auxGridPosition = item1.getGridCoords(),
            auxPosition = item1.getCoords();

        //console.log("Items switched: BEFORE ", item1.getGridCoords(), item1.type);
        //console.log("Items switched: BEFORE ", item2.getGridCoords(), item2.type);

        item1.x = item2.x;
        item1.y = item2.y;
        this.board[item2.getGridCoords().x][item2.getGridCoords().y] = item1;


        item2.x = auxPosition.x;
        item2.y = auxPosition.y;
        this.board[auxGridPosition.x][auxGridPosition.y] = aux;


        //console.log("Items switched: AFTER ", item1.getGridCoords(), item1.type);
        //console.log("Items switched: AFTER ", item2.getGridCoords(), item2.type);

    };

    // TODO: Per a la superclasse Screen
    this.canvasToGridCoords = function (position) {
        // La mida de les icones es 64x64
        return {
            x: Math.floor(position.x / 64),
            y: Math.floor(position.y / 64)
        }

    };


    this.respawnBoard = function () {
        for (var i = 0; i < 9; i++) {
            this.board[i] = [];
            for (var j = 0; j < 9; j++) {
                this.spawn(j);
            }
        }
    };

    // Comprova totes les casellas
    this.forceCheck = function () {
        console.log("FORCECHECK START");
        console.log(this.game.gameObjects[1]);
        this.checkBoard(this.game.gameObjects[1]); // En aquest layer només hi han les peces del puzzle
        console.log("FORCECHECK END");
    };


    // Recorrem l'array de items per veure si algún te coincidencies
    this.checkBoard = function (items) {
        var success = [];

        for (var i = 0; i < items.length; i++) {

            //if (items[i] && items[i] instanceof PuzzleItem) { // TODO Si no existeix es que es un forat que encara no s'ha emplenat
            if (items[i]) { // TODO Si no existeix es que es un forat que encara no s'ha emplenat
                var maxUp = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 0, y: -1});
                var maxDown = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 0, y: 1});
                var maxLeft = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: -1, y: 0});
                var maxRight = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 1, y: 0});

                console.log("Pel tipus ", items[i].type);
                console.log("maxUp", maxUp);
                console.log("maxDown", maxUp);
                console.log("maxLeft", maxUp);
                console.log("maxRight", maxUp);


                if (maxRight.x - maxLeft.x > 1) {
                    success.push({from: maxLeft, to: maxRight})
                }

                if (maxDown.y - maxUp.y > 1) {
                    success.push({from: maxUp, to: maxDown})
                }
            }

        }

        return success;
    };

    this.searchItemInBoard = function (type, position, direction) {
        var x = position.x,
            y = position.y,
            candidate;

        //console.log(this.board, position, direction);

        // TODO: Comprovar que no hi hagi un error off by 1
        while (x + direction.x >= 0 && x + direction.x < 9 && y + direction.y >= 0 && y + direction.y <9) {
            //console.log("Cercant:", type);
            //console.log("Al taulell a la posición: ", x+direction.x, y+direction.y)
            //    console.log( " hi ha: " , this.board[x + direction.x][y + direction.y].type);

            //console.log(x+direction.x, y+direction.y);
            //console.log(this.board[x+direction.x].length);
            candidate = this.board[x + direction.x][y + direction.y];

            if ( candidate && candidate.type === type) {
                x += direction.x;
                y += direction.y;
            } else {
                console.log ("El tipus trobat a ", x+direction.x, ", ", y+direction.y ," era de tipus ", candidate.type," i cerquem " , type)
                return {x: x, y: y};
            }
        }

        // Si no hi ha cap coincidencia la posició final es la mateixa que la inicial
        return {x: x, y: y};
    };

    this.spawn = function (col) {
        var item = new PuzzleItem(Math.floor(Math.random() * 6), this),
            config;

        if (this.queued[col]) {
            this.queued[col]++
        } else {
            this.queued[col] = 1
        }


        config = {
            x: col,
            y: -this.queued[col] * 2,
            state: PuzzleItem.prototype.states.FALLING
        };

        this.fallingPieces++;

        // En aquest cas no s'afegeix al board, s'afegirà automàticament al aterrar
        game.gameObjects[1].push(item);
        item.start(config);

        //console.log("**************** SPAWN ****************");
    }

    this.checkDirty= function() {
        var checked = this.checkBoard(this.dirty);
        this.removeChecked(checked);

        this.dirty=[];
    }


};

GameScreen.prototype.states = {};
GameScreen.prototype.states.WAITING_FOR_SELECTION = 0;
GameScreen.prototype.states.WAITING_FOR_SELECTION = 0;
GameScreen.prototype.states.MOVING_PIECES = 1;
GameScreen.prototype.states.FALLING_PIECES = 2;

var PuzzleItem = function (type, board) {
    this.type = type;
    this.image = this.imagesRepository[type];
    this.x = 0;
    this.y = 0;
    this.state = this.states.DEFAULT;

    this.update = function () {

        // Comprovem si la peça es dins del board o si hi ha un forat a sota, si es així la peça cau

        // Si no es així i estem caient ens aturem i ens marquem com a dirty

        // Dibuixem la peça

        switch (this.state) {
            case this.states.DEFAULT:
                break;

            case this.states.EXPLODING:
                this.remove();
                return;

            case this.states.FALLING:
                this.updateFalling();

                break;

            default:
                console.warn("l'estat no es vàlid");

        }

        this.draw();

    };

    this.start = function (config) {
        this.x = config.x * 64;
        this.y = config.y * 64;
        this.state = config.state ? config.state : this.states.DEFAULT;
        this.alive = true;

        //console.log("Afegida peça de tipus: ", type, this);
    };

    this.getCoords = function () {
        return {x: this.x, y: this.y}
    };

    this.getGridCoords = function () {
        return {x: Math.floor(this.x / 64), y: Math.floor(this.y / 64)}
    };

    this.draw = function () {
        //console.log("Dibuixant a:",this.x, this.y, this.image);
        // TODO:
        board.gameContext.drawImage(this.image, this.x, this.y, 64, 64);
        //board.gameContext.drawImage(this.image, this.x * 64, this.y * 64, 64, 64);

    };

    this.explode = function () {
        if (this.state === this.states.EXPLODING) {
            return;
        }
        //alert("boom");
        this.state = this.states.EXPLODING;


        // TODO: Afegir states.FALLING a la fitxa superior si no es EXPLODING

        var pos = this.getGridCoords();

        //console.log("BOARD: ", board.board);
        this.cascadeFalling({x: pos.x, y: pos.y});
        //console.log("***** AFEGINT A COL: ", pos.x);
        board.spawn(pos.x);

    };

    this.cascadeFalling = function (pos) {
        var upperSlot;

        for (var i = 0; i <= pos.y; i++) {
            upperSlot = board.board[pos.x][i];
            if (upperSlot
                && upperSlot.alive
                && upperSlot.state === this.states.DEFAULT) {
                //console.log("Canviant a falling:", upperSlot.getGridCoords());
                board.board[pos.x][i] = null;
                board.fallingPieces++;
                upperSlot.state = this.states.FALLING;

                // Eliminem la peça del taulell
                //pos = this.getCoords();
            } else {
                //console.log("No s'a afegit el falling a: ", upperSlot/*, upperSlot.getGridCoords()*/);
                //console.log("Total GameObjects: ", board.game.gameObjects[1].length);
            }

        }


    };


    this.updateFalling = function () {

        var pos = this.getGridCoords(),
            nextSlot = board.board[pos.x][pos.y + 1];

        //console.log("NextSlot:", nextSlot);

        // TODO: comprovar el off by 1
        if (pos.y + 1 >= 9 || (nextSlot && nextSlot.state !== this.states.EXPLODING && nextSlot.alive)) {

            this.state = this.states.DEFAULT;
            //console.log("Aturant el falling");
            board.fallingPieces--;


            // Reafegim la peça al taulell
            pos = this.getGridCoords();

            //console.log(board.board, pos.x);
            board.board[pos.x][pos.y] = this;
            //console.log("board: ", board.board);
            //alert("Reafegint");
            this.y = pos.y * 64; // Ens assegurem que la posició final es la correcta

            // TODO: Afegim una comprovació de éxits

            //var checked = board.checkBoard([this]);
            //board.removeChecked(checked);

            board.dirty.push(this);


        } else {
            //console.log("Caient");
            this.y += 4; // TODO: Magic number, aquest nombre ha estat seleccionat arbitrariament, ha de ser divisor de 64
        }


    };

    this.remove = function () {
        var pos = this.getGridCoords();
        //board.board[pos.x][pos.y].alive = false;
        this.alive = false;

        board.board[pos.x][pos.y] = null;
    };

};

PuzzleItem.prototype.states = {};
PuzzleItem.prototype.states.DEFAULT = 0;
PuzzleItem.prototype.states.EXPLODING = 1;
PuzzleItem.prototype.states.FALLING = 2;

PuzzleItem.prototype.imagesRepository = (function () {
    var images = [], image;

    for (var i = 0; i < 6; i++) {
        image = new Image();
        image.src = 'img/puzzle-piece-' + i + '.png';
        //image.src = 'img/puzzle-piece-0.png';
        images.push(image);
    }

    return images;
})();

var Selected = function (board) {
    this.x = 0;
    this.y = 0;
    //this.image = this.imagesRepository[0];

    this.update = function () {
        // Comprovem si la peça es dins del board o si hi ha un forat a sota, si es així la peça cau

        // Si no es així i estem caient ens aturem i ens marquem com a dirty

        // Dibuixem la peça

        this.draw();

    };

    this.start = function (config) {
        this.setCoords(config);
        this.alive = true;

        try {
            console.log("Seleccionada casella: ", this.x, this.y, " tipus: ", board.board[this.x][this.y].type);
            console.log("Amunt: ", board.board[this.x][this.y-1].type)
            console.log("Avall: ", board.board[this.x][this.y+1].type)
            console.log("Esquerra: ", board.board[this.x-1][this.y].type)
            console.log("Dreta: ", board.board[this.x+1][this.y].type)
        } catch (e) {

        }

    };

    this.draw = function () {
        //console.log("Dibuixant a:",this.x, this.y, this.image);
        board.gameContext.drawImage(this.image, this.x * 64, this.y * 64, 64, 64);

        //console.log("Dibuixant a: ", this.x, this.y);
    };

    this.setCoords = function (coords) {
        this.x = coords.x;
        this.y = coords.y;
    }


};

// TODO: al acabar refactoritzar si es possible, mateix codi a tots els gameobjects dibuixables

Selected.prototype.image = (function () {
    var image = new Image();
    image.src = 'img/selected.png';
    return image;
})();