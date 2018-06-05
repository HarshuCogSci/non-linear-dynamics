/******************************************************************************/
// Logisitc Model

function LogisiticModel(){
  this.exp = 'r*N*(1-(N/K))';
  this.exp_latex = "\\( \\frac{dN}{dt} = r*N*(1- \\frac{N}{K} ) \\)";

  this.r = { min: 0.1, max: 5, step: 0.1, value: 1 };
  this.K = { min: 0.1, max: 5, step: 0.1, value: 1 };
  this.N0 = { min: 0, max: 6, step: 0.1, value: 1 };
  this.N = d3.range(this.N0.min, this.N0.max, this.N0.step);
  this.dN_by_dt = null;

  this.roots = null;
  this.roots_stability = null;

  this.K_array = [];
  this.roots_array = [];
  this.roots_stability_array = [];

  this.N_list = [];
  this.t_list = [];
  this.timeSpan = 20;
  this.h = 0.01;
}

/******************************************************************************/

LogisiticModel.prototype.createEquation = function(){
  d3.select('#equation_pane').html(this.exp_latex);
}

/******************************************************************************/

LogisiticModel.prototype.parse = function(){
  this.exp_mathjs = math.parse(this.exp);
  this.exp_numericjs = convert_to_numericjs_exp(this.exp);
  this.exp_nerdamer = nerdamer(this.exp);

  this.f = function(N, t){
    return this.r.value*N*(1-(N/this.K.value))
    // return this.exp_mathjs.eval({ N: N, r: this.r.value, K: this.K.value })
  };

  this.roots_exp = this.exp_nerdamer.solveFor('N');
  this.diff_exp = math.derivative(this.exp, 'N').toString();
}

/******************************************************************************/

LogisiticModel.prototype.evaluate = function(){
  var N = this.N;
  var r = this.r.value;
  var K = this.K.value;
  this.dN_by_dt = eval(this.exp_numericjs);

  this.roots = this.roots_exp.map(d => { return eval( d.toString() ) });
  this.roots_stability = this.roots.map(d => {
    var N = d;
    var stability_value = eval(this.diff_exp);
    if(stability_value < 0){ return 'stable' }
    else if(stability_value > 0){ return 'unstable' }
    else { return 'neutral' }
  })

  if(this.K_array.indexOf(this.K.value) == -1){
    this.K_array.push(this.K.value); this.roots_array.push(this.roots); this.roots_stability_array.push(this.roots_stability);
  }

  // 4th order Runge-Kutta Method
  var h = this.h;
  this.N_list = []; this.t_list = [];
  this.t_list[0] = 0; this.N_list[0] = this.N0.value;
  for(var i = 0; i < this.timeSpan/h; i++){
    N = this.N_list[i]; t = this.t_list[i];
    k1 = this.f(N, t);
    k2 = this.f(N + 0.5*h*k1, t + 0.5*h);
    k3 = this.f(N + 0.5*h*k2, t + 0.5*h);
    k4 = this.f(N + h*k3, t + h);

    this.N_list[i+1] = this.N_list[i] + (1/6)*h*(k1 + 2*k2 + 2*k3 + k4);
    this.t_list[i+1] = this.t_list[i] + h;
  }

  var N0 = this.N0.value;
  var exp = this.exp;
  var timeSpan = this.timeSpan;
  numeric_sol = numeric.dopri(0, timeSpan, N0, function(t, N){ return eval(exp) });
  // numeric_sol = numeric.dopri(0, 20, N0, function(t, N){ return r*N*(1-(N/K)) });
  // numeric_sol = numeric.dopri(0,10,[3,0],function (x,y) { return [y[1],-y[0]]; });
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
  this.slider_r.text = this.slider_r.span.append('span').attrs({ class: 'pl-2' });

  this.slider_K = {};
  this.slider_K.span = d3.select('#sliders_div_1').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_K.input = this.slider_K.span.append('input').attrs(this.K).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.K.value = parseFloat(this.value); update();
  })
  this.slider_K.text = this.slider_K.span.append('span').attrs({ class: 'pl-2' });

  this.slider_N0 = {};
  this.slider_N0.span = d3.select('#sliders_div_2').append('div').attrs({ 'class': 'slider_g py-1' });
  this.slider_N0.input = this.slider_N0.span.append('input').attrs(this.N0).attrs({ type: 'range', 'class': 'slider' }).on('input', function(){
    model.N0.value = parseFloat(this.value); update();
  })
  this.slider_N0.text = this.slider_N0.span.append('span').attrs({ class: 'pl-2' });
}

/******************************************************************************/

LogisiticModel.prototype.updateSliders = function(){
  this.slider_r.text.html('r = ' + this.r.value.toFixed(1));
  this.slider_K.text.html('K = ' + this.K.value.toFixed(1));
  this.slider_N0.text.html('N<sub>0</sub> = ' + this.N0.value.toFixed(1));
}

/******************************************************************************/

LogisiticModel.prototype.draw = function(){
  var trace1 = { x: this.N, y: this.dN_by_dt, type: 'line', name: 'locus' };

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

  var trace3 = {}

  var data = [trace1, trace2_stable, trace2_unstable];
  var layout = { xaxis: { title: 'N' }, yaxis: { title: 'dN/dt', range: [-10, 10] } };
  Plotly.newPlot('chart_1', data, layout);

  // var trace4 = { x: this.t_list, y: this.N_list, type: 'line' }
  // var data = [trace4];
  // var layout = { xaxis: { title: 't' }, yaxis: { title: 'N', range: [this.N0.min, this.N0.max], zeroline: false } };
  // Plotly.newPlot('chart_2', data, layout);

  var trace4 = { x: numeric_sol.x, y: numeric_sol.y, type: 'line' }
  var data = [trace4];
  var layout = { xaxis: { title: 'x' }, yaxis: { title: 'y', range: [this.N0.min, this.N0.max], zeroline: false } };
  Plotly.newPlot('chart_2', data, layout);

  // var trace4 = { x: numeric_sol.x, y: numeric_sol.y.map(d => { return d[0] }), type: 'line' }
  // var trace5 = { x: numeric_sol.x, y: numeric_sol.y.map(d => { return d[1] }), type: 'line' }
  // var data = [trace4, trace5];
  // var layout = { xaxis: { title: 'x' }, yaxis: { title: 'y' } };
  // Plotly.newPlot('chart_2', data, layout);
}

/******************************************************************************/
