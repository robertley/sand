import { AutomataCell } from "./automata-cell.class";

export abstract class AutomataLiquid extends AutomataCell {

    direction: 'left' | 'right' | null = null;
    sinkable = true;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata() {

        if (this.canFall) {
            this.fall();
            return;
        }

        let moveCell = null;
        // try left and right
        let emptyCells = [];
        let foundDirectionCell = null;

        if (this.SW_fallable) {
            emptyCells.push(this.SW);
            if (this.direction === 'left') {
                foundDirectionCell = this.SW;
            }
        }
        if (this.SE_fallable) {
            emptyCells.push(this.SE);
            if (this.direction === 'right') {
                foundDirectionCell = this.SE;
            }
        }

        // prioritize bottom left/right over left/right
        if (emptyCells.length === 0) {
            if (this.W_fallable) {
                emptyCells.push(this.W);
                if (this.direction === 'left') {
                    foundDirectionCell = this.W;
                }
            }
            if (this.E_fallable) {
                emptyCells.push(this.E);
                if (this.direction === 'right') {
                    foundDirectionCell = this.E;
                }
            }
        }

        // no empty cells to move into
        if (emptyCells.length === 0) {
            // this.direction == 'left';
            this.sit();
            return; // cannot move
        }

        moveCell = foundDirectionCell ?? emptyCells[Math.floor(Math.random() * emptyCells.length)];

        if (moveCell == null) {
            throw new Error('Water moveCell is null at (' + this.x + ', ' + this.y + ')');
        }

        if (moveCell === this.SW || moveCell === this.W) {
            this.direction = 'left';
        } else if (moveCell === this.SE || moveCell === this.E) {
            this.direction = 'right';
        }

        this.move(moveCell);
    }
}