/***************************************************************************/
// Ready function

$(document).ready(function(){
  setup();
})

var line = d3.line()
    .x(function(d) { return (d.x); })
    .y(function(d) { return (d.y); });

/***************************************************************************/
// Setup function

function setup(){
  obj = new LogisiticModel();
  obj.createSliders();

  obj.parse();
  obj.renderEquation(); // Call after calling parse()
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  obj.findAllRoots();

  // obj.createGraph();

  update();
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

/***************************************************************************/
// Update function

function update(){
  obj.evaluate();

  obj.updateSliders();
  obj.draw();

  // obj.updateGraph();
}
