import { GAME } from "..";
import { AutomataCell } from "./automata-cell.class";
import { Cell } from "./cell.class";

export abstract class AutomataSolid extends AutomataCell {

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata() {

        if (this.canFall) {
            this.fall();
            return;
        }

        let SWempty = this.SW == null ? false : this.SW.fallable;
        let SEempty = this.SE == null ? false : this.SE.fallable;
    
        let moveCell: Cell | null = null;

        if (SWempty && SEempty) {
            // randomly choose left or right
    
            if (Math.random() < 0.5) {
                moveCell = this.SW;
            } else {
                moveCell = this.SE;
            }

            this.move(moveCell as Cell);
            return;
        }
    
        if (SWempty) {
            moveCell = this.SW;
        } else if (SEempty) {
            moveCell = this.SE;
        } else {
            if (this.canSink) {
                this.sinkAutomata();
                return;
            }
            // this.sit();
            return;
        }

        
        if (moveCell == null) {
            console.log('moveCell:', GAME)
            throw Error(`Error in solid automata: moveCell is null`);
        }

        this.move(moveCell as Cell);
    }

    sinkAutomata() {

        let sinkables = [this.S];
        if (this.SW_sinkable) {
            sinkables.push(this.SW);
        }

        if (this.SE_sinkable) {
            sinkables.push(this.SE);
        }

        let sinkCell = sinkables[Math.floor(Math.random() * sinkables.length)];
        this.move(sinkCell as Cell);
    }
}