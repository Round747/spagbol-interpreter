import { StepProgram, InitialiseProgram, RunProgram, StopProgram, InstantRunProgram, isProgramRunning, SetIsProgramRunning, PauseProgram, RestartProgram, SetIsProgramPaused } from "./program";

document.getElementById("step-program")!.addEventListener("click", function() {
    if(!isProgramRunning) 
    {
        InitialiseProgram();
        SetIsProgramRunning(true);
    }
    PauseProgram();
    StepProgram();
});

document.getElementById("start-program")!.addEventListener("click", function() {
    RunProgram();
});

document.getElementById("stop-program")!.addEventListener("click", function() {
    PauseProgram();
});

document.getElementById("calculate-program")!.addEventListener("click", function() {
    InstantRunProgram();
});

document.getElementById("restart-program")!.addEventListener("click", function() {
    RestartProgram();
});

// ----------------------------------------------------

