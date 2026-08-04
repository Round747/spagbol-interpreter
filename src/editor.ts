import { cellHeight, cellWidth } from "./program";
import { Direction, Vector2 } from "./spagbol";

const textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("input-text-area")!;
const textEditorButton = document.getElementById("text-box-editor")!;
const gridEditorButton = document.getElementById("grid-editor")!;
const cellGridButton: HTMLInputElement = <HTMLInputElement>document.getElementById("cell-grid")!;
const cellGridOverlay = document.getElementById("cell-grid-overlay")!;

const workerCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("visualise")!;
const editorCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("editor-canvas")!;
const editorContext = editorCanvas.getContext("2d")!;

textEditorButton.addEventListener("click", SwapToTextEditor);
gridEditorButton.addEventListener("click", SwapToGridEditor);
cellGridButton.addEventListener("click", function(){
    cellGridOverlay.hidden = !cellGridButton.checked;
});

// every 3 minutes
setInterval(function(){
    localStorage.setItem("input-box-backup", textArea.value);
}, 180000);

const editorCanvasComputedStyles: CSSStyleProperties = window.getComputedStyle(editorCanvas);
const workerCanvasComputedStyles: CSSStyleProperties = window.getComputedStyle(workerCanvas);

let isInGridEditor = false;

let lastUsedDirection: Direction = Direction.East;
let usingBackSpace = false;

let isFocused = true;

document.addEventListener("click", function(event: MouseEvent) {  
    isFocused = event.target == editorCanvas && isInGridEditor;    
});


SwapToGridEditor(); // TODO remove

function SwapToGridEditor()
{
    isInGridEditor = true;
    // textArea.style.pointerEvents = "none";
    textArea.style.userSelect = "none";
    editorCanvas.style.pointerEvents = "all";
    gridEditorButton.classList.add("selected");
    textEditorButton.classList.remove("selected");

    editorCanvas.hidden = false;
    isFocused = true;
}

function SwapToTextEditor()
{
    isInGridEditor = false;
    // textArea.style.pointerEvents = "all";
    textArea.style.userSelect = "all";
    editorCanvas.style.pointerEvents = "none";
    textEditorButton.classList.add("selected");
    gridEditorButton.classList.remove("selected");

    editorCanvas.hidden = true;
    isFocused = false;
}

editorCanvas.addEventListener("mousedown", MouseDownCell);
editorCanvas.addEventListener("mouseup", MouseUpCell);
editorCanvas.addEventListener("mousemove", MouseMoveCell);
document.addEventListener("keyup", function(event: KeyboardEvent) {
    if(event.key == "Control") isControlKeyDown = false;
});
document.addEventListener("keydown", KeyPressEvent);

textArea.addEventListener('beforeinput', e => {
  if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
    e.preventDefault();
    console.log('undo/redo prevented');
  }
}, { capture: true });

function KeyPressEvent(event: KeyboardEvent)
{

    if(!isInGridEditor || !isFocused)
    {
        return;
    }

    let topLeft = GetTopLeft(selectStartPosition, selectEndPosition);

    if(event.key.length != 1)
    {
        switch(event.key)
        {
            case "Backspace":
                
                let offset = getDirectionOffset(event.key);
                ReplaceCharacterAtPosition(topLeft.Subtract(offset), " ");
                DrawSelection(topLeft.Subtract(offset), topLeft.Subtract(offset));
                
                if(cursorFlashIntervalID != null) clearInterval(cursorFlashIntervalID);
                cursorFlashIntervalID = setInterval(() => {
                    FlashCursor();
                }, 500);
                event.preventDefault();
                break;
            case "ArrowLeft":
                MoveSelection(new Vector2(-1,0));
                event.preventDefault();
                lastUsedDirection = Direction.West;
                usingBackSpace = false;
                break;
            case "ArrowRight":
                MoveSelection(new Vector2(1,0));
                event.preventDefault();
                lastUsedDirection = Direction.East;
                usingBackSpace = false;
                break;
            case "ArrowUp":
                MoveSelection(new Vector2(0,-1));
                event.preventDefault();
                lastUsedDirection = Direction.North;
                usingBackSpace = false;
                break;
            case "ArrowDown":
                MoveSelection(new Vector2(0,1));
                event.preventDefault();
                lastUsedDirection = Direction.South;
                usingBackSpace = false;
                break;
            case "Control":
                isControlKeyDown = true;
                usingBackSpace = false;
                break;
        }

        console.log("pressed special key: " + event.key);
        return;
    }

    if(event.key == "z" && isControlKeyDown)
    {
        UndoFromStack();
        console.log("undo");
        return;       
    }
    else if (event.key == "Z" && isControlKeyDown)
    {
        RedoFromStack();
        console.log("redo");
        return;
    }

    ReplaceCharacterAtPosition(topLeft, event.key);

    let offset: Vector2 = getDirectionOffset(event.key);

    DrawSelection(topLeft.Add(offset), topLeft.Add(offset));
    
    // flash cursor
    if(cursorFlashIntervalID != null) clearInterval(cursorFlashIntervalID);
    cursorFlashIntervalID = setInterval(() => {
        FlashCursor();
    }, 500);

    if(event.key == " ") event.preventDefault(); // prevent spacebar from scrolling page
    
    usingBackSpace = false;

    localStorage.setItem("input-box", textArea.value);
    AddToUndoStack();
}

function getDirectionOffset(key: string): Vector2
{
    let offset: Vector2;
    switch(lastUsedDirection)
    {
        case Direction.North:
            offset = new Vector2(0,-1);
            break;
        case Direction.East:
            offset = new Vector2(1,0);
            break;
        case Direction.South:
            offset = new Vector2(0,1);
            break;
        case Direction.West:
            offset = new Vector2(-1,0);
            break;
    }

    if(key == "/")
    {   
        offset = new Vector2(offset.y * -1, offset.x * -1);

        if(lastUsedDirection == Direction.East || lastUsedDirection == Direction.West) 
        {
            lastUsedDirection = Direction.Rotate(lastUsedDirection, "left");
        }
        else
        {
            lastUsedDirection = Direction.Rotate(lastUsedDirection, "right");
        }
    }
    else if(key == "\\")
    {   
        offset = new Vector2(offset.y, offset.x);
        if(lastUsedDirection == Direction.East || lastUsedDirection == Direction.West) 
        {
            lastUsedDirection = Direction.Rotate(lastUsedDirection, "right");
        }
        else
        {
            lastUsedDirection = Direction.Rotate(lastUsedDirection, "left");
        }
    }

    return offset;
}

let oldSelectStartPosition: Vector2 = Vector2.Zero();
let oldSelectEndPosition: Vector2 = Vector2.Zero();


let selectStartPosition: Vector2 = Vector2.Zero();
let selectEndPosition: Vector2 = Vector2.Zero();

let mouseStartPosition: Vector2 = Vector2.Zero();
let mouseEndPosition: Vector2 = Vector2.Zero();

let isMouseDown = false;
let isDraggingMouse = false;
let didStartInSelection = false;
let isControlKeyDown = false;

let cursorFlashIntervalID: number | null = null;

let textAreaStringSnapshot: string;
let selectionString: string;

function MouseDownCell(event: MouseEvent)
{
    if(cursorFlashIntervalID != null) clearInterval(cursorFlashIntervalID);
    editorCanvas.style.opacity = "1";

    isMouseDown = true;
    isDraggingMouse = false;
    didStartInSelection = false;

    let mousePosition = CursorToCellPos(event);
    mouseStartPosition = mousePosition;

    oldSelectStartPosition = selectStartPosition;
    oldSelectEndPosition = selectEndPosition;

    // move selection
    if(IsWithinBounds(selectStartPosition, selectEndPosition, mousePosition))
    {
        // default snapshot contains existing selection
        textAreaStringSnapshot = textArea.value;
        didStartInSelection = true;
        let oldTopLeft = GetTopLeft(oldSelectStartPosition, oldSelectEndPosition);
        let oldBottomRight = GetBottomRight(selectStartPosition, selectEndPosition);
        let newStringValueArray: string[] = textAreaStringSnapshot.split("\n");

        if(newStringValueArray.length < oldBottomRight.y)
        {
            console.log( oldBottomRight.y, newStringValueArray.length);
            let length = newStringValueArray.length;
            for(let i = 0; i < oldBottomRight.y - length + 2; i++) 
            {
                console.log("adding new line " + (i + length));
                
                newStringValueArray[i + length] = " ".repeat(oldBottomRight.x + 1);
            }

            textArea.value = newStringValueArray.join("\n");
        }

        // move selection not duplicate. create snapshot by removing selection area 
        if(!isControlKeyDown) 
        {
            for(let y = oldTopLeft.y; y < oldBottomRight.y + 1; y++)
            {
                console.log("replacing from line" + y);
                
                newStringValueArray[y] = newStringValueArray[y].slice(0, oldTopLeft.x) + " ".repeat(GetWidth(oldSelectEndPosition, oldSelectStartPosition) + 1) + newStringValueArray[y].slice(oldBottomRight.x + 1, newStringValueArray[y].length);
            }
        }

        textAreaStringSnapshot = newStringValueArray.join("\n");

        // create selection string from selection area

        let topLeft = GetTopLeft(selectStartPosition, selectEndPosition);
        let bottomRight = GetBottomRight(selectStartPosition, selectEndPosition);

        let selectionStringArray: string[] = [];
        let textAreaArray: string[] = textArea.value.split("\n");        

        for(let y = topLeft.y; y < bottomRight.y + 1; y++)
        {
            console.log(y - topLeft.y + 1);
            
            selectionStringArray[y - topLeft.y + 1] = textAreaArray[y].slice(topLeft.x, bottomRight.x + 1);
        }

        if(textAreaArray.length < bottomRight.y) console.log(textAreaArray.length, bottomRight.y);
        

        // if the selection area extends past the string, fill the remaining selection with spaces
        for(let i = 1; i < selectionStringArray.length; i++)
        {
            console.log(selectionStringArray[i]);
            
            // if the selection area is the correct size, repeat will be zero and no spaces will be added
            selectionStringArray[i] += " ".repeat(GetWidth(topLeft, bottomRight) - selectionStringArray[i].length + 1);
        }

        selectionString = selectionStringArray.join("\n");

        console.log(selectionStringArray.join("\n"));

        textAreaStringSnapshot.replace("\t", "    ");
        return;
    }

    // creates selection
    MouseMoveCell(event);
}

function MouseMoveCell(event: MouseEvent)
{
    if(!isMouseDown) return;
    
    let mousePosition = CursorToCellPos(event);
    mouseEndPosition = mousePosition;
    
    if(!mouseStartPosition.Equals(mousePosition)) isDraggingMouse = true; // not a click, now a drag

    if(!isDraggingMouse) return;

    if(didStartInSelection) // moving selection area
    {
        // offset between mouse position and start of selection
        let moveOffset: Vector2 = mouseStartPosition.Subtract(GetTopLeft(oldSelectStartPosition, oldSelectEndPosition));
        
        let selectHeight = GetHeight(oldSelectStartPosition, oldSelectEndPosition);
        let selectWidth = GetWidth(oldSelectStartPosition, oldSelectEndPosition);

        let startPos = mousePosition.Subtract(moveOffset);
        let endPos = mousePosition.Add(new Vector2(selectWidth - moveOffset.x, selectHeight - moveOffset.y));
        
        DrawSelection(startPos, endPos);

        let newStringValueArray: string[] = textAreaStringSnapshot.split("\n");
        let selectionStringArray: string[] = selectionString.split("\n");

        let topLeft = GetTopLeft(selectStartPosition, selectEndPosition);
        let bottomRight = GetBottomRight(selectStartPosition, selectEndPosition);

        // if the selection y location is larger than the height of the string, add new lines
        if(bottomRight.y > newStringValueArray.length - 1)
        {
            for(let i = 0; i < bottomRight.y - newStringValueArray.length + 1; i++) 
            {                
                newStringValueArray[i + newStringValueArray.length] = " ";
                textAreaStringSnapshot += "\n";
            }
        }
        
        for(let y = topLeft.y; y < bottomRight.y + 1; y++)
        {
            // if the string is shorter than the location of the selection, create more string
            if(topLeft.x > newStringValueArray[y].length) 
            {
                // console.log("line" + y + "is shorter than index of" + topLeft.x);
                newStringValueArray[y] += " ".repeat(topLeft.x - newStringValueArray[y].length);
            }
            
            newStringValueArray[y] = newStringValueArray[y].slice(0, topLeft.x) + selectionStringArray[y - topLeft.y + 1] + newStringValueArray[y].slice(bottomRight.x + 1, newStringValueArray[y].length);
        }

        textArea.value = newStringValueArray.join("\n");
        
    }
    else // creating selection area
    {
        DrawSelection(mouseStartPosition, mouseEndPosition);
    }

}   

function MouseUpCell(event: MouseEvent)
{
    isMouseDown = false;

    let mousePosition = CursorToCellPos(event);
    mouseEndPosition = mousePosition;
    
    if(!isDraggingMouse) 
    {
        MouseClick(); // didnt change cell from mouse down to mouse up, essentially a click
        return;
    }

    isDraggingMouse = false;

    localStorage.setItem("input-box", textArea.value);
    AddToUndoStack();
}

function MouseClick()
{
    console.log("click");
    
    DrawSelection(mouseStartPosition, mouseEndPosition);

    if(cursorFlashIntervalID != null) clearInterval(cursorFlashIntervalID);
    
    cursorFlashIntervalID = setInterval(() => {
        FlashCursor();
    }, 500);
}

function CursorToCellPos(event: MouseEvent): Vector2
{
    let rect = editorCanvas.getBoundingClientRect();

    let relativeX = event.clientX - rect.left;
    let relativeY = event.clientY - rect.top;

    let cellX = Math.floor(relativeX / cellWidth);
    let cellY = Math.floor(relativeY / cellHeight);

    return new Vector2(cellX, cellY);
}

// selects cells, always including the starting cell
function DrawSelection(start: Vector2, end: Vector2)
{
    editorCanvas.style.opacity = "1";
    ClearCanvas();
    editorContext.fillRect(
        (start.x  + (end.x >= start.x ? 0 : 1)) * cellWidth, 
        (start.y + (end.y >= start.y ? 0 : 1)) * cellHeight, 
        ((end.x - start.x) + (end.x >= start.x ? 1 : -1)) * cellWidth, 
        ((end.y - start.y) + (end.y >= start.y ? 1 : -1)) * cellHeight
    );

    selectStartPosition = start;
    selectEndPosition = end;
}

function ReplaceCharacterAtPosition(position: Vector2, character: string)
{
    let lines: string[] = textArea.value.split("\n");

    if(position.y > lines.length - 1) lines[position.y] = "";
    if(lines[position.y].length < position.x ) lines[position.y] = lines[position.y] + " ".repeat(position.x - lines[position.y].length);

    lines[position.y] = lines[position.y].slice(0, position.x) + character + lines[position.y].slice(position.x + 1, lines[position.y].length);

    textArea.value = lines.join("\n");
}

function IsWithinBounds(startPosition: Vector2, endPosition: Vector2, position: Vector2)
{
    let topLeft = GetTopLeft(startPosition, endPosition);
    let bottomRight = GetBottomRight(startPosition, endPosition);

    return position.x >= topLeft.x && position.x <= bottomRight.x && 
           position.y >= topLeft.y && position.y <= bottomRight.y;
}

function GetWidth(startPosition: Vector2, endPosition: Vector2)
{
    return Math.max(startPosition.x, endPosition.x) - Math.min(startPosition.x, endPosition.x);
}

function GetHeight(startPosition: Vector2, endPosition: Vector2)
{        
    return Math.max(startPosition.y, endPosition.y) - Math.min(startPosition.y, endPosition.y);
}

function GetTopLeft(startPosition: Vector2, endPosition: Vector2)
{
    return new Vector2(Math.min(startPosition.x, endPosition.x), Math.min(startPosition.y, endPosition.y));
}

function GetBottomRight(startPosition: Vector2, endPosition: Vector2)
{
    return new Vector2(Math.max(startPosition.x, endPosition.x), Math.max(startPosition.y, endPosition.y));
}

// --------------------

function MoveSelection(offset: Vector2)
{
    selectStartPosition = selectStartPosition.Add(offset);
    selectEndPosition = selectEndPosition.Add(offset);
    DrawSelection(selectStartPosition, selectEndPosition);
    oldSelectStartPosition = selectStartPosition;
    oldSelectEndPosition = selectEndPosition;
}

// ----------------------------------------------------

function ClearCanvas()
{
    editorContext.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
}

function FlashCursor()
{    
    editorCanvas.style.opacity = editorCanvas.style.opacity == "0" ? "1" : "0";
}

CalculateCanvasSize();

new ResizeObserver(CalculateCanvasSize).observe(textArea);

function CalculateCanvasSize()
{
    editorCanvas.width = textArea.offsetWidth - parseFloat((editorCanvasComputedStyles.margin).replace("rem", "")) * 2;
    editorCanvas.height = textArea.offsetHeight  - parseFloat((editorCanvasComputedStyles.margin).replace("rem", "")) * 2;
    editorContext.fillStyle = "#ffffff33";

    workerCanvas.width = textArea.offsetWidth - parseFloat((workerCanvasComputedStyles.margin).replace("rem", "")) * 2;
    workerCanvas.height = textArea.offsetHeight  - parseFloat((workerCanvasComputedStyles.margin).replace("rem", "")) * 2;
}

// -----------------------------------

let undoStack: string[] = [textArea.value];
let undoStackIndex: number = 0;

if(localStorage.getItem("undo-stack") != null) 
    undoStack = JSON.parse(localStorage.getItem("undo-stack")!);

if(localStorage.getItem("undo-stack-index") != null)
{
    undoStackIndex = parseInt(localStorage.getItem("undo-stack-index")!)
    console.log("loaded index");
    
}

function AddToUndoStack()
{
    if(textArea.value == undoStack[undoStackIndex]) return; // no changes to push
    
    undoStackIndex++;
    undoStack = undoStack.slice(0, undoStackIndex); // delete everything in front of the index (create new branch)
    undoStack.push(textArea.value);

    // cap undo stack length
    if(undoStack.length > 25) 
    {
        undoStack = undoStack.slice(1, 26);
        undoStackIndex--;
    }

    localStorage.setItem("undo-stack-index", undoStackIndex.toString());
    localStorage.setItem("undo-stack", JSON.stringify(undoStack));
}

function UndoFromStack()
{    
    undoStackIndex = Math.max(0, undoStackIndex - 1);
    textArea.value = undoStack[undoStackIndex];
    // console.log(undoStack[undoStackIndex]);
    

    localStorage.setItem("undo-stack-index", undoStackIndex.toString());
    localStorage.setItem("undo-stack", JSON.stringify(undoStack));
    localStorage.setItem("input-box", textArea.value);
}

function RedoFromStack()
{
    undoStackIndex = Math.min(undoStack.length - 1, undoStackIndex + 1);
    textArea.value = undoStack[undoStackIndex];

    localStorage.setItem("undo-stack-index", undoStackIndex.toString());
    localStorage.setItem("undo-stack", JSON.stringify(undoStack));
    localStorage.setItem("input-box", textArea.value);
}

