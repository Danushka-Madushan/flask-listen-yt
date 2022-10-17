from flask import Flask, jsonify, request, render_template
from extentions import YouTube, Mongodb, Loader
import datetime
import json
import re

app = Flask(__name__)
userData = {}
db = Mongodb('env0ytuserdata')

@app.route('/', methods=['GET'])
def main():
	return render_template('index.html'), 200

@app.route('/listen/<uuid>', methods=['GET'])
def player(uuid):
	avl = db.search({'_id':uuid})
	if len(avl) != 0:
		serialized = re.sub(r'\\"', "'", json.dumps(avl, default=str))
		return render_template('player.html', _userdata=serialized), 200
	else:
		reason = 'This Playlist is no longer Exists' if len(uuid) == 36 else 'Access to this page is restricted'
		return render_template('403.html', reason=reason), 403

@app.route('/validate', methods=['POST'])
def ceckalive():
	avl = db.search({'_id':request.json['uuid']})
	if len(avl) != 0:
		return {"available":True, "dbid":avl['_id']}, 200
	else:
		return {"available":False}, 200

@app.route('/process', methods=['POST'])
def process():
	res = request.json
	userdata = [x for x in res['userdata'] if x is not None]
	uuid = res['uuid'].split('=')[1]
	avl = db.search({'_id':uuid})
	if len(avl) != 0:
		db.update({'_id':uuid}, {'data':userdata})
	else:
		db.insert({'_id':uuid, 'data': userdata, 'date':datetime.datetime.utcnow()})
	return {"status":"success", "dbid":uuid}, 200

@app.route('/get', methods=['POST'])
def playlist():
	res = request.json
	respdata = YouTube().extract(res['playlist'])
	if respdata:
		response = jsonify(respdata)
		response.headers.add('Access-Control-Allow-Origin', '*')
		return response, 200
	else:
		return {'status':'fail', 'reason':'invalid-url'}, 400

@app.route('/req', methods=['POST'])
def video():
	res = request.json
	respdata = Loader(res['baseurl']+res['id']).get()
	response = jsonify(respdata)
	response.headers.add('Access-Control-Allow-Origin', '*')
	return response, respdata['status']

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

''' # This two functions are for debugging peroposes
import os
global exiting
exiting = False
@app.route("/exec")
def exit_app():
    exiting = True
    return "Done"

@app.teardown_request
def teardown(exception):
    if exiting:os._exit(0)
'''

if __name__ == '__main__':
	app.run(debug=True)
