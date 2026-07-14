import { OutputError, OutputPrint } from "./program";
import { Spagbol } from "./spagbol";

export class Expression 
{
    // lhs and rhs could be a string or number literal, or a variable that requires a worker on a tile
    lhs: number | string | Spagbol.Tile | null; // lhs is never null, but rhs may be (they are both parsed with the same function thus the same return type including null)
    rhs: number | string | Spagbol.Tile | null; 

    operator: DataOperator | BooleanOperator | null;

    owner: Spagbol.Worker | null = null; // who to give the result to once its calculated

    resultCalculated: boolean = false;

    type: ExpressionType;

    constructor(
        lhs: number | string | Spagbol.Tile | null, 
        rhs: number | string | Spagbol.Tile | null, 
        operator: DataOperator | BooleanOperator | null, 
        type: ExpressionType
    )
    {
        this.lhs = lhs;
        this.rhs = rhs;

        this.operator = operator;

        this.type = type;
    }

    HasOpenHorizontalVarSlot(): boolean
    {
        // wont catch the minus operator since it isnt a lhs or rhs
        return (this.lhs instanceof Spagbol.Tile && this.lhs.character == "-") || (this.rhs instanceof Spagbol.Tile && this.rhs.character == "-")
    }

    TryCalculateResult()
    {
        if(!this.CanCalculateResult()) return;

        console.log("Can calculate result");
        

        let result: number | string | boolean | null = null;

        // single operand expression
        if(this.operator == null && this.rhs == null)
        {
            // either variable or input
            if(this.lhs instanceof Spagbol.Tile) 
            {
                console.log("lhs is a tile");
                
                if(this.lhs.character == "$")
                {
                    let stringInput: string = prompt() ?? "";
                    let numInput: number = parseFloat(stringInput);
                    result = isNaN(numInput) ? stringInput : numInput;
                }
                else result = this.lhs.workers![0].dataValue; // CanCalculateResult would have failed if there were no worker present
            }
                
            else result = this.lhs!;

            if(this.type == ExpressionType.Assignment)
            {
                this.owner!.dataValue = result; // set result to owner
            }
            else if (this.type == ExpressionType.Print)
            {
                OutputPrint(result.toString());
            }

            this.resultCalculated = true;

            return;
        }
        
        // if either are null but not both

        if(this.operator == null && this.rhs != null || this.operator != null && this.rhs == null)
        {
            console.log("invalid expression (throw error)");
            return;
        }

        // gets the value, if its a literal or from a workers data value
        let lhsValue: number | string;
        let rhsValue: number | string;

        if(this.lhs instanceof Spagbol.Tile && this.lhs.character == "$")
        {
            let stringInput: string = prompt() ?? "";
            let numInput: number = parseFloat(stringInput);
            lhsValue = isNaN(numInput) ? stringInput : numInput; // if it cant be parsed as a float, return the string instead
        }
        else lhsValue = (this.lhs instanceof Spagbol.Tile) ? this.lhs.workers![0].dataValue : this.lhs!;
        
        if(this.rhs instanceof Spagbol.Tile && this.rhs.character == "$")
        {
            let stringInput: string = prompt() ?? "";
            let numInput: number = parseFloat(stringInput);
            rhsValue = isNaN(numInput) ? stringInput : numInput; // if it cant be parsed as a float, return the string instead
        }
        else rhsValue = (this.rhs instanceof Spagbol.Tile) ? this.rhs.workers![0].dataValue : this.rhs!;

        // data operators
        switch(<DataOperator>this.operator)
        {
            case DataOperator.Addition:
                if(typeof lhsValue == "string" || typeof rhsValue == "string")
                {
                    result = lhsValue.toString() + rhsValue.toString();
                    break;
                }

                result = <number>lhsValue + <number>rhsValue;
                break;
            case DataOperator.Subtraction:
                if(typeof lhsValue == "string" || typeof rhsValue == "string")
                {
                    OutputError("[Interpreter]: Cannot subtract a string.");
                    break;
                }
                result = <number>lhsValue - <number>rhsValue;
                break;
            case DataOperator.Multiplication:
                if(typeof lhsValue == "string" && typeof rhsValue == "number")
                {
                    result = "";
                    for(let i = 0; i < rhsValue; i++)
                    {
                        result += <string>lhsValue;
                    }

                    break;
                }
                else if (typeof rhsValue == "string") OutputError("[Interpreter]: Cannot multiply by a string.");
                result = <number>lhsValue * <number>rhsValue;
                break;
            case DataOperator.Division:
                if(typeof lhsValue == "string" || typeof rhsValue == "string")
                {
                    OutputError("[Interpreter]: Cannot divide a string.");
                    break;
                }

                result = <number>lhsValue / <number>rhsValue;
                break;

            default: break;    
        }

        // boolean operators
        switch(<BooleanOperator>this.operator)
        {
            case BooleanOperator.EqualTo:
                result = lhsValue == rhsValue;
                break;

            case BooleanOperator.NotEqualTo:
                result = lhsValue != rhsValue;
                break;
            case BooleanOperator.GreaterThan:
                let gTLhs: number = typeof lhsValue == "string" ? lhsValue.length : lhsValue; 
                let gTRhs: number = typeof rhsValue == "string" ? rhsValue.length : rhsValue;
                
                result = gTLhs > gTRhs;        
                if(result) console.log(gTLhs + ">" + gTRhs);
                        
                break;

            case BooleanOperator.LessThan:
                let lTLhs: number = typeof lhsValue == "string" ? lhsValue.length : lhsValue; 
                let lTRhs: number = typeof rhsValue == "string" ? rhsValue.length : rhsValue;
                
                result = lTLhs < lTRhs;
                break;
            default: break;
        }

        if(result == null) 
        {
            console.log("result is null!");
            return;
        }

        console.log("calculated result: " + result);

        if(this.type == ExpressionType.Assignment)
        {
            
            // what to do with result
            if(Object.values(DataOperator).includes(<DataOperator>this.operator!))
            {
                this.owner!.dataValue = <string | number>result;
            }
            if(Object.values(BooleanOperator).includes(<BooleanOperator>this.operator!))
            {
                this.owner!.booleanValue = <boolean>result;
                
                if(this.lhs instanceof Spagbol.Tile) this.lhs.workers![0].booleanValue = <boolean>result; 
                if(this.rhs instanceof Spagbol.Tile) this.rhs.workers![0].booleanValue = <boolean>result; 
            }
        }
        else if(this.type == ExpressionType.Print)
        {
            OutputPrint(result.toString());
        }
        
        this.resultCalculated = true;
    }

    // if all variable slots are full, calculate and set the result, then allow the workers to leave 
    CanCalculateResult(): boolean
    {          
        return ((this.lhs instanceof Spagbol.Tile && this.lhs.character != "$") ? (this.lhs.workers.length == 1) : true) && 
        ((this.rhs instanceof Spagbol.Tile && this.rhs.character != "$") ? (this.rhs.workers.length == 1) : true) &&
        this.resultCalculated == false &&
        this.owner != null;
    }
}

export enum DataOperator {
    Addition = "+",
    Subtraction = "-",
    Multiplication = "*",
    Division = "/"
}

export enum BooleanOperator {
    LessThan = "<",
    GreaterThan = ">",
    EqualTo = "=",
    NotEqualTo = "!"
}

export enum ExpressionType {
    Assignment,
    Print
}


