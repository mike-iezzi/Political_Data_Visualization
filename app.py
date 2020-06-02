from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from flask import jsonify
from datetime import datetime
import numpy as np
import math
import json



# encodes numpy data to json to serve to frontend
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)



app = Flask(__name__)

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/testdata')
def testdata():
    test = np.zeros((2,20))
    for i in range (0,20):
        test[0][i] = i
        test[1][i] = 0.125*i**3 - 80
    return json.dumps({'test': {'x': test[0], 
                                'y': test[1]}}, cls=NumpyEncoder)

@app.route('/test')
def test():
    return render_template('jsontest.html')
    
     

if __name__ == "__main__":
    app.run(debug=True)