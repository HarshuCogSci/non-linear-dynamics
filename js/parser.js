/******************************************************************************/
// Parses the expression

function convert_to_numericjs_exp(str){
  var math_obj = math.parse(str);
  var converted_str = recursion(math_obj);
  return converted_str
}

function recursion(obj){
  if(obj.content != undefined){ return '(' +recursion(obj.content)+ ')' };
  if(obj.fn == undefined){ return obj.value != undefined ? obj.value : obj.name };
  if(obj.fn.name == 'sin'){ return 'numeric.sin(' +recursion(obj.args[0])+ ')' }; // math.sin
  if(obj.fn.name == 'cos'){ return 'numeric.cos(' +recursion(obj.args[0])+ ')' }; // math.cos
  if(obj.fn.name == 'tan'){ return 'numeric.tan(' +recursion(obj.args[0])+ ')' }; // math.tan
  if(obj.fn != undefined){

    if(obj.fn == 'multiply'){ return 'numeric.mul(' +recursion(obj.args[0])+ ',' +recursion(obj.args[1])+ ')' }; // math.mutiply
    if(obj.fn == 'add'){ return 'numeric.add(' +recursion(obj.args[0])+ ',' +recursion(obj.args[1])+ ')' }; // math.add
    if(obj.fn == 'divide'){ return 'numeric.div(' +recursion(obj.args[0])+ ',' +recursion(obj.args[1])+ ')' }; // math.add
    if(obj.fn == 'subtract'){ return 'numeric.sub(' +recursion(obj.args[0])+ ',' +recursion(obj.args[1])+ ')' }; // math.add
    if(obj.fn == "unaryMinus"){ return 'numeric.mul(-1, ' +recursion(obj.args[0])+ ')' };
    if(obj.fn == "unaryPlus"){ return 'numeric.mul(1, ' +recursion(obj.args[0])+ ')' };
    if(obj.fn == "sqrt"){ return 'numeric.sqrt(' +recursion(obj.args[0])+ ')' };
    if(obj.fn == "abs"){ return 'numeric.abs(' +recursion(obj.args[0])+ ')' };
    if(obj.fn == 'pow'){ return 'numeric.pow(' +recursion(obj.args[0])+ ',' +recursion(obj.args[1])+ ')' }; // math.add

  }
}
