/***************************************************************************/
// Ready function

$(document).ready(function(){
  setup();
})

/***************************************************************************/
// Setup function

function setup(){
  obj = new LogisiticModel();
  obj.createEquation();
  obj.createSliders();
  obj.parse();

  update();
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

/***************************************************************************/
// Update function

function update(){
  obj.evaluate();

  obj.updateSliders();
  obj.draw();
}
