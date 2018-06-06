/******************************************************************************/
/* Logisitc Model */

function ParabolaModel(){
  this.exp = 'x^2 + r';
  this.heading = 'Parabola Model';

  this.r = { min: -5, max: 1, step: 0.1, value: -1 };
  this.x0 = { min: -5, max: 5, step: 0.1, value: 2 };
  this.x = d3.range(this.x0.min, this.x0.max, this.x0.step);

  this.roots = null;
  this.roots_stability = null;

  this.r_array = [];
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

ParabolaModel.prototype.parse = function(){
  this.exp_mathjs = math.parse(this.exp);
  this.exp_numericjs = convert_to_numericjs_exp(this.exp);
  this.exp_nerdamer = nerdamer(this.exp);
  this.exp_latex = this.exp_mathjs.toTex();

  this.roots_exp = this.exp_nerdamer.solveFor('x');
  this.diff_exp_mathjs = math.derivative(this.exp, 'x');
  this.diff_exp = this.diff_exp_mathjs.toString();
  this.diff_exp_numericjs = convert_to_numericjs_exp(this.diff_exp);
}

/******************************************************************************/
/* Render the equation in Latex */

ParabolaModel.prototype.renderEquation = function(){
  d3.select('#equation_pane').html("\\("+ "\\dot{x}=" +this.exp_latex+ "\\)");
  d3.select('#heading').html(this.heading);
}

/******************************************************************************/
/* Find roots and it's dependence on K */

ParabolaModel.prototype.findAllRoots = function(){
  var r = d3.range(this.r.min, this.r.max, this.r.step);
  this.r_array = r;
  this.roots_array = this.roots_exp.map(d => {
    var numericjs_exp = convert_to_numericjs_exp(d.toString());
    return eval( numericjs_exp )
  });

  /* Making single number into array */
  this.roots_array = this.roots_array.map(d => {
    if(typeof(d) == 'number'){ return r.map(val => { return d }) }
    else return d
  })

  var stability_value_array = this.roots_array.map(d => {
    var x = d;
    return eval(this.diff_exp_numericjs)
  })

  this.roots_stability_array = stability_value_array.map(d => {
    return d.map(node => { if(node < 0){ return 'stable' } else if(node > 0){ return 'unstable' } else if(node == 0) { return 'neutral' } else { return 'none' } })
  })
}

/******************************************************************************/
/* Called when a user changes a parameter */

ParabolaModel.prototype.evaluate = function(){
  this.phasePlot();
  this.findRoots();
  this.trajectory();
}

/******************************************************************************/
/* Calculate the phase plot trajectory */

ParabolaModel.prototype.phasePlot = function(){
  var x = this.x;
  var r = this.r.value;
  this.dx_by_dt_list = eval(this.exp_numericjs);
}

/******************************************************************************/
/* Find roots and their stability */

ParabolaModel.prototype.findRoots = function(){
  var r = [this.r.value];

  this.roots = this.roots_exp.map(d => {
    var numericjs_exp = convert_to_numericjs_exp(d.toString());
    return eval( numericjs_exp )
  });


  this.roots_stability = this.roots.map(d => {
    var x = d;
    var stability_value = this.diff_exp_mathjs.eval({ r: r, x: x });
    if(stability_value < 0){ return 'stable' }
    else if(stability_value > 0){ return 'unstable' }
    else if(stability_value == 0){ return 'neutral' }
    else { return 'none' }
  })

}

/******************************************************************************/
/* Calculate trajectory of x */

ParabolaModel.prototype.trajectory = function(){
  this.x_list = []; this.t_list = [];
  this.rungeKuttaMethod();
  // this.numericjsMethod();
}

ParabolaModel.prototype.f = function(x, t){
  return Math.pow(x, 2) + this.r.value
  // return this.exp_mathjs.eval({ x: x, r: this.r.value, K: this.K.value })
}

ParabolaModel.prototype.rungeKuttaMethod = function(){
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

// ParabolaModel.prototype.numericjsMethod = function(){
//   var r = this.r.value;
//   var t0 = 0;
//   var x0 = this.x0.value;
//   var exp = this.exp;
//   var timeSpan = this.timeSpan;
//   var numeric_sol = numeric.dopri(t0, t0+timeSpan, x0, function(t, x){ return eval(exp) });
//   this.x_list = numeric_sol.y;
//   this.t_list = numeric_sol.x;
// }

/******************************************************************************/

ParabolaModel.prototype.createSliders = function(){
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

ParabolaModel.prototype.updateSliders = function(){
  this.slider_r.text.html('r = ' + this.r.value.toFixed(1));
  this.slider_x0.text.html('x<sub>0</sub> = ' + this.x0.value.toFixed(1));
}

/******************************************************************************/

ParabolaModel.prototype.draw = function(){

  /* Chart 1 */
  var trace1 = { x: this.x, y: this.dx_by_dt_list, type: 'line', name: 'locus' };

  var trace2_stable = {
    x: this.roots_stability.map((d, i) => { if(d == 'stable'){ return this.roots[i][0] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'stable'){ return 0 } }),
    mode: 'markers', name: 'Stable Nodes'
  };

  var trace2_unstable = {
    x: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return this.roots[i][0] } }),
    y: this.roots_stability.map((d, i) => { if(d == 'unstable'){ return 0 } }),
    mode: 'markers', name: 'Unstable Nodes'
  };

  var r = this.r.value, x = this.x0.value;
  var trace3 = { x: [this.x0.value], y: [this.exp_mathjs.eval({ x: x, r: r })], mode: 'markers', name: 'Initial Value' };

  var data = [trace1, trace2_stable, trace2_unstable, trace3];
  var layout = { title: 'Phase Plot', xaxis: { title: 'x →' }, yaxis: { title: 'dx/dt →' } };
  Plotly.newPlot('chart_1', data, layout, { staticPlot: true });

  /* Chart 2 */
  var trace4 = { x: this.t_list, y: this.x_list, type: 'line', name: 'Trajectory' }
  var trace4_a = { x: [0], y: [this.x0.value], mode: 'markers', name: 'Initial Value' }
  var data = [trace4, trace4_a];
  var layout = { title: 'Trajectory plot', xaxis: { title: 'time →' }, yaxis: { title: 'x →' } };
  Plotly.newPlot('chart_2', data, layout, { staticPlot: true });

  /* Chart 3 */
  var trace5 = { x: this.r_array, y: this.roots_array[1].map(d => { return d }), type: 'line', name: this.roots_stability_array[1][0] == 'stable' ? 'Stable Nodes': 'Unstable Nodes' };
  var trace6 = { x: this.r_array, y: this.roots_array[0].map(d => { return d }), type: 'line', name: this.roots_stability_array[0][0] == 'stable' ? 'Stable Nodes': 'Unstable Nodes' };
  var trace7 = { x: this.roots.map(d => { return this.r.value }), y: this.roots.map(d => { return d[0] }), mode: 'markers', name: 'Current Nodes' };
  var data = [trace5, trace6, trace7];
  var layout = { title: 'Nodes plot', xaxis: { title: 'r →' }, yaxis: { title: 'Roots →' } };
  Plotly.newPlot('chart_3', data, layout, { staticPlot: true });

}

/******************************************************************************/
