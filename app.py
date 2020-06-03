from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from flask import jsonify
import urllib.request
import numpy as np
import math
import json
import datetime 
from dateutil.rrule import rrule, DAILY



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

@app.route('/pollsdata')
def pollsdata():
    print("called:  " + datetime.datetime.now().isoformat())
    # read in raw json from fiveThirtyEight
    with urllib.request.urlopen("https://projects.fivethirtyeight.com/polls/polls.json") as url:
        raw = json.loads(url.read().decode())
    
    print("538 response:  " + datetime.datetime.now().isoformat())
    # create date indexed dict of all days between current date and Jan 1 2020 
    # also 14 include days before Jan 1 2020 because of the calculation methods

    a = datetime.date(2020, 1, 1) - datetime.timedelta(days=14)
    b = datetime.datetime.now().date()

    polls_by_date = {}
    for dt in rrule(DAILY, dtstart=a, until=b ):
        polls_by_date[dt.strftime("%Y-%m-%d")] = {}

    for i in range (0, len(raw)):
        # poll is of correct type
        if raw[i]['type'] == 'generic-ballot':
            # poll ended after our chosen day 0
            if datetime.datetime.strptime(raw[i]['endDate'], '%Y-%m-%d').date() >= a:
                polls_by_date[raw[i]['endDate']][raw[i]['id']] = {
                'source' : raw[i]['pollster'],
                'result_d' : float(raw[i]['answers'][0]['pct']) -  float(raw[i]['answers'][1]['pct'])}

    print("json sent:  " + datetime.datetime.now().isoformat())
    return jsonify(polls_by_date)



@app.route('/testdata')
def testdata():
    test = np.zeros((2,20))
    for i in range (0,20):
        test[0][i] = i
        test[1][i] = 0.125*i**3 - 80
    return json.dumps({'test': {'x': test[0], 
                                'y': test[1]}}, cls=NumpyEncoder, indent=4, sort_keys=True)

@app.route('/test')
def test():
    return render_template('jsontest.html')

@app.route('/graph')
def graph():
    return render_template('graphdemo.html')
    
     

if __name__ == "__main__":
    app.run(debug=True)