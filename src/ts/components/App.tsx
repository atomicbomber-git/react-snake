import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Self-Made Components
import Tile, {Type as TileType} from './Tile';

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;

interface Position {
    x: number,
    y: number
}

// Representation of a tile's state inside App
interface TileState {
    position: Position
}

enum Direction {
    UP, RIGHT, DOWN, LEFT 
}

// Rows containing tiles in a board
interface AppState {
    tiles: TileState[][],
    snakePosition: Position[],
    foodPosition?: Position
    currentDirection: Direction,
    isRunning: boolean,
    points: number,
}

class App extends React.Component<object, AppState> {
    updateIntervalId: number;
    initialState: AppState;

    constructor(props: object) {
        super(props);

        this.initialState = {
            tiles: this.getInitialBoard(),
            snakePosition: [ this.getInitialHeadPosition() ],
            currentDirection: Direction.LEFT,
            isRunning: false,
            foodPosition: null,
            points: 0
        }

        this.state = {...this.initialState};
    }

    private getInitialBoard(): TileState[][] {
        let board: TileState[][] = [];

        for (let i = 0; i < BOARD_WIDTH; i++) {
            let row: TileState[] = [];
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                row.push({ position: {x: j, y: i} });
            }
            board.push(row);
        }

        return board;
    }

    private getInitialHeadPosition(): Position {
        return { x: Math.round(Math.random() * BOARD_WIDTH), y: Math.round(Math.random() * BOARD_HEIGHT)};
    }

    private getFoodPosition = (state = this.state) => {
        let emptyTiles = 
            this.state.tiles.reduce((prev = [], next) => {

                let filteredNext = next.filter((tile) => {
                    let isEmpty = true;

                    state.snakePosition.forEach((position) => {
                        if (position.x === tile.position.x && position.y === tile.position.y) {
                            isEmpty = false;
                            return;
                        }
                    });

                    return isEmpty;
                });

                return [...prev, ...filteredNext];
            });
        
        let foodPositionIndex = Math.round(Math.random() * emptyTiles.length);
        return emptyTiles[foodPositionIndex].position;
    }

    private addPoints() {
        this.setState((prevState) => ({ points: prevState.points + 100 }));
    }

    private renderRow(row, rowId): JSX.Element {
        return (
            <div key={rowId}>
                {row.map((tile, index) => this.renderTile(tile, index))}
            </div>
        );
    }

    private renderTile(tile: TileState, tileId: number): JSX.Element {
        let tileType: TileType = TileType.EMPTY;

        this.state.snakePosition.forEach((position) => {
            if (tile.position.x === position.x && tile.position.y === position.y) {
                tileType = TileType.PLAYER;
                return;
            }
        });
        
        let {foodPosition} = this.state;
        if (foodPosition) {
            if (tile.position.x === foodPosition.x && tile.position.y === foodPosition.y) {
                tileType = TileType.FOOD;
            }
        }
        
        return <Tile type={tileType} key={tileId} />;
    }

    handleKeyPress = (event) => {

        if (event.key === "k") {
            this.setState((prevState) => ({ isRunning: !prevState.isRunning }));
            return;
        }

        if (!this.state.isRunning) {
            this.setState({ isRunning: true });
            
            return;
        }

        let {currentDirection} = this.state;
        switch (event.key) {
            case "ArrowUp":
                if (currentDirection !== Direction.DOWN) {
                    this.setState({ currentDirection: Direction.UP });
                }
                break;
            case "ArrowRight":
                if (currentDirection !== Direction.LEFT) {
                    this.setState({ currentDirection: Direction.RIGHT });
                }
                break;
            case "ArrowDown":
                if (currentDirection !== Direction.UP) {
                    this.setState({ currentDirection: Direction.DOWN });
                }
                break;
            case "ArrowLeft":
                if (currentDirection !== Direction.RIGHT) {
                    this.setState({ currentDirection: Direction.LEFT });
                }
                break;
        }
    }

    gameOver() {
        this.setState((prevState) => ({
            ...this.initialState,
            foodPosition: this.getFoodPosition(prevState),
            isGameOver: true
        }));
    }

    componentDidMount() {
        this.setState({
            foodPosition: this.getFoodPosition()
        });

        this.updateIntervalId = window.setInterval(() => {
            this.updateBoard();
        }, 100);
    }

    updateBoard() {
        if (!this.state.isRunning) {
            return;
        }

        let newHeadPosition = {...this.state.snakePosition[this.state.snakePosition.length - 1]}

        switch (this.state.currentDirection) {
            case Direction.UP:
                newHeadPosition.y--;
                break;
            case Direction.RIGHT:
                newHeadPosition.x++;
                break;
            case Direction.DOWN:
                newHeadPosition.y++;
                break;
            case Direction.LEFT:
                newHeadPosition.x--;
        }

        if (newHeadPosition.x < 0) {
            newHeadPosition.x = BOARD_WIDTH - 1;
        }
        else if (newHeadPosition.x > BOARD_WIDTH - 1) {
            newHeadPosition.x = 0;
        }

        if (newHeadPosition.y < 0) {
            newHeadPosition.y = BOARD_HEIGHT - 1;
        }
        else if (newHeadPosition.y > BOARD_HEIGHT - 1) {
            newHeadPosition.y = 0;
        }

        // Check if the next head position collides with the snake's own body
        let isColliding = false;
        this.state.snakePosition.forEach((position) => {
            if (position.x === newHeadPosition.x && position.y === newHeadPosition.y) {
                isColliding = true;
                return;
            }
        });
        if (isColliding) {
            this.gameOver();
            return;
        }

        let foodPositionUpdate = {}; 

        let newSnakePositions;
        let {foodPosition} = this.state;

        if (newHeadPosition.x === foodPosition.x && newHeadPosition.y === foodPosition.y) {
            newSnakePositions = [...this.state.snakePosition];
            foodPositionUpdate = { foodPosition: this.getFoodPosition() };

            this.addPoints();
        }
        else {
            let currentTailPosition = this.state.snakePosition[0];
            newSnakePositions = this.state.snakePosition.filter((position) => {
                return position.x !== currentTailPosition.x || position.y !== currentTailPosition.y;
            })
        }
        
        this.setState({
            snakePosition: [...newSnakePositions, newHeadPosition],
            ...foodPositionUpdate
        });
    }

    render() {
        return (
            <div style={{ margin: "auto", width: "500px" }} tabIndex={0} onKeyDown={this.handleKeyPress}>
                <h1>
                    Game is {this.state.isRunning ? "Running" : "Paused"}
                </h1>
                <p> Click the board and press the arrow button to play. Press `k` to pause. </p>
                <h1>
                   Points: {this.state.points}
                </h1>
                
                <div>
                    { this.state.tiles.map((row, index) => this.renderRow(row, index)) }
                </div>
            </div>
        );
    }
}

if (document.getElementById("app")) {
    ReactDOM.render(<App/>, document.getElementById("app"));
}