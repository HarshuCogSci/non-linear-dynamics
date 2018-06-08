/******************************************************************************/
/* Logisitc Model */

function PitchforkModel(){
  this.exp = {}; this.roots_exp = {}; this.diff_exp = {};
  this.exp.string = 'r*x - x^3';
  this.heading = 'Pitchfork-bifurcation Model';

  this.f = function(x, t){
    return this.r.value*x - Math.pow(x, 3)
  }

  this.r = { min: -5, max: 5, step: 0.1, value: -1 };
  this.x0 = { min: -5, max: 5, step: 0.1, value: 2 };
  this.x = d3.range(this.x0.min, this.x0.max, this.x0.step);

  this.roots = null;
  this.roots_stability = null;

  this.r_array = d3.range(this.r.min, this.r.max, this.r.step);
  this.roots_array = [];
  this.roots_stability_array = [];

  this.dx_by_dt_list = null;
  this.x_list = [];
  this.t_list = [];
  this.timeSpan = 10;
  this.h = 0.01;
}

/******************************************************************************/
/* Parsing the expression */

PitchforkModel.prototype.parse = function(){
  this.exp.mathjs = math.parse(this.exp.string);
  this.exp.numericjs = convert_to_numericjs_exp(this.exp.string);
  this.exp.nerdamer = nerdamer(this.exp.string);
  this.exp.latex = this.exp.mathjs.toTex();

  this.roots_exp.nerdamer = this.exp.nerdamer.solveFor('x');

  this.roots_exp.string = this.roots_exp.nerdamer.map(d => { return d.toString() })
  this.roots_exp.numericjs = this.roots_exp.string.map(d => { return convert_to_numericjs_exp(d) })
  this.roots_exp.mathjs = this.roots_exp.string.map(d => { return math.parse(d) })

  this.diff_exp.mathjs = math.derivative(this.exp.string, 'x');
  this.diff_exp.string = this.diff_exp.mathjs.toString();
  this.diff_exp.numericjs = convert_to_numericjs_exp(this.diff_exp.string);
  this.diff_exp.nerdamer = nerdamer(this.diff_exp.string);
}

/******************************************************************************/
/* Render the equation in Latex */

PitchforkModel.prototype.renderEquation = function(){
  d3.select('#equation_pane').html("\\("+ "\\dot{x}=" +this.exp.latex+ "\\)");
  d3.select('#heading').html(this.heading);
}

/******************************************************************************/
/* Find roots and it's dependence on K */

PitchforkModel.prototype.findAllRoots = function(){

  this.roots_array = this.roots_exp.mathjs.map(exp => {
    return this.r_array.map(r => { return exp.eval({ r: r }) })
  })

  /* Rounding off very small numbers */
  this.roots_array = this.roots_array.map(row => {
    return row.map(d => { return round(d) })
  })

  /* Making single number into array */
  this.roots_array = this.roots_array.map(d => {
    if(typeof(d) == 'number'){ return r.map(val => { return d }) }
    else return d
  })

  var stability_value_array = this.roots_array.map(column => {
    return column.map((x,i) => { return this.diff_exp.mathjs.eval({ x: x, r: this.r_array[i] }) })
  })

  /* Rounding off very small numbers */
  stability_value_array = stability_value_array.map(row => {
    return row.map(d => { return round(d) })
  })

  this.roots_stability_array = stability_value_array.map(d => {
    return d.map(node => { return stability(node) })
  })

}

/******************************************************************************/
/* Called when a user changes a parameter */

PitchforkModel.prototype.evaluate = function(){
  this.phasePlot();
  this.findRoots();
  this.trajectory();
}

/******************************************************************************/
/* Calculate the phase plot trajectory */

PitchforkModel.prototype.phasePlot = function(){
  var x = this.x;
  var r = this.r.value;
  this.dx_by_dt_list = eval(this.exp.numericjs);
}

/******************************************************************************/
/* Find roots and their stability */

PitchforkModel.prototype.findRoots = function(){
  var r = this.r.value;
  this.roots = this.roots_exp.mathjs.map(d => { return d.eval({ r: r }) })

  /* Rounding off very small numbers */
  this.roots = this.roots.map(d => { return round(d) })

  var roots_stability_value = this.roots.map(root => {
    return this.diff_exp.mathjs.eval({ x: root, r: this.r.value })
  })

  /* Rounding off very small numbers */
  roots_stability_value = roots_stability_value.map(d => { return round(d) })

  this.roots_stability = roots_stability_value.map(d => { return stability(d) })

}

/******************************************************************************/
/* Calculate trajectory of x */

PitchforkModel.prototype.trajectory = function(){
  this.x_list = []; this.t_list = [];
  this.rungeKuttaMethod();
}

PitchforkModel.prototype.rungeKuttaMethod = function(){
  var h = this.h;
  var timeSpan = this.timeSpan;
  var x = null, t = null, k1 = null, k2 = null, k3 = null, k4 = null;

  this.t_list[0] = 0; this.x_list[0] = this.x0.value;
  for(var i = 0; i < timeSpan/h; i++){
    x = this.x_list[i]; t = this.t_list[i];
    k1 = this.f(x, t);
    k2 = this.f(x + 0.5*h*k1, t + 0.5*h);
    k3 = this.f(x + 0.5*h*k2, t + 0.5*h);
    k4 = this.f(x + h*k3, t + h);

    this.x_list[i+1] = this.x_list[i] + (1/6)*h*(k1 + 2*k2 + 2*k3 + k4);
    this.t_list[i+1] = this.t_list[i] + h;
  }
}

/******************************************************************************/

PitchforkModel.prototype.createSliders = function(){
  d3.select('#sliders_div_1').selectAll('.slider_g').remove();
  var model = this;

  this.slider_r = {};
  this.slider_r.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_r.input = this.slider_r.span.append('input').attrs(this.r).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.r.value = parseFloat(this.value); update();
  })
  this.slider_r.text = this.slider_r.span.append('span').attrs({ class: 'pl-2 text_align range-slider__value' });

  this.slider_x0 = {};
  this.slider_x0.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_x0.input = this.slider_x0.span.append('input').attrs(this.x0).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.x0.value = parseFloat(this.value); update();
  })
  this.slider_x0.text = this.slider_x0.span.append('span').attrs({ class: 'pl-2 text_align range-slider__value' });
}

/******************************************************************************/

PitchforkModel.prototype.updateSliders = function(){
  this.slider_r.text.html('r = ' + this.r.value.toFixed(1));
  this.slider_x0.text.html('x<sub>0</sub> = ' + this.x0.value.toFixed(1));
}

/******************************************************************************/

// var colors = ['#DB4052', '#FF7F0E', '#1F77B4', '#2CA02C'];
var colors = { velocity_locus: '#FF7F0E', trajectory: '#1F77B4', stable: '#2CA02C', unstable: '#DB4052' }

PitchforkModel.prototype.createGraph = function(){

  /****************************************************************************/
  /* Chart 1 */

  var locus = {
    x: this.x,
    y: [],
    mode: 'lines', name: 'locus',
    line: { color: colors.velocity_locus }
  };

  var roots_stable = {
    x: [],
    y: [],
    mode: 'markers', name: 'Stable',
    marker: { color: colors.stable }
  };

  var roots_unstable = {
    x: [],
    y: [],
    mode: 'markers', name: 'Unstable',
    marker: { color: colors.unstable },
  };

  var initial_point = {
    x: [],
    y: [],
    mode: 'markers', name: 'Initial Value',
    marker: { color: colors.trajectory, size: 10 }
  };

  var data = [locus, roots_stable, roots_unstable, initial_point];
  var layout = { title: 'Phase Plot', xaxis: { title: 'x →' }, yaxis: { title: 'dx/dt →' } };
  Plotly.newPlot('chart_1', data, layout, { staticPlot: true });

  /****************************************************************************/
  /* Chart 2 */

  var trace4 = {
    x: [],
    y: [],
    mode: 'lines', name: 'Trajectory',
    line: { color: colors.trajectory }
  }

  var trace4_a = {
    x: [],
    y: [],
    mode: 'markers', name: 'Initial Value',
    marker: { color: colors.trajectory }
  }

  var data = [trace4, trace4_a];
  var layout = { title: 'Trajectory', xaxis: { title: 't →' }, yaxis: { title: 'x →' } };
  Plotly.newPlot('chart_2', data, layout, { staticPlot: true });

  /****************************************************************************/
  /* Chart 3 */

  this.num_roots = this.roots.length;

  var stable_roots_locus = this.roots_array.map((row,i) => {
    return row.map((root,j) => {
      if(this.roots_stability_array[i][j] == 'stable' && typeof(root) == 'number'){ return root } else { return null }
    })
  })

  var unstable_roots_locus = this.roots_array.map((row,i) => {
    return row.map((root,j) => {
      if(this.roots_stability_array[i][j] == 'unstable' && typeof(root) == 'number'){ return root } else { return null }
    })
  })

  var stable_traces = stable_roots_locus.map(locus => {
    return { x: this.r_array, y: locus, mode: 'lines', name: 'Stable', line: { dash: 'solid', color: colors.stable } }
  })

  var unstable_traces = unstable_roots_locus.map(locus => {
    return { x: this.r_array, y: locus, mode: 'lines', name: 'Unstable', line: { dash: 'dot', color: colors.unstable } }
  })

  var traces = [];
  stable_traces.forEach(d => { traces.push(d) });
  unstable_traces.forEach(d => { traces.push(d) });

  var current_stable_nodes = {
    x: [],
    y: [],
    mode: 'markers', name: 'Stable',
    marker: { color: colors.stable }
  };

  var current_unstable_nodes = {
    x: [],
    y: [],
    mode: 'markers', name: 'Unstable',
    marker: { color: colors.unstable }
  };

  traces.push(current_stable_nodes, current_unstable_nodes);

  var layout = { title: 'Nodes', xaxis: { title: 'r →', zeroline: true }, yaxis: { title: 'Roots →', zeroline: false } };
  Plotly.newPlot('chart_3', traces, layout, { staticPlot: true });

}

/******************************************************************************/

PitchforkModel.prototype.updateGraph = function(){

  /****************************************************************************/
  // Phase plot

  var chart_1 = document.getElementById('chart_1').data;
  chart_1[0].y = this.dx_by_dt_list;

  // Stable nodes
  chart_1[1].x = this.roots_stability.map((d, i) => { if(d == 'stable'){ return this.roots[i] } });
  chart_1[1].y = this.roots_stability.map((d, i) => { if(d == 'stable'){ return 0 } });

  // Unstable Nodes
  chart_1[2].x = this.roots_stability.map((d, i) => { if(d == 'unstable'){ return this.roots[i] } });
  chart_1[2].y = this.roots_stability.map((d, i) => { if(d == 'unstable'){ return 0 } });

  // Initial Point
  var r = this.r.value, x = this.x0.value;
  chart_1[3].x = [this.x0.value];
  chart_1[3].y = [this.exp.mathjs.eval({ x: x, r: r })];

  Plotly.redraw('chart_1');

  /****************************************************************************/
  // Trajectory plot

  var chart_2 = document.getElementById('chart_2').data;

  chart_2[0].x = this.t_list;
  chart_2[0].y = this.x_list;

  chart_2[1].x = [0];
  chart_2[1].y = [this.x0.value];

  Plotly.redraw('chart_2');

  /****************************************************************************/
  // Roots plot

  var chart_3 = document.getElementById('chart_3').data;
  var index = 2*this.num_roots;

  chart_3[index].x = this.roots_stability.map((d,i) => { if(d == 'stable'){ return this.r.value } });
  chart_3[index].y = this.roots_stability.map((d,i) => { if(d == 'stable'){ return this.roots[i] } });

  chart_3[index+1].x = this.roots_stability.map((d,i) => { if(d == 'unstable'){ return this.r.value } });
  chart_3[index+1].y = this.roots_stability.map((d,i) => { if(d == 'unstable'){ return this.roots[i] } });

  Plotly.redraw('chart_3');

}
