/***************************************************************************/
// Ready function

$(document).ready(function(){
  setup();
})

/***************************************************************************/
// Setup function

function setup(){
  obj = new LogisiticModel();
  obj.createSliders();
  obj.parse();
  obj.renderEquation(); // Call after calling parse()
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  obj.findAllRoots();

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
