# Spagbol Interpreter

Spagbol is an esoteric language (esolang) meant to resemble a flow chart.  
It is called Spagbol because scripts often resemble "Wire spaghetti" or "Spaghetti code."



Multiple workers can be created, and run parallel to or interact with each other. It can query the user for input, and output information to a console.

All programs in Spagbol can be created with characters on a regular keyboard.

```
*-----{0}-----/---------\ 
              :    x    |                  
              \----"/---/   /-------------{1}-----\  
                 x-+=-----v-/        /----{0}-----\     
                   |\-----+---\      |        /-\ |
                   |      |   |  /---<        | >{|=0}-\-----*
                   >---v--+---+--/   \----\   | | x    |
                   |   |  |   |      /-{-+|}--/ |      |
   /---------------/   |  |   |      |    x     |      |
*--\--{$}---{-="stop"}-<  |   |      \----------+------/
                       \--/   |                 |     
                              \----------\      |
                                       /-+------/
                                       | |
                                 *----{|/|}--(-)--x
                                       x x
```
([See more example programs](#example-programs))

Spagbol uses a total of 24 different command characters, as well as any string or number literal.

# About the Interpreter

This interpreter was written in Typescript, meaning that it utilises Javascripts number and string types for workers values. Running the program at a high ticks-per-second may also not be accurate, as it uses Javascripts <code>setInterval</code> method.

### Controls

- <code>Start</code> - Runs the program. Each worker will move at the specified tick speed.
- <code>Stop</code> - Pauses the program. It can be continued with the <code>Start</code> button, or stepped with the <code>Step</code> button.
- <code>Step</code> - Move the program one step. Each worker will move once every time the button is clicked. Clicking this while the program is running will pause the program.
- <code>Restart</code> - If the program is running, it will be reset. The code in the input box will be re-initialised.
- <code>Instant</code> - The program will be run at the maximum possible speed. Note that this is executed in a while loop, meaning that if the users code never correctly terminates, the browser will freeze.
- <code>Colourful workers</code> - Toggling this gives each worker a unique colour, useful for tracking a single worker when debugging a program.


# About the language

Spagbol has two key components: Paths (composed of tiles), and Workers. Workers follow paths one step at a time, and execute instructions along them. They can branch to different paths, or even duplicate.

## Workers

Workers are created at start points and attempt to move every step of the program until either they hit an end point, or another worker ends the program.

Each worker contains two values:
- Data value - Either a string or number
- Boolean value - Either a boolean (true or false) or null

These values can be manipulated and outputted by certain tiles.

## Tiles

### Path tiles
Tiles that allow or change the way a worker moves

<table>
    <tr>
        <th>Tile</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
        <tr>
        <td>*</td>
        <td>Starting point for a worker. A single worker will be created here when the program starts. Only one path can connect to this tile.</td>
        <td></td>
    </tr>
    <tr>
        <td>x</td>
        <td>Ending point for a worker. A worker is destroyed upon moving into this tile, multiple paths can connect to this tile.</td>
        <td></td>
    </tr>
    <tr>
        <td>-</td>
        <td>Moves workers horizontally.</td>
        <td>
            <pre>*-----x</pre>
        </td>
    </tr>
    <tr>
        <td>|</td>
        <td>Moves workers vertically.</td>
        <td>
            <pre>   *
   |
   |
   x</pre>
        </td>
    </tr>
    <tr>
        <td>/ or \</td>
        <td>Rotates a worker along its mirrored axis, <i>if</i> it would lead to a new path, otherwise the worker continues straight.</td>
        <td>
            <pre>*--\
   |
*--\--x</pre>
        </td>
    </tr>
    <tr>
        <td>+</td>
        <td>Intersection between two paths, allows both paths to pass straight through each other.</td>
        <td>
            <pre>   *
   |
*--+--x
   |
   x</pre>
        </td>
    </tr>
    <tr>
        <td>@</td>
        <td>Ending point for the entire program. All workers are destroyed upon one moving into this tile.</td>
        <td><pre>*-----@</pre></td>
    </tr>
    <tr>
        <td>"</td>
        <td>Prevents a worker moving horizontally through until a worker moving vertically enters the tile.</td>
        <td>
            <pre>   *
   |
*--"--x
   |
   x</pre>
        </td>
    </tr>
    <tr>
        <td>=</td>
        <td>Prevents a worker moving vertically through until a worker moving horizontally enters the tile.</td>
        <td>
            <pre>
   *
   |
*--=--x
   |
   x</pre>
        </td>
    </tr>
    <tr>
        <td>< or > or v or ^</td>
        <td><ul>
        <li>If the worker's boolean value is not null, it will turn right at this tile if it is true, or left if it is false. Afterward, the boolean value is set to null. </li>
        <li>If the worker's boolean value is null, it will duplicate, creating another worker with an identical data value, the original worker will turn right, and the duplicate will turn left</li>
        </ul></td>
        <td>
            <pre>
   /--x
   |
*--<
   |
   \--x</pre>
        </td>
    </tr>
</table>

### Data tiles
Tiles that change either the boolean or data value of the worker

<table>
    <tr>
        <th>Tile</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    <tr>
        <td>:</td>
        <td>Increments the data value of a worker by 1. If the data value is a string, an error will be thrown.</td>
        <td>
            <pre>*--:--x</pre>
        </td>
    </tr>
    <tr>
        <td>~</td>
        <td>Decrements the data value of a worker by 1. If the data value is a string, an error will be thrown.</td>
        <td>
            <pre>*--~--x</pre>
        </td>
    </tr>
    <tr>
        <td>#</td>
        <td>Sets the boolean value of a worker to null.</td>
        <td>
            <pre>*--#--x</pre>
        </td>
    </tr>
    <tr>
        <td>{ }</td>
        <td>Defines an assignment expression. The expression can have two operands and an operator, or simply one operand. The result of an expression can be either a string, a number, or a boolean.
        </td>
        <td>
            <pre>
       x
       |
*---{1>|}---x
       |
*--{3}-/</pre>
        </td>
    </tr>
    <tr>
        <td>( )</td>
        <td>Defines a print expression. The expression will be printed to the output once calculated. The result is not stored in any of the workers involved.</td>
        <td>
            <pre>*--("Hello, World!")--x</pre>
            <pre>*--(-)--x</pre>
        </td>
    </tr>
</table>

## Expressions

<div style="display: flex;">
    <div style="margin-right: 3rem;">
        <h4>Data Operators</h4>
        <table >
        <tr><td>+</td><td>Addition</td></tr>
        <tr><td>-</td><td>Subtraction</td></tr>
        <tr><td>*</td><td>Multiplication</td></tr>
        <tr><td>/</td><td>Division</td></tr>
        </table>
    </div>
    <div>
        <h4>Boolean Operators</h4>
        <table>
        <tr><td>=</td><td>Equal to</td></tr>
        <tr><td>!</td><td>Not equal to</td></tr>
        <tr><td>></td><td>Greater than</td></tr>
        <tr><td><</td><td>Less than</td></tr>
        </table>
    </div>
</div>

When using strings in expressions, certain operators behave differently. 
- The <code>+</code> operator will concatenate the string, (as expected). If one of the operands is a number, it will converted to a string. The expression <code>("Hi, "+3)</code> will result in the output <code>Hi, 3</code>. 
- The <code>*</code> operator will repeat the string operand on the left hand side by the number operand on the right. The expression <code>("Hi, "\*3)</code> will result in the output <code>Hi, Hi, Hi, </code>. 
- The <code>=</code> and <code>!</code> operators will compare the value of two strings. If one of the operands is a number, the length of the string will be compared instead. The expression <code>("123"=3)</code> will evaluate to true, as will <code>("123"="123")</code>.
- The <code>></code> and <code><</code> operators will also compare the lengths of the strings. One of the operands can be a number. The expression <code>("12345">3)</code> will evaluate to true, and the expression <code>("12">"1234")</code> will evalute to false.

The values of other workers can also be used or compared in these expressions. By using <code>-</code> or <code>|</code> to connect paths through the expression. The <code>-</code> operand represents the line that the expression is running along. the <code>|</code> represents another line that will pass through the expression. Workers on these tiles will wait until the worker on the horizontal path either arrives at the <code>-</code> if there is one, or at the opening bracket. Once possible, the result will be calculated.


- If the result of the expression is a string or number, the data value of the worker on the horiztal line is set.
- If the result is a boolean, all workers who were a part of the expression get their boolean values set.

Once it is calculated, all workers involved are allowed to continue.

There is also one special operand. The <code>$</code>. This operand prompts the user for an input. Its value could be a string or a number.    

```
*--{$}--(-)--x
```
*Sets the value of the worker to the users input, then prints it to the console.*
    
Expressions can only be written horizontally, however a worker can move through an expression from either direction. Regardless of the direction of the worker, an expression is always calculated from left to right.

```
x--(1+2)--*
```
*Outputs "3" to the console.*

# Example programs:

### Simple Hello World: 
```
*---("Hello, World!")---x
```

### Slightly less simple Hello World:  
This outputs the same result, but slower, since the worker has to travel further to reach the print command.
```
*--\                        /---\
   |  /--("Hello, World!")--/   |
   \--/                         \--x
```

### FizzBuzz:
Determines if a given number is divisible by 3, 5, or both.
```
                   /----------------------------------------------------------\
                   |                             /-------------------(-)-x    |
                   |                         /---<                            |
                   |             x x         |   \---{0}----\                 |
                   |   /--{""}--{|+|}--{-=""}<      /-------\    /-------\    /---\
                   |   |         | |         \--{1}-/    /-{|=1}-<       |    | x |
        /----------/   |         | \-----------------\   |  x    \--(-)--\-{-=|}< |
*--{$}--<              \-v-------+-------------------+---/                    | @ |
        \---:---\        |       \-----------\       \----------\             \---/
                |    x   |                   |       /---{""}---/           
          /-----\    |   |                /--+--{-=0}<          |           
*--{1}-/--+--{-<|}---<   \-v----/--{->0}--<  |       \-{"Buzz"}-/           
       |  \-----/    |     |    |         |  |
       |             |     |    \--{--5}--/  \---------------\
       \------:------^-----<                      /---{""}---/
                           |              /--{-=0}<          |
                           \----/--{->0}--<       \-{"Fizz"}-/
                                |         |      
                                \--{--3}--/
```

### Truth machine:
This assumes that if the input is not 0, it is 1.
```
             /-(1)-\
             |     |
             \-----/
*--{$}--{-=0}<
             \-(0)-x
```

### Misc programs:

Asks the user for numbers until they input "stop". After which it will output the average (mean) of those numbers.
```
*-----{0}-----/---------\ 
              :    x    |                  
              \----"/---/   /-------------{1}-----\  
                 x-+=-----v-/        /----{0}-----\     
                   |\-----+---\      |        /-\ |
                   |      |   |  /---<        | >{|=0}-\-----*
                   >---v--+---+--/   \----\   | | x    |
                   |   |  |   |      /-{-+|}--/ |      |
   /---------------/   |  |   |      |    x     |      |
*--\--{$}---{-="stop"}-<  |   |      \----------+------/
                       \--/   |                 |     
                              \----------\      |
                                       /-+------/
                                       | |
                                 *----{|/|}--(-)--x
                                       x x
```

Prints the users input 5 times, then terminates.

```
*-{$}-/-------\   
      |      x=---\
      \--(-)--/   |
                  |
              /---+------@
*-{0}-/-{-<5}-<   |
      |       |   |
      \---:---^---/
```




