// Deprecated (merged with map to make tilemap)

// import { Direction, DirectionPriority, Spagbol, Vector2 } from "./spagbol";
// import { GetTile } from "./map";

// // a line tile that rotates the worker
// export class ForwardSlashCornerTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     // rotate worker, if possible
//     EnterTile(worker: Spagbol.Worker)
//     {
//         switch(worker.direction)
//         {
//             case Direction.North: // north or east
//                 // get the tile to the east of this one. If it can be entered, then rotate the worker, else, stay on course
//                 if(GetTile(worker.position.Relative(Direction.East)).CanMoveInto(Direction.East)) worker.direction = Direction.East;
//                 // else stay facing north
//                 break;
//             case Direction.West: // west or south
//                 if(GetTile(worker.position.Relative(Direction.South)).CanMoveInto(Direction.South)) worker.direction = Direction.South;
//                 break;
//             case Direction.South: // South or west
//                 if(GetTile(worker.position.Relative(Direction.West)).CanMoveInto(Direction.West)) worker.direction = Direction.West;
//                 break;
//             case Direction.East: // east or north
//                 if(GetTile(worker.position.Relative(Direction.North)).CanMoveInto(Direction.North)) worker.direction = Direction.North;
//                 break;
//         }
//     }
// }

// // a line tile that rotates the worker
// export class BackwardSlashCornerTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     // rotate worker, if possible
//     EnterTile(worker: Spagbol.Worker)
//     {
//         switch(worker.direction)
//         {
//             case Direction.North: // north or east
//                 // get the tile to the east of this one. If it can be entered, then rotate the worker, else, stay on course
//                 if(GetTile(worker.position.Relative(Direction.West)).CanMoveInto(Direction.West)) worker.direction = Direction.West;
//                 // else stay facing north
//                 break;
//             case Direction.West: // west or south
//                 if(GetTile(worker.position.Relative(Direction.North)).CanMoveInto(Direction.North)) worker.direction = Direction.North;
//                 break;
//             case Direction.South: // South or west
//                 if(GetTile(worker.position.Relative(Direction.East)).CanMoveInto(Direction.East)) worker.direction = Direction.East;
//                 break;
//             case Direction.East: // east or north
//                 if(GetTile(worker.position.Relative(Direction.South)).CanMoveInto(Direction.South)) worker.direction = Direction.South;
//                 break;
//         }
//     }
// }

// // a line tile
// export class HorizontalLineTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.Can,
//             DirectionPriority.CanNot,
//             DirectionPriority.Can
//         ], position);
//     }
// }

// // a line tile
// export class VerticalLineTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.CanNot,
//             DirectionPriority.Can,
//             DirectionPriority.CanNot
//         ], position);
//     }
// }

// // 4 way intersection, allowing lines to pass over each other
// export class IntersectionTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }
// }

// // a line tile that flips the worker 180 degrees
// export class EndProgramTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     EnterTile(worker: Spagbol.Worker): void {
//         allWorkers = []; // delete all workers, program will stop itself next step
//     }
// }

// // a line tile that increments a workers data value
// export class IncrementDataTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     EnterTile(worker: Spagbol.Worker): void {
//         if(worker.dataValue as string)
//         {
//             // cannot increment a string
//             console.log("Cant increment a string (throw error)");
//             return;
//         }

//         (<number>worker.dataValue)++;

//     }
// }

// // a line tile that decrements a workers data value
// export class DecrementDataTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     EnterTile(worker: Spagbol.Worker): void {
//         if(worker.dataValue as string)
//         {
//             // cannot increment a string
//             console.log("Cant increment a string (throw error)");
//             return;
//         }

//         (<number>worker.dataValue)--;

//     }
// }

// // a line tile that nullifies a workers boolean value
// export class NullifyBooleanTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     EnterTile(worker: Spagbol.Worker): void { worker.booleanValue = null; }
// }

// // a line tile that nullifies a workers boolean value
// export class BranchTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2, facingDirection: Direction)
//     {
//         // cant enter through anywhere
//         let priorities: [
//             DirectionPriority,
//             DirectionPriority,
//             DirectionPriority,
//             DirectionPriority,
//         ] = [DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot
//         ];

//         // can enter through tile specified in constructor
//         priorities[facingDirection] = DirectionPriority.Can;

//         super(priorities, position);
//     }

//     // once you are in through the only allowed direction, you can exit from whichever
//     CanMoveOutOf(fromDirection: Direction): boolean {
//         return true;
//     }

//     EnterTile(worker: Spagbol.Worker): void 
//     {
//         if(worker.booleanValue != null)
//         {
//             // consume boolean value and rotate accordingly

//             if(worker.booleanValue == true) worker.direction = Direction.Rotate(worker.direction, "right");
//             else worker.direction = Direction.Rotate(worker.direction, "left");

//             worker.booleanValue = null;
//             return;
//         }

//         // else duplicate

//         // create a new worker with same position and data, but rotated left
//         let newWorker: Spagbol.Worker = new Spagbol.Worker(worker.position, Direction.Rotate(worker.direction, "left"), worker.dataValue);

//         worker.direction = Direction.Rotate(worker.direction, "right");

//         allWorkers.push(newWorker); // add new worker to global list
//     }
// }

// // end of a line, worker will be terminated here
// export class EndLineTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can,
//             DirectionPriority.Can
//         ], position);
//     }

//     // workers should be terminated before they can leave.
//     CanMoveOutOf(fromDirection: Direction): boolean {
//         console.log("Nothing should be leaving an end point (throw error)");
//         return false;
//     }

//     EnterTile(worker: Spagbol.Worker): void 
//     {
//         // remove worker from allWorkers, preventing any further simulation
//         allWorkers = allWorkers.filter(element => element !== worker); 
//         console.log("removed worker");
        
//     }
// }

// // end of a line, worker will be terminated here
// export class StartTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot
//         ], position);

//     }

//     // workers start here so can leave but not enter
//     CanMoveOutOf(fromDirection: Direction): boolean {
//         return true;
//     }
// }

// // ---------------------------------------

// export class OpeningCurlyBraceTile extends Spagbol.Tile 
// {
//     expression: Expression; //

//     constructor(position: Vector2, expression: Expression)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.Can,
//             DirectionPriority.CanNot,
//             DirectionPriority.Can
//         ], position);

//         this.expression = expression;
//     }
// }

// export class OpeningParenthesisTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.Can,
//             DirectionPriority.CanNot,
//             DirectionPriority.Can
//         ], position);
//     }
// }

// export class OpeningSquareBracketTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot
//         ], position);
//     }
// }

// export class ExpressionVariableTile extends Spagbol.Tile 
// {
//     parentExpression: Spagbol.Expression | null = null;
//     hasWorker: boolean = false;

//     constructor(position: Vector2, priorities: [DirectionPriority,
//         DirectionPriority,
//         DirectionPriority,
//         DirectionPriority
//     ])
//     {
//         super([priorities[0],
//             priorities[1],
//             priorities[2],
//             priorities[3]
//         ], position);
//     }
// }

// export class EmptyTile extends Spagbol.Tile 
// {
//     constructor(position: Vector2)
//     {
//         super([DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot,
//             DirectionPriority.CanNot
//         ], position);
//     }

//     CanMoveInto(): boolean 
//     {
//         console.log("Shouldnt be moving into empty tile (throw error)");
//         return false;
//     }
// }

