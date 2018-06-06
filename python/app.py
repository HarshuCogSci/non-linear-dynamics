import sympy
from sympy import *
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint
from mpmath import *

t = sympy.symbols('t')
r = sympy.symbols('r')
x = sympy.Function('x')

r_val = 2
t_arr = np.arange(0,10,0.1)
x_arr = np.arange(0,10,0.1)

##################################################################
# Solving x' = x

exp = Pow(x(t), 2) - r
exp_r_substituted = exp.subs([ (r, r_val) ]);

# Calculating data for phase plot
exp_lambd = sympy.lambdify(x(t), exp_r_substituted, "numpy")
dxdt_array = exp_lambd(x_arr)
# plt.plot(dxdt_array, x_arr)

# Finding the roots
roots = sympy.solve([ exp_r_substituted ], x(t))
roots_val = roots[x(t)]

# Finding the stability of roots
diff = exp.diff(x(t))
stability = diff.subs([ (x(t), roots_val) ])

# Solving the differential Equation to calculate the trajectory using sympy
sol = sympy.dsolve(x(t).diff(t) - exp, x(t))
if( type(sol) != list ):
    sol_rhs = sol.rhs
    consts = sympy.solve([ sol_rhs.subs(t, 0) - 3 ], sympy.symbols('C1'))
    sol_final = sol_rhs.subs(consts)

sol_r_substituted = sol_final.subs([ (r, r_val) ])
sol_lambd = sympy.lambdify(t, sol_r_substituted, "numpy")
x_arr = sol_lambd(t_arr)
# plt.plot(x_arr, t_arr)

# Solving the differential Equation to calculate the trajectory using sympy and scipy
def model(x, t):
    print(x,t)
    # return x - r_val
    return exp_lambd(x)

x0 = 2
t_arr = np.arange(0,10, 0.1)
x_arr = odeint(model, x0, t_arr)

plt.plot(t_arr, x_arr)
