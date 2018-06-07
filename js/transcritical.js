/******************************************************************************/
/* Logisitc Model */

function TranscriticalModel(){
  this.exp = {}; this.roots_exp = {}; this.diff_exp = {};
  this.exp.string = 'r*x - x^2';
  this.heading = 'Transcritical-bifurcation Model';

  this.f = function(x, t){
    return this.r.value*x - Math.pow(x, 2)
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

TranscriticalModel.prototype.parse = function(){
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

TranscriticalModel.prototype.renderEquation = function(){
  d3.select('#equation_pane').html("\\("+ "\\dot{x}=" +this.exp.latex+ "\\)");
  d3.select('#heading').html(this.heading);
}

/******************************************************************************/
/* Find roots and it's dependence on K */

TranscriticalModel.prototype.findAllRoots = function(){
  var r = this.r_array;
  this.roots_array = this.roots_exp.numericjs.map(d => { return eval(d) });

  /* Making single number into array */
  this.roots_array = this.roots_array.map(d => {
    if(typeof(d) == 'number'){ return r.map(val => { return d }) }
    else return d
  })

  var stability_value_array = this.roots_array.map(d => {
    var x = d;
    return eval(this.diff_exp.numericjs)
  })

  this.roots_stability_array = stability_value_array.map(d => {
    return d.map(node => {
      if(node < 0){ return 'stable' } else if(node > 0){ return 'unstable' } else if(node == 0) { return 'neutral' } else { return 'none' }
    })
  })
}

/******************************************************************************/
/* Called when a user changes a parameter */

TranscriticalModel.prototype.evaluate = function(){
  this.phasePlot();
  this.findRoots();
  this.trajectory();
}

/******************************************************************************/
/* Calculate the phase plot trajectory */

TranscriticalModel.prototype.phasePlot = function(){
  var x = this.x;
  var r = this.r.value;
  this.dx_by_dt_list = eval(this.exp.numericjs);
}

/******************************************************************************/
/* Find roots and their stability */

TranscriticalModel.prototype.findRoots = function(){
  var r = this.r.value;
  this.roots = this.roots_exp.mathjs.map(d => { return d.eval({ r: r }) })

  this.roots_stability = this.roots.map(d => {
    var x = d;
    var stability_value = this.diff_exp.mathjs.eval({ r: r, x: x });
    if(stability_value < 0){ return 'stable' }
    else if(stability_value > 0){ return 'unstable' }
    else if(stability_value == 0){ return 'neutral' }
    else { return 'none' }
  })

}

/******************************************************************************/
/* Calculate trajectory of x */

TranscriticalModel.prototype.trajectory = function(){
  this.x_list = []; this.t_list = [];
  this.rungeKuttaMethod();
}

TranscriticalModel.prototype.rungeKuttaMethod = function(){
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

TranscriticalModel.prototype.createSliders = function(){
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

TranscriticalModel.prototype.updateSliders = function(){
  this.slider_r.text.html('r = ' + this.r.value.toFixed(1));
  this.slider_x0.text.html('x<sub>0</sub> = ' + this.x0.value.toFixed(1));
}

/******************************************************************************/

// var colors = ['#DB4052', '#2CA02C', '#1F77B4', '#FF7F0E'];
var colors = ['#DB4052', '#FF7F0E', '#1F77B4', '#2CA02C'];

TranscriticalModel.prototype.draw = function(){

  /****************************************************************************/
  /* Chart 1 */
  var locus = {
    x: this.x,
    y: this.dx_by_dt_list,
    mode: 'lines', name: 'locus',
    line: { color: colors[1] }
  };

  var roots_stable = {
    x: this.roots_stability.map((d, i) => { if(d == 'stable'){ return this.roots[i] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'stable'){ return 0 } }),
    mode: 'markers', name: 'Stable',
    marker: { color: colors[3] }
  };

  var roots_unstable = {
    x: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return this.roots[i] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return 0 } }),
    mode: 'markers', name: 'Unstable',
    marker: { color: colors[0] },
  };

  var r = this.r.value, x = this.x0.value;
  var initial_point = {
    x: [this.x0.value],
    y: [this.exp.mathjs.eval({ x: x, r: r })],
    mode: 'markers', name: 'Initial Value',
    marker: { color: colors[2] }
  };

  var data = [locus, roots_stable, roots_unstable, initial_point];
  // var layout = { title: '$Phase Plot$', xaxis: { title: '$x →$' }, yaxis: { title: '$\\dot{x} →$' } };
  var layout = { title: 'Phase Plot', xaxis: { title: 'x →' }, yaxis: { title: 'dx/dt →' } };
  Plotly.newPlot('chart_1', data, layout, { staticPlot: true });

  /****************************************************************************/
  /* Chart 2 */
  var trace4 = {
    x: this.t_list,
    y: this.x_list,
    mode: 'lines', name: 'Trajectory',
    line: { color: colors[2] }
  }

  var trace4_a = {
    x: [0],
    y: [this.x0.value],
    mode: 'markers', name: 'Initial Value',
    marker: { color: colors[2] }
  }

  var data = [trace4, trace4_a];
  var layout = { title: 'Trajectory', xaxis: { title: 't →' }, yaxis: { title: 'x →' } };
  Plotly.newPlot('chart_2', data, layout, { staticPlot: true });

  /****************************************************************************/
  /* Chart 3 */
  var stable_roots = {
    x: this.r_array,
    y: this.roots_array[1].map(d => { return d }),
    mode: 'lines', name: this.roots_stability_array[1][0] == 'stable' ? 'Stable': 'Unstable',
    line: { dash: 'solid', color: colors[3] }
  };

  var unstable_roots = {
    x: this.r_array,
    y: this.roots_array[0].map(d => { return d }),
    mode: 'lines', name: this.roots_stability_array[0][0] == 'stable' ? 'Stable': 'Unstable',
    line: { dash: 'dot', color: colors[0] }
  };

  var current_stable_nodes = {
    x: this.roots_stability.map((d,i) => { if(d == 'stable'){ return this.r.value } }),
    y: this.roots_stability.map((d,i) => { if(d == 'stable'){ return this.roots[i] } }),
    mode: 'markers', name: 'Stable',
    marker: { color: colors[3] }
  };

  var current_unstable_nodes = {
    x: this.roots_stability.map((d,i) => { if(d == 'unstable'){ return this.r.value } }),
    y: this.roots_stability.map((d,i) => { if(d == 'unstable'){ return this.roots[i] } }),
    mode: 'markers', name: 'Unstable',
    marker: { color: colors[0] }
  };

  var data = [stable_roots, unstable_roots, current_stable_nodes, current_unstable_nodes];
  var layout = { title: 'Nodes', xaxis: { title: 'r →', zeroline: true }, yaxis: { title: 'Roots →', zeroline: false } };
  Plotly.newPlot('chart_3', data, layout, { staticPlot: true });

}

/******************************************************************************/
