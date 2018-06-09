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

var obj = null;
var model_index = 0;

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

var model_array = [
  { heading: 'Saddle-Node Bifurcation', exp: 'r + x^2', func: function(obj){ return obj.r + Math.pow(obj.x, 2) } },
  { heading: 'Transcritical Bifurcation', exp: 'r*x - x^2', func: function(obj){ return obj.r*obj.x - Math.pow(obj.x, 2) } },
  { heading: 'Supercritical Pitchfork Bifurcation', exp: 'r*x - x^3', func: function(obj){ return obj.r*obj.x - Math.pow(obj.x, 3) } },
  { heading: 'Subcritical Pitchfork Bifurcation', exp: 'r*x + x^3', func: function(obj){ return obj.r*obj.x + Math.pow(obj.x, 3) } },
]

/***************************************************************************/
// Setup function

function setup(){
  model_array.forEach((d,i) => {
    d3.select('#model-dropdown').append('a')
      .attrs({ class: 'dropdown-item system', data: i, href: '#' })
      .html(d.heading);
  })
}

/***************************************************************************/
// Create function

function create(){
  var val = model_array[model_index];
  obj = new model();

  obj.exp.string = val.exp;
  obj.heading = val.heading;
  obj.f = val.func;

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
    if(index != model_index){ model_index = index; create(); }
  })
}
