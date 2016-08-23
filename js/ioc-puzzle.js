var AudioManager = function () {
    this.cache = {
        sounds: {},
        music: {}
    };

    this.currentSong = null;

    this.getSound = function (id) {
        var sounds = this.cache.sounds[id];

        if (sounds.pool[sounds.currentSound].currentTime === 0
            || sounds.pool[sounds.currentSound].ended) {
            sounds.pool[sounds.currentSound].play();
        }
        sounds.currentSound = (sounds.currentSound + 1) % sounds.pool.length;
    };

    this.getMusic = function (id) {
        this.resetMusic(this.currentSong);
        this.cache.music[id].play();
        this.currentSong = id;
    };

    this.resetMusic = function (id) {
        if (!id) {
            return;
        }

        if (!this.cache.music[id].ended) {
            this.cache.music[id].pause();
        }

        if (this.cache.music[id].currentTime > 0) {
            this.cache.music[id].currentTime = 0;
        }

    };

    this.start = function () {
        this.generateSound([
            {
                "id": "pop",
                "path": "POP_Mouth_mono.mp3",
                "volume": 0.5
            },
            {
                "id": "error",
                "path": "UI_Error_Zap_Reverse_stereo.mp3",
                "volume": 0.5
            },
            {
                "id": "combo1",
                "path": "combo-1.mp3",
                "volume": 1
            },
            {
                "id": "combo2",
                "path": "combo-2.mp3",
                "volume": 1
            },
            {
                "id": "combo3",
                "path": "combo-3.mp3",
                "volume": 1
            },
            {
                "id": "combo4",
                "path": "combo-4.mp3",
                "volume": 1
            },

            {
                "id": "combo5",
                "path": "combo-5.mp3",
                "volume": 1
            }
        ]);

        this.generateMusic([
            {
                "id": "main-theme",
                "path": "Batty-McFaddin-slower.mp3",
                "loop": true,
                "volume": 1
            },
            {
                "id": "playing",
                "path": "run-amok.mp3",
                "loop": true,
                "volume": 1
            },
            {
                "id": "game-over",
                "path": "MUSIC_EFFECT_Piano_Negative_stereo.mp3",
                "loop": false,
                "volume": 1
            }
        ]);
    };

    this.generateSound = function (soundsQueue) {
        var pool, poolSize, sound, root = 'assets/audio/';
        for (var i = 0; i < soundsQueue.length; i++) {
            pool = [];
            poolSize = 10; // Nombre màxim de sons identics que es reprodueixen al mateix temps
            for (var j = 0; j < poolSize; j++) {
                //Initialize the sound
                sound = new Audio(root + soundsQueue[i].path);
                sound.volume = soundsQueue[i].volume;
                pool.push(sound);
            }
            this.cache.sounds[soundsQueue[i].id] = {
                currentSound: 0,
                pool: pool,
                volume: soundsQueue[i].volume
            }

        }
    };

    this.generateMusic = function (musicQueue) {
        var sound, root = 'assets/audio/';

        for (var i = 0; i < musicQueue.length; i++) {
            sound = new Audio(root + musicQueue[i].path);
            sound.volume = musicQueue[i].volume;
            sound.loop = musicQueue[i].loop;
            this.cache.music[musicQueue[i].id] = sound;
        }
    };
};

var DownloadManager = function () {
    this.successCount = 0;
    this.errorCount = 0;
    this.downloadQueue = [];
    this.cache = {
        images: {}
    };

    this.queueDownload = function (imageData) {
        if (Array.isArray(imageData)) {
            for (var i = 0; i < imageData.length; i++) {
                this.downloadQueue.push(imageData[i]);
            }
        } else {
            this.downloadQueue.push(imageData);
        }

    };

    this.downloadAll = function (callback, args) {
        var root = 'assets/img/';

        // Primer descarreguem les imatges
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var path = this.downloadQueue[i].path,
                id = this.downloadQueue[i].id,
                img = new Image();

            img.addEventListener("load", function () {
                this.successCount += 1;

                if (this.isDone()) {
                    callback(args);
                }
            }.bind(this), false);
            img.addEventListener("error", function () {
                this.errorCount += 1;

                if (this.isDone()) {
                    callback(args);
                }
            }.bind(this), false);

            img.src = root + path;
            this.cache.images[id] = img;
        }
    };

    this.isDone = function () {
        return (this.downloadQueue.length == this.successCount + this.errorCount);
    };

    this.getImage = function (id) {
        return this.cache.images[id];
    };
};

var UIManager = function (canvas, game) {
    this.uiPanel = document.getElementById('ui');
    this.scoreText = document.getElementById('score');
    this.timeText = document.getElementById('time');
    this.recordText = document.getElementById('record');
    this.comboText = document.getElementById('combo');
    this.messageText = document.getElementById('messages');
    this.gameCanvas = canvas;


    this.update = function () {
        this.scoreText.innerHTML = "SCORE: <pan>" + game.currentScreen.score + "</span>";
        this.recordText.innerHTML = "HI-SCORE: <pan>" + game.record + "</span>";

        var time = Math.max(game.currentScreen.timer ? PuzzleItem.prototype.TIME
        - game.currentScreen.timer.getElapsedSeconds() : PuzzleItem.prototype.TIME, 0);

        //this.timeText.innerHTML = "TIME: <pan>" + time + "</span>";
        this.timeText.innerHTML = time;
    };

    this.showMessage = function (message, time) { // Temps en milisegons
        this.messageText.innerHTML = message;
        this.fadeIn(this.messageText);

        setTimeout(function () {
            this.fadeOut(this.messageText);
        }.bind(this), time);
    };

    this.showCombo = function (number) { // Temps en milisegons
        var message, cacheClass;

        if (number < 4) {
            message = "Molt be!";
            game.audioManager.getSound('combo1');
        } else if (number < 6) {
            message = "Així es fa!";
            game.audioManager.getSound('combo2');
        } else if (number < 9) {
            message = "Increïble!!";
            game.audioManager.getSound('combo3');
        } else if (number < 12) {
            message = "Al·lucinnat!!";
            game.audioManager.getSound('combo4');
        } else {
            message = "L'estàs petant!!!";
            game.audioManager.getSound('combo5');
        }

        cacheClass = this.comboText.className.replace('zoom', '');

        this.comboText.className += " zoom";
        this.comboText.innerHTML = message;
        this.fadeIn(this.comboText);
        this.update();

        setTimeout(function () {
            this.fadeOut(this.comboText);
            this.comboText.className = cacheClass;
        }.bind(this), 750);
    };

    this.makeTransition = function (callback) {
        this.fadeOut(this.gameCanvas);

        setTimeout(function () {
            this.fadeIn(this.gameCanvas);
            callback();
        }.bind(this), 1000); // la transició dura 1s, la duració del efecte depèn del CSS
    };

    this.fadeIn = function (element) {
        element.style.opacity = 1;
    };

    this.fadeOut = function (element) {
        element.style.opacity = 0;

    };

};

var LoadingScreen = function (game) {
    this.active = true;
    this.game = game;

    this.update = function () {

        if (!this.active) {
            return;
        }

        this.draw();
    };

    this.draw = function () {
        game.gameContext.font = "48px sans-serif";
        game.gameContext.textAlign = "center";
        game.gameContext.textBaseline = "middle";

        game.gameContext.fillText("Carregant...", game.gameCanvas.width / 2, game.gameCanvas.height / 2);
    };


    this.start = function () {
        game.uiManager.fadeIn(game.gameCanvas);

        game.downloadManager.queueDownload(IocPuzzle.prototype.imageRepository);
        game.downloadManager.downloadAll(function () {
            game.loadScreen(new StartScreen(game));
            this.active = false;
        }.bind(this));

    };
};

var StartScreen = function (game) {
    this.active = true;
    this.game = game;

    this.update = function () {

        if (!this.active) {
            return;
        }

        if (game.inputController.MOUSE_STATUS.button1 || game.inputController.KEY_STATUS.space) {
            game.uiManager.showMessage("Començant el joc", 3000);
            game.loadScreen(new GameScreen(game));
            this.active = false;
        }

        this.draw();
    };

    this.start = function () {
        game.uiManager.fadeIn(game.gameCanvas);
        game.clearGameObjects();
        this.game.audioManager.getMusic('main-theme');

        this.image = game.downloadManager.getImage('game-start');
    };

    this.draw = function () {
        game.gameContext.drawImage(this.image, 0, 0);
    };
};

var GameScreen = function (game) {
    this.active = true;
    this.gameContext = game.gameContext;
    this.movingPieces = 0;
    this.game = game;
    this.fallingPieces = 0;
    this.dirty = [];
    this.exploded = 0;
    this.score = 0;
    this.timer = null;

    this.update = function () {

        if (!this.active) {
            return;
        }

        this.checkScore();
        game.uiManager.update();


        switch (this.state) {
            // TODO: Afegir un estat per discernir entre esperar selecció i esperar adjecent
            case this.states.WAITING_FOR_SELECTION:
                this.updateWaitingSelection();
                this.queued = [];
                //alert("Waiting");
                break;

            case this.states.MOVING_PIECES:
                this.updateMovingPieces();
                break;

            case this.states.FALLING_PIECES:
                this.updateFallingPieces();
                break;

            case this.states.GAME_OVER:
                this.updateGameOver();
                break;
        }

        this.queued = [];
    };

    this.checkScore = function () {
        if (this.exploded > 0) {
            this.game.uiManager.showCombo(this.exploded);
            this.score += 100 * (Math.pow(this.exploded, 2));
            this.exploded = 0;
        }

    };

    this.updateGameOver = function () {

        if (this.score > game.record) {
            game.record = this.score;
        }

        game.loadScreen(new GameOverScreen(game), true);
        game.uiManager.fadeOut(game.uiManager.uiPanel);
        this.active = false;
        this.alive = false;
    };

    this.updateWaitingSelection = function () {
        if (this.fallingPieces > 0) {
            this.state = this.states.FALLING_PIECES;
            return;

        } else if (this.timer && this.timer.getElapsedSeconds() >= PuzzleItem.prototype.TIME) {
            this.state = this.states.GAME_OVER;

        } else if (game.inputController.MOUSE_STATUS.button1) {
            this.toggleSelected();

        }

        // S'inicialitza el timer una vegada han acabat d'explotar les peces
        if (!this.timer) {
            this.timer = new Timer();
        }
    };

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
        // No fem res, només esperem que acabi el moviment
        if (this.fallingPieces <= 0) {
            this.state = this.states.WAITING_FOR_SELECTION;
            // Comprovem coincidencies
            this.queued = [];
            this.checkDirty();
        }
    };

    // TODO: Repassar quins dels que hi ha al principi poden eliminar-se per aquests
    this.start = function () {
        game.uiManager.fadeIn(game.gameCanvas);
        game.uiManager.fadeIn(game.uiManager.uiPanel);
        game.clearGameObjects();

        this.board = [];
        this.state = this.states.WAITING_FOR_SELECTION;
        this.alive = true;
        this.queued = [];
        this.exploded = 0;
        this.selected = null;
        this.timer = null;

        this.respawnBoard();
        this.game.audioManager.getMusic('playing');
    };

    this.toggleSelected = function () {

        var clickedCoords = this.canvasToGridCoords(game.inputController.MOUSE_LAST_POSITION),
            clicked, selected;


        if (this.selected) {
            // Comprovem si s'ha clicat un adjecent

            if (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y) {
                // Es la mateixa casella, no cal fer res
                return;

            } else if ((clickedCoords.x === this.selected.x - 1 && clickedCoords.y === this.selected.y)
                || (clickedCoords.x === this.selected.x + 1 && clickedCoords.y === this.selected.y)
                || (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y - 1)
                || (clickedCoords.x === this.selected.x && clickedCoords.y === this.selected.y + 1)) {

                // TODO Compte! this.selected fa referencia al marcador i no pass al objecte que hi ha sota!
                clicked = this.board[clickedCoords.x][clickedCoords.y];
                selected = this.board[this.selected.x][this.selected.y]

                this.switchPosition(selected, clicked);

                var checked = this.checkBoard([selected, clicked]);

                if (checked.length > 0) {
                    this.removeChecked(checked);


                } else {
                    this.selected.alive = false;
                    this.selected = null;
                    this.game.audioManager.getSound('error');
                    this.switchPosition(clicked, selected);
                }

            } else {
                // No es adjecent, es descarta la selecció anterior
                this.selected.alive = false;
                this.selected = null;
            }

        } else if (!this.selected) {
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
                    if (this.board[x][y]) {
                        this.board[x][y].explode();
                    }
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

    };

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


    // Recorrem l'array de items per veure si algún te coincidencies
    this.checkBoard = function (items) {
        var success = [];

        for (var i = 0; i < items.length; i++) {

            if (items[i]) {
                var maxUp = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 0, y: -1});
                var maxDown = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 0, y: 1});
                var maxLeft = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: -1, y: 0});
                var maxRight = this.searchItemInBoard(items[i].type, items[i].getGridCoords(), {x: 1, y: 0});

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

        while (x + direction.x >= 0 && x + direction.x < 9 && y + direction.y >= 0 && y + direction.y < 9) {
            candidate = this.board[x + direction.x][y + direction.y];

            if (candidate && candidate.type === type) {
                x += direction.x;
                y += direction.y;
            } else {
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

        game.gameObjects[1].push(item);
        item.start(config);
    };

    this.checkDirty = function () {
        var checked = this.checkBoard(this.dirty);
        this.dirty = [];
        this.removeChecked(checked);
    }
};
GameScreen.prototype.states = {};
GameScreen.prototype.states.WAITING_FOR_SELECTION = 0;
GameScreen.prototype.states.MOVING_PIECES = 1;
GameScreen.prototype.states.FALLING_PIECES = 2;
GameScreen.prototype.states.GAME_OVER = 3;

var GameOverScreen = function (game) {
    this.active = true;
    this.game = game;

    this.update = function () {
        if (!this.active) {
            return;
        }

        if (game.inputController.MOUSE_STATUS.button1 || game.inputController.KEY_STATUS.space) {
            game.loadScreen(new StartScreen(game), true);
        }

        this.draw();
    };

    this.draw = function () {
        game.gameContext.drawImage(this.image, 0, 0);
    };

    this.start = function () {
        game.clearGameObjects();
        this.image = game.downloadManager.getImage('game-over');
        this.game.audioManager.getMusic('game-over');
    };
};

var PuzzleItem = function (type, board) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.state = this.states.DEFAULT;

    this.update = function () {

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
        this.image = board.game.downloadManager.getImage('piece-' + this.type);
    };

    this.getCoords = function () {
        return {x: this.x, y: this.y}
    };

    this.getGridCoords = function () {
        return {x: Math.floor(this.x / 64), y: Math.floor(this.y / 64)}
    };

    this.draw = function () {
        board.gameContext.drawImage(this.image, this.x, this.y, 64, 64);
    };

    this.explode = function () {
        if (this.state === this.states.EXPLODING) {
            return;
        }
        this.state = this.states.EXPLODING;

        var pos = this.getGridCoords();
        this.cascadeFalling({x: pos.x, y: pos.y});
        board.spawn(pos.x);
    };

    this.cascadeFalling = function (pos) {
        var upperSlot;

        for (var i = 0; i <= pos.y; i++) {
            upperSlot = board.board[pos.x][i];
            if (upperSlot
                && upperSlot.alive
                && upperSlot.state === this.states.DEFAULT) {
                board.board[pos.x][i] = null;
                board.fallingPieces++;
                upperSlot.state = this.states.FALLING;
            }
        }
    };

    this.updateFalling = function () {

        var pos = this.getGridCoords(),
            nextSlot = board.board[pos.x][pos.y + 1];

        if (pos.y + 1 >= 9 || (nextSlot && nextSlot.state !== this.states.EXPLODING && nextSlot.alive)) {
            this.state = this.states.DEFAULT;
            board.fallingPieces--;
            pos = this.getGridCoords();
            board.board[pos.x][pos.y] = this;
            this.y = pos.y * 64; // Ens assegurem que la posició final es la correcta
            board.dirty.push(this); // S'afegeix la peça a la llista de comprovacions

        } else {
            this.y += PuzzleItem.prototype.FALLING_SPEED;
        }

    };

    this.remove = function () {
        var pos = this.getGridCoords();
        //board.board[pos.x][pos.y].alive = false;
        this.alive = false;

        board.exploded++;

        board.board[pos.x][pos.y] = null;

        board.game.audioManager.getSound('pop');
    };

};
PuzzleItem.prototype.states = {};
PuzzleItem.prototype.states.DEFAULT = 0;
PuzzleItem.prototype.states.EXPLODING = 1;
PuzzleItem.prototype.states.FALLING = 2;
PuzzleItem.prototype.TIME = 60;
PuzzleItem.prototype.FALLING_SPEED = 6; // Ha de ser divisor de 64

var Selected = function (board) {
    this.x = 0;
    this.y = 0;

    this.update = function () {
        this.draw();

    };

    this.start = function (config) {
        this.setCoords(config);
        this.alive = true;
        this.image = board.game.downloadManager.getImage('selected');

    };

    this.draw = function () {
        board.gameContext.drawImage(this.image, this.x * 64, this.y * 64, 64, 64);
    };

    this.setCoords = function (coords) {
        this.x = coords.x;
        this.y = coords.y;
    }
};

var Timer = function () {
    this.creationTime = Date.now();
    this.getElapsedSeconds = function () {
        return Math.round((Date.now() - this.creationTime) / 1000);
    }
};

var IocPuzzle = function () {

    this.gameCanvas = document.getElementById('game-canvas');
    this.gameContext = this.gameCanvas.getContext("2d");
    this.uiManager = new UIManager(this.gameCanvas, this);
    this.gameObjects = [[], [], []]; // Cada array correspon a una capa, sent 0 la primera en dibuixarse i 2 la última
    this.record = 0;
    this.audioManager = new AudioManager();
    this.downloadManager = new DownloadManager();

    // Funció amb autocrida
    this.inputController = (function () {
        // Original code by Doug McInnes
        var KEY_CODES = {
                32: 'space'
            },

            MOUSE_CODES = {
                0: 'button1',
                1: 'button2',
                2: 'button3'
            },

            KEY_STATUS = {},
            MOUSE_STATUS = {},
            MOUSE_LAST_POSITION = {x: 0, y: 0};


        for (var code in KEY_CODES) {
            KEY_STATUS[KEY_CODES[code]] = false;
        }

        document.onkeydown = function (e) {
            var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
            if (KEY_CODES[keyCode]) {
                e.preventDefault();
                KEY_STATUS[KEY_CODES[keyCode]] = true;
            }
        };

        document.onkeyup = function (e) {
            var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
            if (KEY_CODES[keyCode]) {
                e.preventDefault();
                KEY_STATUS[KEY_CODES[keyCode]] = false;
            }
        };

        document.onkeydown = function (e) {
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
        };

        this.gameCanvas.onmouseup = function (e) {
            MOUSE_STATUS[MOUSE_CODES[e.button]] = false;
            MOUSE_LAST_POSITION.x = e.layerX;
            MOUSE_LAST_POSITION.y = e.layerY;
            e.preventDefault();
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
        this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.currentScreen.update();

        for (var layer = 0; layer < 3; layer++) {
            for (var i = 0; i < this.gameObjects[layer].length; i++) {
                if (this.gameObjects[layer][i].alive) {
                    this.gameObjects[layer][i].update();
                } else {
                    this.gameObjects[layer].splice(i, 1);
                }
            }
        }
    }.bind(this);

    this.start = function () {
        this.audioManager.start();
        this.loadScreen(new LoadingScreen(this));

        gameLoop();
    };

    this.loadScreen = function (screen, transition) {
        var game = this;

        if (transition) {
            this.uiManager.makeTransition(function () {
                this.loadScreen(screen);
            }.bind(this))
        } else {
            game.currentScreen = screen;
            screen.active = true;
            screen.start();
        }
    };

    this.clearGameObjects = function () {
        this.gameObjects = [[], [], []]; // Cada array correspon a una capa, sent 0 la primera en dibuixarse i 2 la última
    }
};
IocPuzzle.prototype.imageRepository = [
    {
        "id": "selected",
        "path": "selected.png"
    },
    {
        "id": "piece-0",
        "path": "puzzle-piece-0.png"
    },
    {
        "id": "piece-1",
        "path": "puzzle-piece-1.png"
    },
    {
        "id": "piece-2",
        "path": "puzzle-piece-2.png"
    },
    {
        "id": "piece-3",
        "path": "puzzle-piece-3.png"
    },
    {
        "id": "piece-4",
        "path": "puzzle-piece-4.png"
    },
    {
        "id": "piece-5",
        "path": "puzzle-piece-5.png"
    },
    {
        "id": "game-start",
        "path": "start-game.png"
    },
    {
        "id": "game-over",
        "path": "game-over.png"
    }
];
