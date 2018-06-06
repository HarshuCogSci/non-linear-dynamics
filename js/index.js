/***************************************************************************/
// Ready function

$(document).ready(function(){
  setup();
})

var line = d3.line()
    .x(function(d) { return (d.x); })
    .y(function(d) { return (d.y); });

// var model_array = [LogisiticModel, ParabolaModel];

/***************************************************************************/
// Setup function

function setup(){
  // obj = new LogisiticModel();
  obj = new ParabolaModel();

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
