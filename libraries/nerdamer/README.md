Nerdamer
========

As of version 0.5.0, the library is split into the core and optional add-ons which can be loaded after the core has been loaded.

Getting started with Nerdamer

Load the library in your html page

```html
<!-- assuming you've saved the file in the root of course -->
<script src="nerdamer.core.js"></script> 
<!-- LOAD ADD-ONS -->
<!-- again assuming you've saved the files in root -->
<script src="Algebra.js"></script>
<script src="Calculus.js"></script>
```

Some functions have dependencies from other add-ons. 

You can see nerdamer in action at http://www.nerdamer.com/demo

All operations are done using the 'nerdamer' object. 

To add an expression just add it to the nerdamer object which will return a expression object.

```javascript             
var e = nerdamer('x^2+2*(cos(x)+x*x)');
console.log(e.text());

//result: 
//2*cos(x)+3*x^2
```            

You can also pass in an object with known values as the second parameter.

```javascript             
var e = nerdamer('x^2+2*(cos(x)+x*x)',{x:6});
console.log(e.text());

//result:
//108+2*cos(6)
```            
        

As you can see only the substitution is performed. To evaluate the result just call evaluate. 
Note that evaluate returns a text string or a number not an object.

```javascript             
var e = nerdamer('x^2+2*(cos(x)+x*x)',{x:6}).evaluate();
console.log(e.text());

//result:
//109.9203405733006
```            
To get back the text as a fraction, call the text method and pass in the string 'fractions'.

```javascript             
var e = nerdamer('x^2+2*(cos(x)+x*x)',{x:6}).evaluate();
console.log(e.text('fractions'));

//result:
//429607273/3908351
```    
You can get your expression back as LaTeX by calling the toTeX method
```javascript             
var LaTeX = nerdamer('x^2+2*(cos(x)+x*x)',{x:0.25}).toTeX();
console.log(LaTeX);

//result:
//2 \cdot \mathrm{cos}\left(\frac{1}{4}\right)+\frac{3}{16}
```   

To have numbers returned as decimals pass in the string 'decimals' to the toTeX method

```javascript             
var LaTeX = nerdamer('x^2+2*(cos(x)+x*x)',{x:0.25}).toTeX('decimal');
console.log(LaTeX);

//result:
//2 \cdot \mathrm{cos}\left(0.25\right)+0.1875
```   

Alternatively you can pass an object containing known values into evaluate method instead. The values passed in don't have to be number they can be another expression if needed.

```javascript             
var e = nerdamer('x^2+2*(cos(x)+x*x)',{x:'x^2+1'});
console.log(e.text());

//result:
//2*cos(1+x^2)+3*(1+x^2)^2
```            

Every time you parse an expression it's stored in nerdamer. To get a list of all the expressions you just call 
nerdamer.expressions().

```javascript             
var knownValues = {x:'x^2+1'};
nerdamer('x^2+2*(cos(x)+x*x)').evaluate(knownValues);
nerdamer('sin(x)^2+cos(x)^2').evaluate(knownValues);

console.log(nerdamer.expressions());

//result:
//[ 46.692712758272776, 1 ]
```            

You can request it as an object as well by passing in true. This can be convenient in some 
situations as the numbering starts at 1;

```javascript             
var knownValues = {x:'x^2+1'};
nerdamer('x^2+2*(cos(x)+x*x)', knownValues );
nerdamer('sin(x)^2+cos(x)^2', knownValues );

console.log(nerdamer.expressions(true));

//{ '1': '2*cos(1+x^(2))+3*(1+x^(2))^(2)',
//'2': 'cos(1+x^(2))^(2)+sin(1+x^(2))^(2)' }
```            
        
Functions aren't always immediately parsed to numbers. For example

```javascript
var result = nerdamer('cos(x)',{x:6});
console.log(result.text());
//cos(6)
```
will only subsitute out the variable name. To change this behaviour numer should be passed in as the 3rd argument.

```javascript
var result = nerdamer('cos(x)',{x:6}, 'numer');
console.log(result.text());
//0.960170286650366
```
or alternatively

```javascript
var result = nerdamer('cos(x)').evaluate({x:6});
console.log(result.text());
//0.960170286650366
```
The difference however is that the first option directly substitutes the variables while the second first evaluates
the expression and then makes the substitutions. This library utilizes native javascript functions as much as possible. As a result it inherits whatever rounding errors they possess. One major change with version 0.6.0 however, is dealing with floating point issues.

```javascript
var result = nerdamer('sqrt(x)*sqrt(x)-2', {x: 2});
console.log(result.text());
//0
```
The above expample now returns zero whereas in previous version the result would be 4.440892098500626e-16. Same goes for 0.1+0.2.

An expression can be replaced directly by passing in the index of which expression to override. For example

```javascript
nerdamer('cos(x)',{x:6}, 'numer');
nerdamer('sin(x)+y',{x:6}, null, 1);
console.log(nerdamer.expressions());
//[ 'sin(6)+y' ]
```

If multiple modifier options need to be passed into nerdamer you can do so using an array. For example ...

```javascript
var e = nerdamer('cos(x)+(y-x)^2', {x:7}, ['expand', 'numer']);
console.log(e.text());
//-14*y+y^2+49.7539022543433
```

If you need the code as LaTeX you can pass in true as the second parameter when requesting the expressions.

```javascript             
nerdamer('x^2+2*(cos(x)+x*x)');
nerdamer('sin(x)^0.25+cos(x)^0.5' );
var asObject = true;
var asLaTeX = true;
console.log(nerdamer.expressions(asObject, asLaTeX));

/*{ '1': '2 \\cdot \\mathrm{cos}\\left(x\\right)+3 \\cdot x^{2}',
  '2': '\\sqrt{\\mathrm{cos}\\left(x\\right)}+\\mathrm{sin}\\left(x\\right)^{\\frac{1}{4}}' }*/
```            
        

You can specify a particular location when adding an expression, which is specified with the third parameter.

```javascript 
nerdamer('x^2+2*(cos(x)+x*x)');
nerdamer('sin(x)^0.25+cos(x)^0.5' );
nerdamer('expr-override', undefined, 2 );
var asObject = false;
var asLaTeX = true;
console.log(nerdamer.expressions(asObject, asLaTeX));

/* [ '2 \\cdot \\mathrm{cos}\\left(x\\right)+3 \\cdot x^{2}',
  '\\sqrt{\\mathrm{cos}\\left(x\\right)}+\\mathrm{sin}\\left(x\\right)^{\\frac{1}{4}}',
  'expr-override' ]
 */
```

Here's an example of reserved variable and function names.

```javascript 
var reserved = nerdamer.reserved();
console.log(reserved);
//result:
/* csc, sec, cot, erf, fact, mod, GCD, QGCD, LCM, pow, PI, E, cos, sin, tan, acos, asin, atan, sinh, cosh, tanh, asinh, acosh, atanh, exp, min, max, floor, ceil, round, vector, matrix, parens, sqrt, log, expand, abs, invert, transpose, dot */

//or as an array

var reserved = nerdamer.reserved(true);
console.log(reserved);
//result:
/* [ 'csc', 'sec', 'cot', 'erf', 'fact', 'mod', 'GCD', 'QGCD', 'LCM', 'pow', 'PI', 'E', 'cos', 'sin', 'tan', 'acos', 'asin', 'atan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh', 'exp', 'min', 'max', 'floor', 'ceil', 'round', 'vector', 'matrix',
  'parens', 'sqrt', 'log', 'expand', 'abs', 'invert', 'transpose', 'dot' ]  */
```            

Most math functions are passed in as part of the expression. If you want to differentiate for instance you just use the function diff which is located in the Calculus add-on as of version 0.5.0

```javascript             
var e = nerdamer('diff(x^2+2*(cos(x)+x*x),x)');

console.log(e.text());

//result: 
//-2*sin(x)+6*x
```
        

Nerdamer can also handle runtime functions. To do this use the method setFunction. 
The runtime functions do have symbolic capabilities and support for imaginary numbers. 
The setfunction method is used as follows:

nerdamer.setFunction( function_name, parameter_array, function_body ) 

For Example:

```javascript             
//generate some points
var f = function(x) { return 5*x-1; }
console.log(f(1)); //4
console.log(f(2)); //9 - value to be found
console.log(f(7)); //34

nerdamer.setFunction('interpolate',['y0','x0','y1','x1','x'],'y0+(y1-y0)*((x-x0)/(x1-x0))')
var answer = nerdamer('interpolate(4,1,34,7,2)').evaluate();

console.log(answer);

//result: 9
```

Custom functions alternatively be set in following manner.

```javascript
nerdamer('hyp(a, b) := sqrt(a^2 + b^2) ');
var result = nerdamer('hyp(3, 4)').evaluate().text();
console.log(result);
//result: 5
```


If you need to add a constant use the setConstant method

```javascript             
nerdamer.setConstant( 'g', 9.81);
var weight = nerdamer('100*g').text();
console.log(weight);
//result:
//981
```            
        
To delete just set it to delete

```javascript             
nerdamer.setConstant( 'g', 9.81);
var weight = nerdamer('100*g').text();
console.log(weight);
//981
nerdamer.setConstant( 'g', 'delete');
var weight = nerdamer('100*g').text();
console.log(weight);
//100*g
```        

You also have the option of exporting your function to a javascript function which can be useful if you need some 
filtering from user input. Do keep in mind that the parameters are sorted alphabetically for more than one 
parameter. To use it add the expression to nerdamer and use the buildFunction method.

```javascript             
var f = nerdamer('x^2+5').buildFunction();
console.log(f(9));

//result:
//86
```            
If you have a particular order in which you need the parameters to be set, then you pass in an array with the variables in the order in which you want them for instance:

 ```javascript
var f = nerdamer('z+x^2+y').buildFunction(['y', 'x', 'z']);
 console.log(f(9,2,1));
 //result
 //14
 ```

Every time you add an expression to nerdamer it's stored. To list the expressions currently in nerdamer call 
the 'expressions' method. To delete an expression use the 'clear' method and pass in the expression you want to delete. 
To clear everything pass in the string 'all'.

```javascript            
nerdamer('n*R*T/v');
nerdamer('mc^2');
nerdamer('G*m1*m2/d^2');

nerdamer.clear(2);

console.log(nerdamer.expressions(true));

//result:
//{ '1': 'R*T*n*v^(-1)', '2': 'G*d^(-2)*m1*m2' }

nerdamer.clear('all');
console.log(nerdamer.expressions(true));
//result:
//{}
```            
     
If you need go get the variables of an expression use the variables method. This method can be called after
nerdamer was provided an expression. For example

```javascript
var variables = nerdamer('csc(x*cos(y))-no_boring_x').variables();
console.log(variables);
//result:
//[ 'no_boring_x', 'x', 'y' ]
```

The order in which the variables appear require a little bit of knowledge of how nerdamer organizes symbols. For the
sake of simplicity we'll just assume that there is no particular order   

----------------------------------------------------------------------------------------------------------------------
Functions, Operations, and Chaining
===============
You can access the built-in functions directly given its name. For example
```javascript
var ans = nerdamer.tan('pi/4');
console.log(ans.toString()); // 1
```
Or this if the Calculus add-on is loaded
```javascript
var ans = nerdamer.diff('log(x)/x', 'x');
console.log(ans.toString()); // -log(x)*x^(-2)+x^(-2)
```
Or expand your expression
```javascript
var ans = nerdamer.expand('(x+1)^3');
console.log(ans.toString()); // 1+3*x+3*x^2+x^3
```
You can see the list of built-in functions [here](http://nerdamer.com/documentation.html)

Additionally the expressions can be chained

```javascript
var ans = nerdamer('a+b').multiply(2).pow(3);
console.log(ans.toString()); // 8*(a+b)^3
```

The supported operations are add, subtract, multiply, divide, pow

----------------------------------------------------------------------------------------------------------------------
Using the solver
===============
To solve equations first load Solve.js. Just remember that Solve also required Algebra.js and Calculus.js to be loaded. You can then solve equations using nerdamer. Important: State the variable for which you are trying to solve.
```javascript
var sol = nerdamer.solveEquations('x^3+8=x^2+6','x');
console.log(sol.toString());
//1+i,-i+1,-1
```

Notice that we use toString rather than text as this returns a javascript array.

You can also solve an expression
```javascript
var e = nerdamer.solveEquations('x^2+4-y', 'y');
console.log(e[0].text());
//4+x^2
```

You can also solve multivariate equations
```javascript
var sol = nerdamer.solveEquations('x^2+8+y=x+6','x');
console.log(sol.toString());
//0.5*((-4*y-7)^0.5+1),0.5*(-(-4*y-7)^0.5+1)
```
You can do up to 3rd order polynomials for multivariate polynomials

Additionally you can try for equations containing functions. This is more of a hit or miss approach unlike single variable polynomials (which uses Mr. David Binner's Jenkins-Traub port - http://www.akiti.ca/PolyRootRe.html) but it's there if you want to give it a try.

```javascript
var sol = nerdamer.solveEquations('cos(x)+cos(3*x)=1','x');
console.log(sol.toString());
//5.7981235959208695,0.4850617112587174
```
To solve a system of linear equations pass them in as an array. For example

```javascript
var sol = nerdamer.solveEquations(['x+y=1', '2*x=6', '4*z+y=6']);
console.log(sol);
//[ [ 'x', 3 ], [ 'y', -2 ], [ 'z', 2 ] ]
```
In version 0.7.2 and up the solver can additionally be used in the following way
```javascript
//first parse the equation
var x = nerdamer('x^2+2=y-7*a');
//You can make substitutions to the equation
x = x.evaluate({a: 'x^2-3'});
console.log(x.toString()); //2+x^2=-7*x^2+21+y
var solutions = x.solveFor('x');
console.log(solutions.toString()); //(1/16)*sqrt(32*y+608),(-1/16)*sqrt(32*y+608)
```

If no solutions could be found then the array will be empty

The Core
========

To use the core simply request it using the getCore method.

```javascript
var core = nerdamer.getCore();
```
The core contains:

* The various classes -> Symbol, Fraction, Parser, Expression, Latex, Vector
* The groups into which the Symbol classes is the divided -> groups
* The utility functions -> Utils
* The extended math functions -> Math2
* And an instance of the current parser being used -> PARSER

Additionally the core enables you to use nerdamer's classes directly. You could
for instance do this after getting the core

```javascript

var core = nerdamer.getCore();
var x1 = new core.Symbol('x');
var x2 = new core.Symbol('x');
var product = core.PARSER.multiply(x1,x2);

console.log(product.valueOf());
//x^2

```

This may or may not be useful but do keep in mind that when doing this one 
or both symbols may be modified. To prevent this call a clone if you intent to
reuse the symbol. So the above example would be

```javascript

var core = nerdamer.getCore();
var x = new core.Symbol('x');

var product = core.PARSER.multiply(x.clone(),x.clone());

console.log(product.valueOf());
//x^2
```

This leaves x unchanged.

**EXTENDING THE CORE**

To add a function to nerdamer use the register method is used


```javascript

var some_function = {
  //Algebra for example
  parent: 'Algebra',
  name: 'some_function',
  //this determines if the functions can be used by the user when passing a string. 
  visibility: true, 
  //the minimum number of arguments your function requires. 
  //defaults to 1
  numargs: some_integer, 
  //the constructor. This is the environment under which your function is built. 
  build: function(){
    //this refers to the Parser
    //return the function which need to be set
    return function(/*args*/) {
      //body
      
    }
  }
};

//and then register it
nerdamer.register(some_function);
```

_**parent**_:  The parent is optional. If this object does not exist it will be created. If it does then it is added. Omitting the parent does not result in it being added to the core directly. 

_**numargs**_:  tells nerdamer how many arguments are allowed and can be either an integer, a range in the form of an array [min arguments, max arguments], or -1 which enables any amount of arguments.

_**visibility**_:  enables nerdamer's parse function to see the function and allows the user to use it.

_**build**_:  is the constructor and is within the core's scope. It returns a function which is within the scope of the PARSER (the parser instance which nerdamer uses). The arguments for the return function are Symbols. This means that any algorithm can be directly applied using nerdamer's abstraction layer using the functions, add, subtract, divide, multiply, and pow. 

**Example 1**

```javascript
nerdamer.register({
    parent: 'Algebra',
    name: 'quad',
    visible: true,
    numargs: 3,
    build: function(){
        var core = this; //get the core
        //I use underscore because it makes the algorithm easier to read but choose what you prefer
        var _ = core.PARSER; 
        var Symbol = core.Symbol;//grab the symbol class or use it directly
        return function(a, b, c) {
            //apply algorithm (-b+sqrt(b^2-4ac))/2a
            var det = _.subtract(_.pow(b.clone(), new Symbol(2)),
                _.multiply(_.multiply(a.clone(), c), new Symbol(4)));
            return _.divide(_.add(b.negate(), _.pow(det, new Symbol(0.5))),
                        _.multiply(new Symbol(2), a));
        };
    }
});
```
After this the function can be called through nerdamer. 

```javascript
//get one of the roots for x^2+2x+1
var e = nerdamer('quad(1,11,24)');
console.log(e.text());
//-3
```

Notice the use of the clone method when the symbol is used more than once. When parsing one or more symbols drop per operation. On the next cycle a fresh new Symbol is created. To minimize the creation of new Symbols nerdamer reuses one of the symbols supplied so the return symbol is usually a modified version of one of the parameters. This usually does not cause a problem when the parsing is in a linear fashion but it creates a problem when applying algorithms in which symbols get called again. This is one of the issues I'll be tackling in the future but for now either use a safe block or call the clone method on symbols which get reused.

In this example the layer is used directly. When an algorithm is applied in this fashion the additional cost is negligible. You could alternatively use the parse method as in example 2.

**Example 2**

```javascript
nerdamer.register({
    parent: 'Algebra',
    name: 'quad',
    visible: true,
    numargs: 3,
    build: function(){
        var core = this; //get the core
        return function(a, b, c) {
            //apply algorithm (-b+sqrt(b^2-4ac))/2a
            var exp = core.Utils.format('(-{1}+sqrt({1}^2-4*{0}*{2}))/2*{0}', a, b, c);
            return core.PARSER.parse(exp);
        };
    }
});
```

Although shorter and easier to read it generally comes at a higher cost so choose wisely.

**THE PARSER**

The core comes with a parser instance fired up and ready to go. It is wise to keep using that parser instance as this is the instance that get extended and modified. To modify the parser instance call the extend method of the parser and supply the name of the function you're extending and the function you are extending it with. The extended function gets called with 3 parameters, the first symbol, the second symbol, and the original function. Here's an example of how it's done in the LinAlg add-on.

```javascript
var core = nerdamer.getCore();
core.PARSER.extend('add', function(symbol1, symbol2, add){
    //do stuff with your new types
});
```