/***************************************************************************/
// Ready function

$(document).ready(function(){
  setup();
  changeSystem_events();
  create();
})

var line = d3.line()
    .x(function(d) { return (d.x); })
    .y(function(d) { return (d.y); });

var obj_array = [];
var obj = null;
var obj_index = 3;

var threshold = 0.00001;
function round(d){
  if(typeof(d) != 'number'){
    if(math.abs(d.im) < threshold){ if(math.abs(d.re) < threshold){ return 0 } else { return d.re } } else { return d }
  }
  else if(math.abs(d) < threshold){ return 0 } else { return d }
}

function stability(d){
  if(d < 0){ return 'stable' }
  else if(d > 0){ return 'unstable' }
  else if(d == 0){ return 'neutral' }
  else { return 'none' }
}

/***************************************************************************/
// Setup function

function setup(){
  obj_array.push(LogisiticModel);
  obj_array.push(ParabolaModel);
  obj_array.push(TranscriticalModel);
  obj_array.push(PitchforkModel);
}

/***************************************************************************/
// Create function

function create(){
  // obj = new LogisiticModel();
  obj = new obj_array[obj_index]();

  obj.createSliders();

  obj.parse();
  obj.renderEquation(); // Call after calling parse()
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  obj.findAllRoots();

  update();
  obj.graph_created = false;
  obj.createGraph();
  obj.updateGraph();
  obj.graph_created = true;
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

/***************************************************************************/
// Update function

function update(){
  obj.evaluate();

  obj.updateSliders();
  if(obj.graph_created){ obj.updateGraph(); }
}

/***************************************************************************/
// Dropdown

function changeSystem_events(){
  d3.selectAll('.system').on('click', function(){
    var index = parseInt( d3.select(this).attr('data') );
    if(index != obj_index){ obj_index = index; create(); }
  })
}
