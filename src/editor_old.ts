import { cellHeight, cellWidth } from "./program";
import { Vector2 } from "./spagbol";

const textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("input-text-area")!;
const textEditorButton = document.getElementById("text-box-editor")!;
const gridEditorButton = document.getElementById("grid-editor")!;

const workerCanvas = document.getElementById("visualise")!;
const editorCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("editor-canvas")!;
const editorContext = editorCanvas.getContext("2d")!;

textEditorButton.addEventListener("click", SwapToTextEditor);
gridEditorButton.addEventListener("click", SwapToGridEditor);

let isInGridEditor = false;

SwapToGridEditor(); // TODO remove

function SwapToGridEditor()
{
    isInGridEditor = true;
    textArea.style.pointerEvents = "none";
}

function SwapToTextEditor()
{
    isInGridEditor = false;
    textArea.style.pointerEvents = "all";
}

editorCanvas.addEventListener("mousedown", MouseDownCell);
editorCanvas.addEventListener("mouseup", MouseUpCell);
editorCanvas.addEventListener("mousemove", MouseMoveCell);
document.addEventListener("keydown", function(event: KeyboardEvent) {
    if(!isInGridEditor) return;

    if(event.key.length != 1)
    {
        if(event.key == "Backspace")
        {
            selectedCell = new Vector2(selectedCell.x - 1, selectedCell.y);
            ReplaceCharacterAtPosition(selectedCell, " ");
            selectedCell = new Vector2(selectedCell.x - 1, selectedCell.y);
            ClearCanvas();
            DrawRect(selectedCell, selectedCell);
        }

        console.log("pressed special key: " + event.key);
        return;
    }

    ReplaceCharacterAtPosition(selectedCell, event.key);
});

let cursorDownPosition: Vector2 = Vector2.Zero();
let cursorUpPosition: Vector2 = Vector2.Zero();

let selectedCell: Vector2 = Vector2.Zero();

let editorSnapshot: ImageData;
let isHolding = false;
let isDragging = false;

editorContext!.fillStyle = "#ffffff33";

function MouseDownCell(event: MouseEvent)
{
    let mousePosition = CursorToCellPos(event);

    let topLeft: Vector2;
    let bottomRight: Vector2;

    if(cursorDownPosition.x < cursorUpPosition.x && cursorDownPosition.y < cursorUpPosition.y)
    {
        topLeft = cursorDownPosition;
        bottomRight = cursorUpPosition;
    }
    else 
    {
        topLeft = cursorUpPosition;
        bottomRight = cursorDownPosition;
    }

    if(!IsWithinBounds(topLeft, bottomRight, new Vector2(mousePosition.x, mousePosition.y)))
    {
        ClearCanvas();
    }
    else isDragging = true;


    cursorDownPosition = new Vector2(mousePosition.x, mousePosition.y);
    cursorUpPosition = new Vector2(mousePosition.x, mousePosition.y);

    // console.log("clicked cell " + cursorDownPosition.toString());

    editorSnapshot = editorContext.getImageData(0, 0, editorCanvas.width, editorCanvas.height);

    isHolding = true;
}

function MouseMoveCell(event: MouseEvent)
{
    if(!isHolding) return;

    let mousePosition = CursorToCellPos(event);
    cursorUpPosition = new Vector2(mousePosition.x, mousePosition.y);
    
    if(!isDragging)
    {
        editorContext.putImageData(editorSnapshot, 0, 0);
        
        DrawRect(cursorDownPosition, cursorUpPosition);
    }
}   

function MouseUpCell(event: MouseEvent)
{
    let mousePosition  = CursorToCellPos(event);
    cursorUpPosition = new Vector2(mousePosition.x, mousePosition.y);
    
    if(!isDragging)
    {
        editorContext.putImageData(editorSnapshot, 0, 0);
        
        DrawRect(cursorDownPosition, cursorUpPosition);
        
    }
    
    isHolding = false;
    isDragging = false;

    // clicked a single cell (not dragged)
    if(cursorDownPosition.x == cursorUpPosition.x && cursorDownPosition.y == cursorUpPosition.y)
    {
        ClearCanvas();
        DrawRect(cursorDownPosition, cursorUpPosition);

        selectedCell = cursorDownPosition;
    }
}



function CursorToCellPos(event: MouseEvent): Vector2
{
    let rect = editorCanvas.getBoundingClientRect();

    let relativeX = event.pageX - rect.left;
    let relativeY = event.pageY - rect.top;

    let cellX = Math.floor(relativeX / cellWidth);
    let cellY = Math.floor(relativeY / cellHeight);

    return new Vector2(cellX, cellY);
}

function DrawRect(start: Vector2, end: Vector2)
{
    editorContext?.fillRect(
        (start.x  + (end.x >= start.x ? 0 : 1)) * cellWidth, 
        (start.y + (end.y >= start.y ? 0 : 1)) * cellHeight, 
        ((end.x - start.x) + (end.x >= start.x ? 1 : -1)) * cellWidth, 
        ((end.y - start.y) + (end.y >= start.y ? 1 : -1)) * cellHeight
    );
}

function ReplaceCharacterAtPosition(position: Vector2, character: string)
{
    let lines: string[] = textArea.value.split("\n");

    lines[position.y] = lines[position.y].slice(0, position.x) + character + lines[position.y].slice(position.x + 1, lines[position.y].length);

    textArea.value = lines.join("\n");

    selectedCell = new Vector2(selectedCell.x + 1, selectedCell.y);
    ClearCanvas();
    DrawRect(selectedCell, selectedCell);
    cursorDownPosition = new Vector2(selectedCell.x, selectedCell.y);
    cursorUpPosition = new Vector2(selectedCell.x, selectedCell.y);
}

function IsWithinBounds(topLeft: Vector2, bottomRight: Vector2, position: Vector2)
{
    return position.x >= topLeft.x && position.x <= bottomRight.x && 
           position.y >= topLeft.y && position.y <= bottomRight.y;
}

// ----------------------------------------------------

function ClearCanvas()
{
    editorContext.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
}

function FlashCursor()
{
    editorCanvas.style.opacity = editorCanvas.style.opacity == "0%" ? "100%" : "0%";
}
