import { allStartTiles, CreateTileMapFromString, GetTile } from "./tilemap";
import { Spagbol, Direction, allWorkers, SetAllWorkers, allNewWorkers, SetAllNewWorkers } from "./spagbol";

const inputArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("input-text-area")!;

export let isProgramRunning = false;
export let isProgramPaused = false;
export function SetIsProgramRunning(value: boolean) { isProgramRunning = value; }
export function SetIsProgramPaused(value: boolean) { isProgramPaused = value; }
let isRunningInstant = false;

export function InitialiseProgram()
{
    cycles = 0;
    cyclesElement.textContent = cycles.toString();
    ClearConsole();
    CalculateCanvasSize();

    // remove all workers
    SetAllWorkers([]);
    SetAllNewWorkers([]);

    // create new tilemap
    CreateTileMapFromString(inputArea.value);
    // populate with workers
    CreateWorkers();
}

export function RestartProgram()
{
    InitialiseProgram();
    isProgramRunning = false;
    isProgramPaused = false;
    ClearCanvas();
}

export function InstantRunProgram()
{
    isRunningInstant = true;
    if(!isProgramRunning){ InitialiseProgram(); isProgramRunning = true;}

    cycles = 0;
    cyclesElement.textContent = cycles.toString();

    while(allWorkers.length > 0 || allNewWorkers.length > 0)
    {
        StepProgram();
    }

    StopProgram();
    isRunningInstant = false;
}

export function CreateWorkers()
{
    for(const tile of allStartTiles)
    {
        console.log("creating worker at " + tile.position.toString());
        
        let direction = Direction.South;

        console.log(GetTile(tile.position.Relative(direction)));
        
        while(!(GetTile(tile.position.Relative(direction)).CanMoveInto(direction)))
        {
            direction = Direction.Rotate(direction, "left");
            if(direction == Direction.South)
            {
                console.log("No viable start rotation for worker");
                return;
            }
        }

        // create new worker at tile and add to list
        let newWorker: Spagbol.Worker = new Spagbol.Worker(tile.position, direction);
        allWorkers.push(newWorker);
    }
}  

const tickRate = <HTMLInputElement>document.getElementById("tick");
let intervalId: number;

const cyclesElement: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("cycles");
let cycles: number = 0;

export function RunProgram()
{
    console.log(isProgramPaused + ", " + isProgramRunning);
    
    if(isProgramRunning && !isProgramPaused) return;

    if(!isProgramRunning && !isProgramPaused) 
    {
        InitialiseProgram(); 
        isProgramRunning = true;

        cycles = 0;
        cyclesElement.textContent = cycles.toString();
    }

    isProgramPaused = false;

    intervalId = setInterval(StepProgram, (1000 / parseInt(tickRate.value)));
}

export function StepProgram()
{
    cycles++;
    cyclesElement.textContent = cycles.toString();

    if(!isRunningInstant) ClearCanvas();

    if(allWorkers.length == 0)
    {
        StopProgram();
    }

    for(let worker of allWorkers) 
    { 
        // console.log("worker entering tile " + GetTile(worker.position).character);
        
        GetTile(worker.position).EnterTile(worker);
    }

    // add new workers to all workers list, then remove
    SetAllWorkers([...allWorkers, ...allNewWorkers]);
    SetAllNewWorkers([]);

    // re access list because enter tile step may have created or removed workers
    for(let worker of allWorkers)
    {
        
        // if can move out of current tile and into new one, move
        if(GetTile(worker.position).CanMoveOutOf(worker) && 
        GetTile(worker.position.Relative(worker.direction)).CanMoveInto(worker.direction, worker))
        {
            let beforeTile = GetTile(worker.position);
            beforeTile.LeaveTile(worker);
            beforeTile.workers = beforeTile.workers.filter(element => element !== worker) ; // remove this worker form the list
            worker.position = worker.position.Relative(worker.direction); // move worker in its direction
            // console.log("Moved to tile " + GetTile(worker.position.Relative(worker.direction)).character + " at " + worker.position.Relative(worker.direction).toString());
            GetTile(worker.position).workers?.push(worker);
        }

        if(!isRunningInstant) DrawWorkerOnCanvas(worker);
    }
}

export function StopProgram()
{
    clearInterval(intervalId);

    OutputPrint("[Interpreter]: Program stopped.");

    isProgramRunning = false;
    isProgramPaused = false;
}

export function PauseProgram()
{
    isProgramPaused = true;
    clearInterval(intervalId);
}

const output = document.getElementById("output");

export function OutputPrint(message: string)
{
    let newElement = document.createElement("tr");
    newElement.innerHTML = "<td>" + message + "</td";
    output!.appendChild(newElement);
}

export function OutputError(message: string)
{
    let newElement = document.createElement("tr");
    newElement.style.color = "red";
    newElement.innerHTML = "<td>" + message + "</td";
    output!.appendChild(newElement);

    StopProgram();
}

function ClearConsole()
{
    output!.innerHTML = "";
}

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("visualise")!;
const context = canvas.getContext("2d")!;

const cellHeight = 19;
const cellWidth = 8.8;

const colourfulWorkers: HTMLInputElement = <HTMLInputElement>document.getElementById("colourful-workers");

function CalculateCanvasSize()
{
    canvas.width = inputArea.offsetWidth;
    canvas.height = inputArea.offsetHeight;
}

function DrawWorkerOnCanvas(worker: Spagbol.Worker)
{    
    if(colourfulWorkers.checked) context.fillStyle = "#" + worker.hexColour + "aa"
    else context.fillStyle = "#ffffff55";

    context.fillRect((worker.position.x * cellWidth) - cellWidth, (worker.position.y * cellHeight) - cellHeight, cellWidth, cellHeight); // draw to visualiser
}

function ClearCanvas()
{
    context.clearRect(0,0, canvas.width, canvas.height);
}