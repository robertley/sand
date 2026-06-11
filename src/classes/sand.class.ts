import { GAME_STATE } from "..";
import { Cell, CellType } from "./cell.class";

export class Sand extends Cell {

    cellType = CellType.SAND;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(x: number, y: number) {
        if (y + 1 >= GAME_STATE.height) {
            this.sit();
            return;
        }; // at bottom edge
    
        if (this.canFall) {
            this.fall();
            return;
        }

        let leftEmpty = this.SE == null ? false : this.SE.fallable;
        let rightEmpty = this.SW == null ? false : this.SW.fallable;
    
        let moveCell;
    
        if (leftEmpty && rightEmpty) {
            // randomly choose left or right
    
            if (Math.random() < 0.5) {
                moveCell = this.SW;
            } else {
                moveCell = this.SE;
            }
    
            if (this.tryFallInHole(moveCell)) {
                return;
            }

            this.move(moveCell);
            return;
        }
    
        if (leftEmpty) {
            moveCell = this.SW;
        } else if (rightEmpty) {
            moveCell = this.SE;
        } else {
            this.sit();
            return; // cannot move
        }
    
        if (this.tryFallInHole(moveCell)) {
            return;
        }
        
        this.move(moveCell);
    }
}