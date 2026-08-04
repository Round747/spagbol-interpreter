import { Direction, DirectionPriority, SetAllNewWorkers, SetAllWorkers, Spagbol, Vector2, allNewWorkers, allWorkers } from "./spagbol";
import { BooleanOperator, DataOperator, Expression, ExpressionType } from "./expression";
import { OutputError, OutputPrint } from "./program";

export let tileMap: Spagbol.Tile[][] = []; // initialise first column

export let allStartTiles: Spagbol.Tile[] = []; // spots to spawn workers

export function CreateTileMapFromString(input: string)
{
    tileMap = []; // reset tilemap
    allStartTiles = [];

    let lines: string[] = input.split("\n"); 

    for(let i = 0; i < lines.length; i++)
    {
        lines[i] = " " + lines[i] + " ";
    }
    lines = [" ", ...lines, " "]; // pad with top and bottom rows

    for(let y = 0; y < lines.length; y++)
    {
        tileMap[y] = []; // initialise row

        for(let x = 0; x < lines[y].length; x++)
        {
            // run for every character in the input string

            let character: string = lines[y][x];

            switch(character)
            {
                case "(":
                case "[":
                case "{": // assignment expression
                    let type: ExpressionType;
                    if(character == "(") type = ExpressionType.Print;
                    else if(character == "[") type = ExpressionType.Index;
                    else type = ExpressionType.Assignment;

                    let openingPos: Vector2 = new Vector2(x,y); // remember the brace for when the tile is created (the expression is needed in the constructor)
                    x++;

                    let lhs: number | string | Spagbol.Tile | null = null;
                    
                    [lhs, x] = GetOperand(lines, x, y) // get the operand and set the altered x value

                    let operator: DataOperator | BooleanOperator | null = null;

                    // get operator
                    switch(lines[y][x])
                    {
                        case "+":
                            operator = DataOperator.Addition;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "-":
                            operator = DataOperator.Subtraction;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "*":
                            operator = DataOperator.Multiplication;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "/":
                            operator = DataOperator.Division;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "=":
                            operator = BooleanOperator.EqualTo;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "!":
                            operator = BooleanOperator.NotEqualTo;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case ">":
                            operator = BooleanOperator.GreaterThan;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case "<":
                            operator = BooleanOperator.LessThan;
                            tileMap[y][x] = new HorizontalLineTile(new Vector2(x, y), lines[y][x]);
                            x++;
                            break;
                        case ")":
                        case "}": // no operator or rhs, only the single value

                            operator = null;
                            
                            let expression: Expression = new Expression(lhs, null, null, type); // insert gathered values

                            if(lhs instanceof VerticalExpressionVariableTile || lhs instanceof HorizontalExpressionVariableTile) lhs.parentExpression = expression;

                            tileMap[openingPos.y][openingPos.x] = new OpeningCurlyBraceTile(openingPos, expression); // created now to add expression
                            tileMap[y][x] = new ClosingCurlyBraceTile(new Vector2(x,y), expression);


                            continue; // expression finished, continue parsing string
                    }

                    let rhs: number | string | Spagbol.Tile | null = null;
                    [rhs, x] = GetOperand(lines, x, y);

                    let expression: Expression = new Expression(lhs, rhs, operator, type); // insert gathered values

                    tileMap[openingPos.y][openingPos.x] = new OpeningCurlyBraceTile(openingPos, expression); // created now to add expression
                    tileMap[y][x] = new ClosingCurlyBraceTile(new Vector2(x,y), expression);

                    // give the variables their parent expression
                    if(lhs instanceof VerticalExpressionVariableTile || lhs instanceof HorizontalExpressionVariableTile) lhs.parentExpression = expression;
                    if(rhs instanceof VerticalExpressionVariableTile || rhs instanceof HorizontalExpressionVariableTile) rhs.parentExpression = expression;

                    break;
                default:
                    // else create normal singular tile
                    tileMap[y][x] = CreateTileFromCharacter(character, new Vector2(x,y));
            }

            
        }
    }

    DebugPrintTileMap();
}

function GetOperand(lines: string[], x: number, y:number): [number | string | Spagbol.Tile | null, number] // return the operand and the new x value
{
    let operand: number | string | Spagbol.Tile | null = null;

    switch(lines[y][x]) // get lhs
    {   
        case "|": // vertical line var 
            let lhsVariableV = new VerticalExpressionVariableTile(new Vector2(x,y));
            tileMap[y][x] = lhsVariableV; // add tile to map
            operand = lhsVariableV;
            x++;
            break;
        case "-": // horizontal line var or start of negative number literal

            // if character following is a number than the - is a negative sign not a horizontal var
            if(/[0-9]/.test(lines[y][x + 1])) // number literal
            {
                ParseNumber();
                break;
            }

            let lhsVariableH = new HorizontalExpressionVariableTile(new Vector2(x,y));
            tileMap[y][x] = lhsVariableH; // add tile to map
            operand = lhsVariableH;
            x++;
            break;
        case "\"": // string literal
            tileMap[y][x] = new HorizontalLineTile(new Vector2(x,y), lines[y][x]); // opening quote
            let lhsString: string = "";
            x++;

            while(lines[y][x] != "\"")
            {   
                // console.log("character " + lines[y][x]);
                
                tileMap[y][x] = new HorizontalLineTile(new Vector2(x,y), lines[y][x]);
                lhsString += lines[y][x];
                x++;
            }

            tileMap[y][x] = new HorizontalLineTile(new Vector2(x,y), lines[y][x]); // closing quote
            x++;
            console.log("parsed string \"" + lhsString + "\"");
            
            operand = lhsString;
            break;
        case "$": // read line input
            let lhsLineInput = new HorizontalLineTile(new Vector2(x,y), "$");
            tileMap[y][x] = lhsLineInput;
            operand = lhsLineInput;
            x++;
            break;
        default:
            
            if(/[0-9]/.test(lines[y][x])) // number literal
            {
                ParseNumber();
            }
            break;
    }

    return [operand, x];

    function ParseNumber()
    {
        tileMap[y][x] = new HorizontalLineTile(new Vector2(x,y), lines[y][x]);
        let lhsNumberString: string = lines[y][x];
        x++;
        let decimalPoint = false;
        while(/[0-9.]/.test(lines[y][x]))
        {
            if(decimalPoint && lines[y][x] == ".") // found a second one
            {
                OutputError("[Parser]: Invalid number in expression.");
                break;
            }

            if(lines[y][x] == ".") decimalPoint = true;
            lhsNumberString += lines[y][x];
            tileMap[y][x] = new HorizontalLineTile(new Vector2(x,y), lines[y][x]);
            x++
        }

        console.log("parsed number " + lhsNumberString);
        

        let lhsNumber = parseFloat(lhsNumberString);
        operand = lhsNumber;
    }
}

export function CreateTileFromCharacter(char: string, position: Vector2): Spagbol.Tile
{
    switch(char)
    {
        case "/": return new ForwardSlashCornerTile(position);
        case "\\": return new BackwardSlashCornerTile(position);
        case "-": return new HorizontalLineTile(position, "-");
        case "|": return new VerticalLineTile(position, "|");
        case "+": return new IntersectionTile(position);
        case "@": return new EndProgramTile(position);
        case ":": return new IncrementDataTile(position);
        case "~": return new DecrementDataTile(position);
        case "#": return new NullifyBooleanTile(position);
        case "%": return new ConvertToAsciiTile(position);
        case "?": return new CheckTypeTile(position);
        case "<": return new BranchTile(position, Direction.West, "<");
        case ">": return new BranchTile(position, Direction.East, ">");
        case "v": return new BranchTile(position, Direction.South, "v");
        case "^": return new BranchTile(position, Direction.North, "^");
        case "x": return new EndLineTile(position);
        case "\"": return new VerticalSwitchTile(position);
        case "=": return new HorizontalSwitchTile(position);
        case "&": return new ClearConsoleTile(position);
        case "*":
            let tile = new StartTile(position);
            allStartTiles.push(tile);
            return tile;     
        case " ": return new EmptyTile(position);
        default: 
            console.log("[Parser]: Unrecognised character");
            return new EmptyTile(position);
    }
}

export function GetTile(position: Vector2): Spagbol.Tile
{
    if(tileMap[position.y][position.x] == undefined) tileMap[position.y][position.x] = new EmptyTile(position);
    return tileMap[position.y][position.x];
}

// --------------------------------------------------------------

// #region tiles

// probably shouldn't have made each location in the tilemap have it's own instance of a class but it's too late for that now :( 
// RIP your ram if the program is too large

// a line tile that rotates the worker
export class ForwardSlashCornerTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "/");
    }

    // rotate worker, if possible
    EnterTile(worker: Spagbol.Worker)
    {
        switch(worker.direction)
        {
            case Direction.North: // north or east
                // get the tile to the east of this one. If it can be entered, then rotate the worker, else, stay on course
                if(GetTile(worker.position.Relative(Direction.East)).CanMoveInto(Direction.East, worker)) worker.direction = Direction.East;
                // else stay facing north
                break;
            case Direction.West: // west or south
                if(GetTile(worker.position.Relative(Direction.South)).CanMoveInto(Direction.South, worker)) worker.direction = Direction.South;
                break;
            case Direction.South: // South or west
                if(GetTile(worker.position.Relative(Direction.West)).CanMoveInto(Direction.West, worker)) worker.direction = Direction.West;
                break;
            case Direction.East: // east or north
                if(GetTile(worker.position.Relative(Direction.North)).CanMoveInto(Direction.North, worker)) worker.direction = Direction.North;
                break;
        }
    }
}

// a line tile that rotates the worker
export class BackwardSlashCornerTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "\\");
    }

    // rotate worker, if possible
    EnterTile(worker: Spagbol.Worker)
    {
        switch(worker.direction)
        {
            case Direction.North: // north or east
                // get the tile to the east of this one. If it can be entered, then rotate the worker, else, stay on course
                if(GetTile(worker.position.Relative(Direction.West)).CanMoveInto(Direction.West, worker)) worker.direction = Direction.West;
                // else stay facing north
                break;
            case Direction.West: // west or south
                if(GetTile(worker.position.Relative(Direction.North)).CanMoveInto(Direction.North, worker)) worker.direction = Direction.North;
                break;
            case Direction.South: // South or west
                if(GetTile(worker.position.Relative(Direction.East)).CanMoveInto(Direction.East, worker)) worker.direction = Direction.East;
                break;
            case Direction.East: // east or north
                if(GetTile(worker.position.Relative(Direction.South)).CanMoveInto(Direction.South, worker)) worker.direction = Direction.South;
                break;
        }
    }
}

// a line tile
export class HorizontalLineTile extends Spagbol.Tile 
{
    constructor(position: Vector2, character: string)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can
        ], position, character);
    }
}

// a line tile
export class VerticalLineTile extends Spagbol.Tile 
{
    constructor(position: Vector2, character: string)
    {
        super([DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot
        ], position, character);
    }
}

// 4 way intersection, allowing lines to pass over each other
export class IntersectionTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "+");
    }
}

// a line tile that flips the worker 180 degrees
export class EndProgramTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "@");
    }

    EnterTile(worker: Spagbol.Worker): void {
        SetAllWorkers([]); 
        SetAllNewWorkers([]); // delete all workers, program will stop itself next step
    }
}

// a line tile that increments a workers data value
export class IncrementDataTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, ":");
    }

    EnterTile(worker: Spagbol.Worker): void {
        if(typeof worker.dataValue == "string")
        {
            // cannot increment a string
            OutputError("[Interpreter]: Cannot increment a string");
            return;
        }

        (<number>worker.dataValue)++;

    }
}

// a line tile that decrements a workers data value
export class DecrementDataTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "~");
    }

    EnterTile(worker: Spagbol.Worker): void {
        if(typeof worker.dataValue == "string")
        {
            // cannot decrement a string
            OutputError("[Interpreter]: Cannot decrement a string");
            return;
        }

        (<number>worker.dataValue)--;

    }
}

// a line tile that nullifies a workers boolean value
export class NullifyBooleanTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "#");
    }

    EnterTile(worker: Spagbol.Worker): void { worker.booleanValue = null; }
}

// a line tile that wipes the console
export class ClearConsoleTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "&");
    }

    EnterTile(worker: Spagbol.Worker): void { document.getElementById("output")!.innerHTML = "" }
}

// a line tile that nullifies a workers boolean value
export class ConvertToAsciiTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "%");
    }

    EnterTile(worker: Spagbol.Worker): void {
        if(typeof worker.dataValue == "string")
        {
            worker.dataValue = worker.dataValue.charCodeAt(0);
        }
        else 
        {
            if(worker.dataValue < 0) 
            {
                OutputError("[Interpreter]: Ascii index less than zero.");
                return;
            }
            worker.dataValue = String.fromCharCode(worker.dataValue);
        }
    }
}

// a line tile that nullifies a workers boolean value
export class CheckTypeTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "?");
    }

    EnterTile(worker: Spagbol.Worker): void {
        worker.booleanValue = (typeof worker.dataValue == "string");
    }
}

// a line tile that nullifies a workers boolean value
export class BranchTile extends Spagbol.Tile 
{
    constructor(position: Vector2, facingDirection: Direction, character: string)
    {
        // cant enter through anywhere
        let priorities: [
            DirectionPriority,
            DirectionPriority,
            DirectionPriority,
            DirectionPriority,
        ] = [DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot
        ];

        // can enter through tile specified in constructor
        priorities[<number>facingDirection] = DirectionPriority.Can;

        // console.log(priorities[<number>facingDirection]);
        

        super(priorities, position, character);
    }

    // once you are in through the only allowed direction, you can exit from whichever
    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        return true;
    }

    EnterTile(worker: Spagbol.Worker): void 
    {
        if(worker.booleanValue != null)
        {
            // consume boolean value and rotate accordingly

            if(worker.booleanValue == true) worker.direction = Direction.Rotate(worker.direction, "right");
            else worker.direction = Direction.Rotate(worker.direction, "left");

            worker.booleanValue = null;
            return;
        }

        console.log("creating new worker");
        
        // else duplicate

        // create a new worker with same position and data, but rotated left
        let newWorker: Spagbol.Worker = new Spagbol.Worker(worker.position, Direction.Rotate(worker.direction, "left"), worker.dataValue);

        worker.direction = Direction.Rotate(worker.direction, "right");

        allNewWorkers.push(newWorker); // add new worker to global list
    }
}

// end of a line, worker will be terminated here
export class VerticalSwitchTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "\"");
    }

    CanMoveInto(fromDirection: Direction, worker: Spagbol.Worker): boolean {
        if(fromDirection == Direction.East || fromDirection == Direction.West)
        {
            if(GetTile(worker.position).workers[0] != worker) return false; // if not first in queue

            if(this.workers.length == 0 || this.workers.length > 1) return false;
            return this.workers[0].direction == Direction.North || this.workers[0].direction == Direction.South;
        }

        // else north or west

        return this.workers.length == 0;
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        if(worker.direction == Direction.East || worker.direction == Direction.West)
        {   
            return true; // been allowed access, can leave freely
        }

        let otherWorker: Spagbol.Worker[] = this.workers.filter(element => element !== worker); // should only be one other worker on the tile
        if(otherWorker.length == 0) return false;
        return otherWorker[0].direction == Direction.East || otherWorker[0].direction == Direction.West;
    }

}

// end of a line, worker will be terminated here
export class HorizontalSwitchTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "=");
    }

    CanMoveInto(fromDirection: Direction, worker: Spagbol.Worker): boolean {
        if(fromDirection == Direction.North || fromDirection == Direction.South)
        {
            if(GetTile(worker.position).workers[0] != worker) return false; // if not first in queue

            if(this.workers.length == 0 || this.workers.length > 1) return false;
            return this.workers[0].direction == Direction.East || this.workers[0].direction == Direction.West;
        }

        // else north or west

        return this.workers.length == 0;
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        if(worker.direction == Direction.North || worker.direction == Direction.South)
        {   
            return true; // been allowed access, can leave freely
        }

        let otherWorker: Spagbol.Worker[] = this.workers.filter(element => element !== worker); // should only be one other worker on the tile
        if(otherWorker.length == 0) return false;
        return otherWorker[0].direction == Direction.North || otherWorker[0].direction == Direction.South;
    }

}


// end of a line, worker will be terminated here
export class EndLineTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "x");
    }

    // workers should be terminated before they can leave.
    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        OutputError("Nothing should be leaving an end point");
        return false;
    }

    EnterTile(worker: Spagbol.Worker): void 
    {
        // remove worker from allWorkers, preventing any further simulation
        SetAllWorkers(allWorkers.filter(element => element !== worker)); 
        console.log("removed worker with data value of " + worker.dataValue + " and boolean value of " + worker.booleanValue);
        
    }
}

// end of a line, worker will be terminated here
export class StartTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot
        ], position, "*");

    }

    // workers start here so can leave but not enter
    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        return true;
    }
}

// ---------------------------------------

export class OpeningCurlyBraceTile extends Spagbol.Tile 
{
    expression: Expression; //

    constructor(position: Vector2, expression: Expression)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can
        ], position, "{");

        this.expression = expression;
    }

    // TODO change since the owning worker may be inside the expression not waiting
    // Check direction to see if there is a slot for it
    // cant move into expression if another worker is already waiting
    CanMoveInto(fromDirection: Direction, worker: Spagbol.Worker): boolean 
    {
        if(fromDirection == Direction.East)
        {
            return (this.workers.length == 0) && (this.expression.owner == null) && this.expression.resultCalculated == false && GetTile(worker.position).workers[0] == worker;
        }
        else if (fromDirection == Direction.West)
        {
            return true;
        }

        // entering from north or south which isnt allowed
        return false;
    }
    
    EnterTile(worker: Spagbol.Worker): void 
    {
        // if entering expression
        if(worker.direction == Direction.East)
        {
            if(this.expression.owner == null) this.expression.owner = worker;
            this.expression.TryCalculateResult(); // might be only literals or variable workers might already be there
        }
    }

    LeaveTile(worker: Spagbol.Worker): void {

        // if leaving expression from west  
        if(worker.direction == Direction.West) 
        {
            if(this.expression.owner == worker) this.expression.owner = null;

            if(this.expression.resultCalculated) this.expression.resultCalculated = false;
        }
        
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean 
    {
        if(worker.direction == Direction.East)
        {
            return this.expression.resultCalculated || this.expression.HasOpenHorizontalVarSlot();
        }
        else if (worker.direction == Direction.West) return true;

        // coming from north or south which isnt allowed
        return false;
    }
}

export class ClosingCurlyBraceTile extends Spagbol.Tile 
{
    expression: Expression; //

    constructor(position: Vector2, expression: Expression)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can
        ], position, "}");

        this.expression = expression;
    }

    CanMoveInto(fromDirection: Direction): boolean 
    {
        if(fromDirection == Direction.West)
        {
            return (this.workers.length == 0) && (this.expression.owner == null);
        }
        else if (fromDirection == Direction.East)
        {
            return true;
        }

        // entering from north or south which isnt allowed
        return false;
    }
    
    EnterTile(worker: Spagbol.Worker): void 
    {
        // if entering expression
        if(worker.direction == Direction.West)
        {
            if(this.expression.owner == null) this.expression.owner = worker;
            this.expression.TryCalculateResult(); // might be only literals or variable workers might already be there
        }
    }

    LeaveTile(worker: Spagbol.Worker): void {

        // if leaving expression from east
        if(worker.direction == Direction.East) 
        {
            if(this.expression.owner == worker) this.expression.owner = null;

            if(this.expression.resultCalculated) this.expression.resultCalculated = false;
        }
        
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean 
    {
        if(worker.direction == Direction.West)
        {
            return this.expression.resultCalculated || this.expression.HasOpenHorizontalVarSlot();
        }
        else if (worker.direction == Direction.East) return true;

        // coming from north or south which isnt allowed
        return false;
    }
}

export class OpeningParenthesisTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can
        ], position, "(");
    }
}

export class OpeningSquareBracketTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot
        ], position, "[");
    }
}

export class HorizontalExpressionVariableTile extends Spagbol.Tile 
{
    parentExpression: Expression | null = null;

    constructor(position: Vector2)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.Can,
            DirectionPriority.CanNot,
            DirectionPriority.Can
        ], position, "-");
    }

    EnterTile(worker: Spagbol.Worker): void {
        // console.log("trying to calculate result");
        
        if(!this.parentExpression!.resultCalculated) this.parentExpression?.TryCalculateResult();
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        return this.parentExpression!.resultCalculated;
    }
}

export class VerticalExpressionVariableTile extends Spagbol.Tile 
{
    parentExpression: Expression | null = null;

    constructor(position: Vector2)
    {
        super([DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can,
            DirectionPriority.Can
        ], position, "|");
    }

    EnterTile(worker: Spagbol.Worker): void {
        // console.log("trying to calculate result");
        
        if(!this.parentExpression!.resultCalculated) this.parentExpression?.TryCalculateResult();
    }

    CanMoveOutOf(worker: Spagbol.Worker): boolean {
        if(worker.direction == Direction.East || worker.direction == Direction.West) return true;

        return this.parentExpression!.resultCalculated;
    }

    // if there is not worker there and the result hasnt been calculated
    CanMoveInto(fromDirection: Direction): boolean {
        if(fromDirection == Direction.East || fromDirection == Direction.West) return true;

        return (!this.parentExpression!.resultCalculated) && this.workers.length == 0;
    }
}

export class EmptyTile extends Spagbol.Tile 
{
    constructor(position: Vector2)
    {
        super([DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot,
            DirectionPriority.CanNot
        ], position, " ");
    }

    CanMoveInto(): boolean 
    {
        // console.log("Shouldnt be moving into empty tile (throw error)");
        return false;
    }
}

// #endregion

function DebugPrintTileMap()
{
    let result: string = "";

    for(let y = 0; y < tileMap.length; y++)
    {
        for(let x = 0; x < tileMap[y].length; x++)
        {
            if(tileMap[y][x] == undefined) result +="[UNDEFINED]";
            else result += tileMap[y][x].character;
            // result += tileMap[y][x];
        }

        result += "\n";
    }

    console.log(result);
    
}