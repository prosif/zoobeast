const { Game, GameNode, Colors, Shapes, ShapeUtils, Asset } = require('squish-0756');
const COLORS = Colors.COLORS;

class ZooBeasts extends Game {
    static metadata() {
        return {
            squishVersion: '0756'
        }
    }

    constructor() {
        super();

        this.base = new GameNode.Shape({
            shapeType: Shapes.POLYGON,
            coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
            fill: COLORS.WHITE
        });

        this.text = new GameNode.Text({
            textInfo: {
                x: 50,
                y: 50,
                align: 'center',
                size: 3,
                color: COLORS.BLACK,
                text: 'At least 2 players required'
            }
        });

        this.base.addChild(this.text);
        this.currentSession = null;
        this.playerInfo = {};
    }

    handleNewPlayer({ playerId, info: playerInfo }) {
        console.log('player joined! ' + playerId);
        this.playerInfo[playerId] = { playerInfo };
        if (this.currentSession) {
            // do something
        } else {
            const playerCount = Object.keys(this.playerInfo).length;
            if (playerCount > 1) {
                this.startSession();
            }
        }
    }

    startSession() {
        const playerIds = Object.keys(this.playerInfo);
        if (playerIds.length < 2) {
            console.error('nah');
        } else {
            const girlIdIndex = Math.floor(Math.random() * playerIds.length);
            const girlId = playerIds[girlIdIndex];
            this.roundInfo = {
                taps: {},
                girlId: Number(girlId),
                swings: {
                    1: {},
                    2: {},
                    3: {}
                }
            }
            this.renderBoard();
        }
    }

    renderBoard() {

        if (this.roundInfo.swings[1].defeated && this.roundInfo.swings[2].defeated && this.roundInfo.swings[3].defeated) {
            const girlWins = new GameNode.Text({
                textInfo: {
                    x: 50,
                    y: 50,
                    text: `She's outta here!!!`,
                    size: 5,
                    color: COLORS.RED,
                    align: 'center'
                }
            });
            this.base.clearChildren();
            this.base.addChildren(girlWins);
        } else {

            const girlAsset = new GameNode.Asset({
                coordinates2d: ShapeUtils.rectangle(40, 75, 20, 25),
                assetInfo: {
                    'girl': {
                        'pos': {x: 40, y: 75 },
                        'size': {x: 20, y: 25}
                    }
                }
            });

            const girlInfo = new GameNode.Text({
                textInfo: {
                    x: 80,
                    y: 5,
                    size: 2,
                    color: COLORS.BLACK,
                    align: 'center',
                    text: 'You are girl'
                },
                 playerIds: [this.roundInfo.girlId]    
            });

            const swing1 = new GameNode.Asset({
                coordinates2d: ShapeUtils.rectangle(60, 55, 20, 25),
                assetInfo: {
                    'swing': {
                        'pos': {x: 60, y: 55 },
                        'size': {x: 20, y: 25}
                    }
                }
            });

            const swing1Listener = new GameNode.Shape({
                shapeType: Shapes.POLYGON,
                coordinates2d: ShapeUtils.rectangle(60, 55, 20, 25),
                onClick: (playerId) => {
                    console.log('round info');
                    console.log(this.roundInfo);
                    if (this.roundInfo.girlId === playerId) { 
                        this.startSwing(1);
                    }
                }
            });

            const swing2 = new GameNode.Asset({
                coordinates2d: ShapeUtils.rectangle(10, 15, 20, 25),
                assetInfo: {
                    'swing': {
                        'pos': {x: 10, y: 15 },
                        'size': {x: 20, y: 25}
                    }
                }
            });

            const swing2Listener = new GameNode.Shape({
                shapeType: Shapes.POLYGON,
                coordinates2d: ShapeUtils.rectangle(10, 15, 20, 25),
                onClick: (playerId) => {
                    if (this.roundInfo.girlId === playerId) { 
                        this.startSwing(2);
                    }
                }
            });

            const swing3 = new GameNode.Asset({
                coordinates2d: ShapeUtils.rectangle(40, 5, 20, 25),
                assetInfo: {
                    'swing': {
                        'pos': {x: 40, y: 5 },
                        'size': {x: 20, y: 25}
                    }
                }
            });

            const swing3Listener = new GameNode.Shape({
                shapeType: Shapes.POLYGON,
                coordinates2d: ShapeUtils.rectangle(40, 5, 20, 25),
                onClick: (playerId) => {
                    if (this.roundInfo.girlId === playerId) { 
                        this.startSwing(3);
                    }
                }
            });

            this.base.clearChildren();

            this.base.addChildren(girlAsset, girlInfo);

            if (!this.roundInfo.swings[1].defeated) {
                this.base.addChildren(swing1, swing1Listener);
            }

            if (!this.roundInfo.swings[2].defeated) {
                this.base.addChildren(swing2, swing2Listener);
            }

            if (!this.roundInfo.swings[3].defeated) {
                this.base.addChildren(swing3, swing3Listener);
            }
        }
    }

    startSwing(swingId) {
        this.roundInfo.taps = {};
        this.base.clearChildren();
        this.roundInfo.timeLeft = 10;
        this.interval = this.setInterval(() => {

            this.roundInfo.timeLeft = this.roundInfo.timeLeft - 1;

            if (this.roundInfo.timeLeft > 0) {
                this.base.clearChildren([this.beastAsset.node.id, this.beastOverlay.node.id]);

                this.timer = new GameNode.Text({
                    textInfo: {
                        x: 50,
                        y: 5,
                        text: this.roundInfo.timeLeft + '',
                        color: COLORS.BLACK,
                        size: 5,
                        align: 'center'
                    }
                });
                this.base.addChild(this.timer);
            } else {
                clearInterval(this.interval);
                const notGirl = Object.keys(this.playerInfo).filter(k => Number(k) !== this.roundInfo.girlId)[0];
                const girlTaps = this.roundInfo.taps[this.roundInfo.girlId] || 0;
                const notGirlTaps = this.roundInfo.taps[notGirl] || 0;

                const girlTapsText = new GameNode.Text({ 
                    textInfo: {
                        x: 25,
                        y: 25,
                        text: 'Girl: ' + girlTaps,
                        color: COLORS.BLACK,
                        size: 2,
                        align: 'left'
                    }
                });

                const notGirlTapsText = new GameNode.Text({ 
                    textInfo: {
                        x: 75,
                        y: 25,
                        text: 'Not girl: ' + notGirlTaps,
                        color: COLORS.BLACK,
                        size: 2,
                        align: 'left'
                    }
                });

                this.base.addChildren(girlTapsText, notGirlTapsText);

                if (Math.abs(girlTaps - notGirlTaps) < 3) {
                    const girlWins = new GameNode.Text({
                        textInfo: {
                            x: 50,
                            y: 80,
                            text: 'Girl defeated swing',
                            color: COLORS.BLACK,
                            align: 'center',
                            size: 3
                        }
                    });
                    this.base.addChildren(girlWins);
                    this.roundInfo.swings[swingId].defeated = true;
                } else {

                    const girlNotWins = new GameNode.Text({
                        textInfo: {
                            x: 50,
                            y: 80,
                            text: 'Swing defeated girl',
                            color: COLORS.BLACK,
                            align: 'center',
                            size: 3
                        }
                    });
                    this.base.addChildren(girlNotWins);
                }

                this.setTimeout(() => {
                    this.renderBoard();
                }, 3000);

            }
        }, 1000);

        this.timer = new GameNode.Text({
            textInfo: {
                x: 50,
                y: 5,
                text: '10',
                color: COLORS.BLACK,
                size: 5,
                align: 'center'
            }
        });
        this.beastAsset = new GameNode.Asset({
            coordinates2d: ShapeUtils.rectangle(40, 40, 20, 20),
            assetInfo: {
                'beast': {
                    'pos': {x: 40, y: 40},
                    size: {x: 20, y: 20}
                }
            }
        });

        this.beastOverlay = new GameNode.Shape({
            shapeType: Shapes.POLYGON,
            coordinates2d: ShapeUtils.rectangle(40, 40, 20, 20),
            onClick: (playerId) => {
                this.incrementTapCount(playerId);
            }
        });

        this.base.addChildren(this.beastAsset, this.beastOverlay, this.timer);
    }

    incrementTapCount(playerId) {
        if (!this.roundInfo) {
            console.log('nope. wat');
            return;
        }

        const currentCount = this.roundInfo.taps[playerId] || 0;

        this.roundInfo.taps[Number(playerId)] = currentCount + 1;
    }

    handlePlayerDisconnect(playerId) {
        // console.log('player left! they were a ' + this.playerInfo[playerId])
    }

    getAssets() {
        return {
            'girl': new Asset({
                'id': '42bf899e051f293b44d0d0105b3116b2',
                'type': 'image'
            }),
            'beast': new Asset({
                'id': '6378c6cddf9a0c01ba1dd203f8947cbd',
                type: 'image'
            }),
            'swing': new Asset({
                'id': '9842f1f6ddaf9427d007f19ad00f984f',
                type: 'image'
            })
        };
    }

    getLayers() {
        return [{
            root: this.base
        }];
    }
}

module.exports = ZooBeasts;

