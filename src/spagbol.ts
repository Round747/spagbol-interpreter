
export let allWorkers: Spagbol.Worker[] = [];
export let allNewWorkers: Spagbol.Worker[] = [];

export function SetAllWorkers(array: Spagbol.Worker[]) 
{
    allWorkers = array;
}

export function SetAllNewWorkers(array: Spagbol.Worker[]) 
{
    allNewWorkers = array;
}

export namespace Spagbol {
    

    export class Worker {
        public direction: Direction;
        public position: Vector2;

        public dataValue: number | string; // the actual data stored in the worker
        public booleanValue: boolean | null; // the result of the last boolean expression performed. Consumed upon branch

        public hexColour: string;

        constructor(position: Vector2, direction: Direction, dataValue: number | string = 0) {
            this.position = position;
            this.direction = direction;

            this.dataValue = dataValue; // value is set from constructor only when cloning at a branch
            this.booleanValue = null;

            this.hexColour = "";

            // give it 6 hex digits, with a minimum value of 5
            for(let i = 0; i < 3; i++)
            {
                this.hexColour += (Math.max(5, (Math.round(Math.random() * 15)))).toString(16).repeat(2);
            }
        }
    }

    export class Tile {
        public northPriority: DirectionPriority;
        public eastPriority: DirectionPriority;
        public southPriority: DirectionPriority;
        public westPriority: DirectionPriority;

        public directions: Record<Direction, DirectionPriority>;

        public position: Vector2;

        public workers: Worker[] = [];

        public character: string;

        constructor(priorities: [
            DirectionPriority,
            DirectionPriority,
            DirectionPriority,
            DirectionPriority
        ], position: Vector2, character: string
        ) {
            this.northPriority = priorities[0];
            this.eastPriority = priorities[1];
            this.southPriority = priorities[2];
            this.westPriority = priorities[3];

            this.directions =
            {
                [Direction.North]: this.northPriority,
                [Direction.East]: this.eastPriority,
                [Direction.South]: this.southPriority,
                [Direction.West]: this.westPriority
            };

            this.position = position;
            this.character = character;
        }

        CanMoveOutOf(worker: Worker): boolean {
            let enterDirectionPriority = this.directions[worker.direction];
            if (enterDirectionPriority == DirectionPriority.Must || enterDirectionPriority == DirectionPriority.Can) return true;
            else return false;
        }

        /**
         * Decides if a worker can enter this tile
         * @param fromDirection The direction the worker is facing as it enters the tile
         * @returns wether the worker is allowed to enter the tile
         */
        CanMoveInto(fromDirection: Direction, worker?: Worker): boolean {
            // worker moving north enters a tile from the south, thus the opposite
            let enterDirectionPriority = this.directions[Direction.Opposite(fromDirection)];

            if (enterDirectionPriority == DirectionPriority.Must || enterDirectionPriority == DirectionPriority.Can) return true;
            else return false;
        }

        EnterTile(worker: Worker) {
        }

        LeaveTile(worker: Worker){
        }
    }

    

    // export class DataExpression
    // {
        // lhsTile: ExpressionVariableTile | null;
        // rhsTile: ExpressionVariableTile | null;

        // lhsLiteral: string | number | null;
        // rhsLiteral: string | number | null;

        // // lhsOperand: number | string | Worker;
        // // rhsOperand: number | string | Worker | null;

        // operator: DataOperator | null;

        // constructor(operator: DataOperator | null, lhsTile: ExpressionVariableTile, rhsTile: ExpressionVariableTile | null)
        // {
        //     // this.lhsOperand = lhs;
        //     // this.rhsOperand = rhs;

        //     this.lhsTile = lhsTile;
        //     this.operator = operator;
        //     this.rhsTile = rhsTile;
        // } 

        // EvaluateExpression(): number | string
        // {
        //     if(this.operator != null && this.rhsOperand == null)
        //     {
        //         console.log("missing rhs operand (throw error)");
        //         return "";
        //     }

        //     if(this.operator == null && this.rhsOperand != null)
        //     {
        //         console.log("missing operator(throw error)");
        //         return "";
        //     }

        //     if(this.rhsOperand == null && this.operator == null)
        //     {
        //         return this.lhsOperand instanceof Worker ? (<Worker>this.lhsOperand).dataValue : this.lhsOperand;
        //     }

        //     let lhsValue = this.lhsOperand instanceof Worker ? (<Worker>this.lhsOperand).dataValue : this.lhsOperand;
        //     let rhsValue = this.rhsOperand instanceof Worker ? (<Worker>this.rhsOperand).dataValue : this.rhsOperand;

        //     switch(this.operator)
        //     {
        //         case DataOperator.Addition:
        //             if(typeof lhsValue == "string" || typeof rhsValue == "string")
        //             {
        //                 return lhsValue.toString() + rhsValue!.toString();
        //             }
        //             return lhsValue + rhsValue!;

        //         case DataOperator.Subtraction:
        //             if(typeof lhsValue == "string"|| typeof rhsValue == "string")
        //             {
        //                 console.log("Cant subtract a string (throw error)");    
        //                 return "";
        //             }
        //             return lhsValue - rhsValue!;

        //         case DataOperator.Multiplication:
        //             if(typeof lhsValue == "string"|| typeof rhsValue == "number")
        //             {
        //                 let returnString = "";

        //                 for(let i = 0; i < <number>rhsValue; i++)
        //                 {
        //                     returnString += lhsValue.toString()
        //                 }
        //             }
        //             if(typeof lhsValue == "string" || typeof rhsValue == "string")
        //             {
        //                 console.log("Cant multiply a number by a string (throw error)");    
        //                 return "";
        //             }
        //             return lhsValue * rhsValue!;

        //         case DataOperator.Division:
        //             if(typeof lhsValue == "string"|| typeof rhsValue == "string")
        //             {
        //                 console.log("Cant divide a string (throw error)");    
        //                 return "";
        //             }
        //             return lhsValue / rhsValue!;

        //         default:
        //             console.log("invalid operator (throw error)");
        //             return "";
                    
        //     }
        // }
    // }
}

export enum DirectionPriority {
    Must = 2,
    Can = 1,
    CanNot = 0
}

export enum Direction {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}

export namespace Direction 
{
    export function Opposite(direction: Direction): Direction 
    {
        switch (direction) {
            case Direction.North:
                return Direction.South;
            case Direction.South:
                return Direction.North;
            case Direction.East:
                return Direction.West;
            case Direction.West:
                return Direction.East;
        }
    }

    export function Rotate(direction: Direction, rotation: "left" | "right" | "around"): Direction 
    {
        switch (rotation) {
            case "left":
                return <Direction>((direction - 1) < 0 ? 3 : (direction - 1));
            case "right":
                return <Direction>((direction + 1) > 3 ? 0 : (direction + 1));
            case "around":
                switch (direction) {
                    case Direction.North: return Direction.South;
                    case Direction.South: return Direction.North;
                    case Direction.East: return Direction.West;
                    case Direction.West: return Direction.East;
                }
        }
    }
}

export class Vector2 
{
    x: number;
    y: number;

    constructor(x: number, y: number) 
    {
        this.x = x;
        this.y = y;
    }

    public static Zero(): Vector2
    {
        return new Vector2(0, 0);
    }

    public Relative(direction: Direction): Vector2 
    {
        switch (direction) {
            case Direction.North:
                return new Vector2(this.x, this.y - 1);
            case Direction.South:
                return new Vector2(this.x, this.y + 1);
            case Direction.East:
                return new Vector2(this.x + 1, this.y);
            case Direction.West:
                return new Vector2(this.x - 1, this.y);
        }
    }

    public toString(): string
    {
        return(this.x + ", " + this.y);
    }

    public Subtract(vector: Vector2)
    {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }

    public Add(vector: Vector2): Vector2
    {
        return new Vector2(this.x + vector.x, this.y + vector.y)
    }

    public Equals(vector: Vector2)
    {
        return this.x == vector.x && this.y == vector.y;
    }
}
