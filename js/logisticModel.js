/******************************************************************************/
/* Logisitc Model */

function LogisiticModel(){
  this.exp = 'r*N*(1-N/K)';
  // this.exp_latex = "\\( \\frac{dN}{dt} = r*N*(1- \\frac{N}{K} ) \\)";
  this.heading = 'Logisitic Model';

  this.r = { min: 0.1, max: 5, step: 0.1, value: 1 };
  this.K = { min: 0.1, max: 5, step: 0.1, value: 1 };
  this.N0 = { min: 0, max: 6, step: 0.1, value: 1 };
  this.N = d3.range(this.N0.min, this.N0.max, this.N0.step);

  this.roots = null;
  this.roots_stability = null;

  this.K_array = [];
  this.roots_array = [];
  this.roots_stability_array = [];

  this.dN_by_dt_list = null;
  this.N_list = [];
  this.t_list = [];
  this.timeSpan = 20;
  this.h = 0.01;
}

/******************************************************************************/
/* Parsing the expression */

LogisiticModel.prototype.parse = function(){
  this.exp_mathjs = math.parse(this.exp);
  this.exp_numericjs = convert_to_numericjs_exp(this.exp);
  this.exp_nerdamer = nerdamer(this.exp);
  this.exp_latex = this.exp_mathjs.toTex();

  this.roots_exp = this.exp_nerdamer.solveFor('N');
  this.diff_exp = math.derivative(this.exp, 'N').toString();
  this.diff_exp_numericjs = convert_to_numericjs_exp(this.diff_exp);
}

/******************************************************************************/
/* Render the equation in Latex */

LogisiticModel.prototype.renderEquation = function(){
  d3.select('#equation_pane').html("\\("+ "\\dot{N}=" +this.exp_latex+ "\\)");
  d3.select('#heading').html(this.heading);
}

/******************************************************************************/
/* Find roots and it's dependence on K */

LogisiticModel.prototype.findAllRoots = function(){
  var K = d3.range(this.K.min, this.K.max, this.K.step);
  this.K_array = K;
  this.roots_array = this.roots_exp.map(d => {
    return eval( d.toString() )
  });

  /* Making single number into array */
  this.roots_array = this.roots_array.map(d => {
    if(typeof(d) == 'number'){ return K.map(val => { return d }) }
    else return d
  })

  var stability_value_array = this.roots_array.map(d => {
    var N = d;
    var r = this.r.value; // Used to find the stability_value - Will only change the magnitude and not the sign
    return eval(this.diff_exp_numericjs)
  })

  this.roots_stability_array = stability_value_array.map(d => {
    return d.map(node => { if(node < 0){ return 'stable' } else if(node > 0){ return 'unstable' } else { return 'neutral' } })
  })
}

/******************************************************************************/
/* Called when a user changes a parameter */

LogisiticModel.prototype.evaluate = function(){
  this.phasePlot();
  this.findRoots();
  this.trajectory();
}

/******************************************************************************/
/* Calculate the phase plot trajectory */

LogisiticModel.prototype.phasePlot = function(){
  var N = this.N;
  var r = this.r.value;
  var K = this.K.value;
  this.dN_by_dt_list = eval(this.exp_numericjs);
}

/******************************************************************************/
/* Find roots and their stability */

LogisiticModel.prototype.findRoots = function(){
  var r = this.r.value;
  var K = this.K.value;

  this.roots = this.roots_exp.map(d => { return eval( d.toString() ) });
  this.roots_stability = this.roots.map(d => {
    var N = d;
    var stability_value = eval(this.diff_exp);
    if(stability_value < 0){ return 'stable' }
    else if(stability_value > 0){ return 'unstable' }
    else { return 'neutral' }
  })

  // if(this.K_array.indexOf(this.K.value) == -1){
  //   this.K_array.push(this.K.value); this.roots_array.push(this.roots); this.roots_stability_array.push(this.roots_stability);
  // }
}

/******************************************************************************/
/* Calculate trajectory of N */

LogisiticModel.prototype.trajectory = function(){
  this.N_list = []; this.t_list = [];
  // this.rungeKuttaMethod();
  this.numericjsMethod();
}

LogisiticModel.prototype.f = function(N, t){
  return this.r.value*N*(1-(N/this.K.value))
  // return this.exp_mathjs.eval({ N: N, r: this.r.value, K: this.K.value })
}

LogisiticModel.prototype.rungeKuttaMethod = function(){
  var h = this.h;
  var timeSpan = this.timeSpan;
  var N = null, t = null, k1 = null, k2 = null, k3 = null, k4 = null;

  this.t_list[0] = 0; this.N_list[0] = this.N0.value;
  for(var i = 0; i < timeSpan/h; i++){
    N = this.N_list[i]; t = this.t_list[i];
    k1 = this.f(N, t);
    k2 = this.f(N + 0.5*h*k1, t + 0.5*h);
    k3 = this.f(N + 0.5*h*k2, t + 0.5*h);
    k4 = this.f(N + h*k3, t + h);

    this.N_list[i+1] = this.N_list[i] + (1/6)*h*(k1 + 2*k2 + 2*k3 + k4);
    this.t_list[i+1] = this.t_list[i] + h;
  }
}

LogisiticModel.prototype.numericjsMethod = function(){
  var r = this.r.value;
  var K = this.K.value;
  var t0 = 0;
  var N0 = this.N0.value;
  var exp = this.exp;
  var timeSpan = this.timeSpan;
  var numeric_sol = numeric.dopri(t0, t0+timeSpan, N0, function(t, N){ return eval(exp) });
  this.N_list = numeric_sol.y;
  this.t_list = numeric_sol.x;
}

/******************************************************************************/

LogisiticModel.prototype.createSliders = function(){
  d3.select('#sliders_div_1').selectAll('.slider_g').remove();
  var model = this;

  this.slider_r = {};
  this.slider_r.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_r.input = this.slider_r.span.append('input').attrs(this.r).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.r.value = parseFloat(this.value); update();
  })
  this.slider_r.text = this.slider_r.span.append('span').attrs({ class: 'pl-2 text_align range-slider__value' });

  this.slider_K = {};
  this.slider_K.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_K.input = this.slider_K.span.append('input').attrs(this.K).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.K.value = parseFloat(this.value); update();
  })
  this.slider_K.text = this.slider_K.span.append('span').attrs({ class: 'pl-2 text_align range-slider__value' });

  this.slider_N0 = {};
  this.slider_N0.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_N0.input = this.slider_N0.span.append('input').attrs(this.N0).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.N0.value = parseFloat(this.value); update();
  })
  this.slider_N0.text = this.slider_N0.span.append('span').attrs({ class: 'pl-2 text_align range-slider__value' });
}

/******************************************************************************/

LogisiticModel.prototype.updateSliders = function(){
  this.slider_r.text.html('r = ' + this.r.value.toFixed(1));
  this.slider_K.text.html('K = ' + this.K.value.toFixed(1));
  this.slider_N0.text.html('N<sub>0</sub> = ' + this.N0.value.toFixed(1));
}

/******************************************************************************/

// LogisiticModel.prototype.createGraph = function(){
//   this.graph_1 = new phasePlot('chart_1');
//   this.graph_1.create('Population →', 'Rate of change in population →');
// }
//
// LogisiticModel.prototype.updateGraph = function(){
//   this.graph_1.update_path(this.N, this.dN_by_dt_list); // x_data, y_data
//   this.graph_1.update_roots(this.roots, this.roots_stability);
// }

/******************************************************************************/

// function phasePlot(div_id, roots_count){
//   this.margin = 25;
//   this.div_id = div_id;
//
//   this.create = function(x_label, y_label){
//     this.div = d3.select('#'+this.div_id);
//     this.width = parseInt( this.div.style('width') );
//     this.height = 0.75*this.width;
//     this.svg = this.div.append('svg').attrs({ width: this.width, height: this.height });
//
//     this.origin = this.svg.append('g');
//     this.x_axis = this.svg.append('g');
//     this.y_axis = this.svg.append('g');
//     this.path = this.svg.append('path').attrs({ class: 'blue_path' });
//
//     this.x_label = this.svg.append('text').text(x_label);
//     this.y_label = this.svg.append('text').text(y_label);
//
//     var limit_x_left = this.margin, limit_x_right = this.width - 2*this.margin;
//     var limit_y_top = this.margin, limit_y_bottom = this.height - 2*this.margin;
//     this.x_scale = d3.scaleLinear().range([limit_x_left, limit_x_right]);
//     this.y_scale = d3.scaleLinear().range([limit_y_bottom, limit_y_top]);
//   }
//
//   this.update_path = function(x_data, y_data){
//     this.x_data = x_data;
//     this.y_data = y_data;
//
//     this.x_scale.domain(d3.extent(this.x_data));
//     this.y_scale.domain(d3.extent(this.y_data));
//
//     this.origin.attrs({ transform: 'translate(' +this.x_scale(0)+ ',' +this.y_scale(0)+ ')' })
//
//     this.x_axis.attrs({ transform: 'translate(' +0+ ',' +this.y_scale(0)+ ')' }).call( d3.axisBottom(this.x_scale) );
//     this.y_axis.attrs({ transform: 'translate(' +this.x_scale(0)+ ',' +0+ ')' }).call( d3.axisLeft(this.y_scale) );
//     this.x_axis.select('.tick').styles({ 'display': 'none' });
//
//     this.path_data = this.x_data.map((d,i) => {
//       return { x: this.x_scale(this.x_data[i]), y: this.y_scale(this.y_data[i]) }
//     })
//     this.path.attrs({ d: line( this.path_data ) });
//   }
//
//   this.update_roots = function(roots, stability){
//     this.roots = [];
//     this.roots = roots.map((d,i) => { return { value: roots[i], stability: stability[i] } });
//     d3.selectAll('.roots').remove();
//     this.roots.forEach(d => {
//       d.node = this.svg.append('circle').attrs({ cx: this.x_scale(d.value), cy: this.y_scale(0), r: 3, class: 'roots' });
//       if(d.stability == 'stable'){ d.node.classed('stable', true); } else { d.node.classed('unstable', true); }
//     })
//   }
//
//   this.simulate_node = function(){
//
//   }
//
// }

/******************************************************************************/

// LogisiticModel.prototype.createGraph_1 = function(){
//   this.graph_1 = {};
//   var graph_1 = this.graph_1;
//   var margin = 25;
//
//   graph_1.div = d3.select('#chart_1');
//   graph_1.width = parseInt( graph_1.div.style('width') );
//   graph_1.height = 0.75*graph_1.width;
//   graph_1.svg = graph_1.div.append('svg').attrs({ width: graph_1.width, height: graph_1.height });
//
//   graph_1.origin = graph_1.svg.append('g');
//   graph_1.x_axis = graph_1.svg.append('g');
//   graph_1.y_axis = graph_1.svg.append('g');
//   graph_1.path = graph_1.svg.append('path').attrs({ class: 'blue_path' });
//
//   var limit_x_left = margin, limit_x_right = graph_1.width - 2*margin;
//   var limit_y_top = margin, limit_y_bottom = graph_1.height - 2*margin;
//   graph_1.x_scale = d3.scaleLinear().range([limit_x_left, limit_x_right]);
//   graph_1.y_scale = d3.scaleLinear().range([limit_y_bottom, limit_y_top]);
// }
//
// LogisiticModel.prototype.updateGraph_1 = function(){
//   var graph_1 = this.graph_1;
//   graph_1.x_data = this.N;
//   graph_1.x_scale.domain(d3.extent(graph_1.x_data));
//
//   graph_1.y_data = this.dN_by_dt_list;
//   graph_1.y_scale.domain(d3.extent(graph_1.y_data));
//
//   graph_1.origin.attrs({ transform: 'translate(' +graph_1.x_scale(0)+ ',' +graph_1.y_scale(0)+ ')' })
//
//   graph_1.x_axis.attrs({ transform: 'translate(' +0+ ',' +graph_1.y_scale(0)+ ')' }).call( d3.axisBottom(graph_1.x_scale) );
//   graph_1.y_axis.attrs({ transform: 'translate(' +graph_1.x_scale(0)+ ',' +0+ ')' }).call( d3.axisLeft(graph_1.y_scale) );
//   graph_1.x_axis.select('.tick').styles({ 'display': 'none' });
//
//   graph_1.path_data = graph_1.x_data.map((d,i) => {
//     return { x: graph_1.x_scale(graph_1.x_data[i]), y: graph_1.y_scale(graph_1.y_data[i]) }
//   })
//   graph_1.path.attrs({ d: line( graph_1.path_data ) });
// }

/******************************************************************************/

LogisiticModel.prototype.draw = function(){

  /* Chart 1 */
  var trace1 = { x: this.N, y: this.dN_by_dt_list, type: 'line', name: 'locus' };

  var trace2_stable = {
    x: this.roots_stability.map((d, i) => { if(d == 'stable'){ return this.roots[i] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'stable'){ return 0 } }),
    mode: 'markers', name: 'Stable Nodes'
  };

  var trace2_unstable = {
    x: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return this.roots[i] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return 0 } }),
    mode: 'markers', name: 'Unstable Nodes'
  };

  var r = this.r.value, K = this.K.value, N = this.N0.value;
  var trace3 = { x: [this.N0.value], y: [eval(this.exp)], mode: 'markers', name: 'Initial Population' };

  var data = [trace1, trace2_stable, trace2_unstable, trace3];
  // var layout = { title: 'Phase Plot', xaxis: { title: 'Population →' }, yaxis: { title: 'Rate of change of Population →', range: [-10, 10] } };
  var layout = { title: 'Phase Plot', xaxis: { title: 'Population →' }, yaxis: { title: 'Rate of change of Population →' } };
  Plotly.newPlot('chart_1', data, layout, { staticPlot: true });

  /* Chart 2 */
  var trace4 = { x: this.t_list, y: this.N_list, type: 'line', name: 'Trajectory' }
  var trace4_a = { x: [0], y: [this.N0.value], mode: 'markers', name: 'Initial Population' }
  var data = [trace4, trace4_a];
  var layout = { title: 'Trajectory plot', xaxis: { title: 'time →' }, yaxis: { title: 'Population →', range: [this.N0.min, this.N0.max], zeroline: false } };
  Plotly.newPlot('chart_2', data, layout, { staticPlot: true });

  /* Chart 3 */
  var trace5 = { x: this.K_array, y: this.roots_array[1].map(d => { return d }), type: 'line' }
  var trace6 = { x: this.K_array, y: this.roots_array[0].map(d => { return d }), type: 'line' }
  var data = [trace5, trace6];
  var layout = { title: 'Nodes plot', xaxis: { title: 'K →' }, yaxis: { title: 'Roots →' } };
  Plotly.newPlot('chart_3', data, layout, { staticPlot: true });

}

/******************************************************************************/
