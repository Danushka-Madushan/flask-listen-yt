from pymongo import MongoClient
import base64

class Mongodb:
	def __init__(self, user):
		cluster = base64.b64decode('eXQwY2x1c3Rlcg=='.encode('ASCII')).decode('ascii')
		auth = base64.b64decode('RFBETWFkdXNoYW4xMjMu'.encode('ASCII')).decode('ascii')
		cluster = MongoClient(f'mongodb+srv://{user}:{auth}@{cluster}.la24r61.mongodb.net/?retryWrites=true&w=majority')
		db = cluster.userdata
		self.uuid = db['uuid']

	def insert(self, data):
		self.uuid.create_index("date", expireAfterSeconds=2629746)
		self.uuid.insert_one(data)

	def update(self, _id, data):
		self.uuid.update_one(_id, {"$set":data})

	def search(self, querry):
		rtn = self.uuid.find(querry)
		udb = {}
		for each in rtn:udb = {**udb, **each}
		return udb
