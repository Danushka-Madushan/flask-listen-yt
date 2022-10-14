import requests
from requests.utils import unquote

class Loader():
	def __init__(self, link):
		self.headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42'}
		self.APIs = {'ytpp':'https://ytpp3.com/newp', 'ytmd':'https://api.youtubemultidownloader.com/video'}
		self.url = unquote(link)

	def ytpp(self):
		self.data = {'u': 'https://www.youtube.com/watch?v=%s' % self.url, 'c': 'US'}
		response = requests.post(self.APIs['ytpp'], headers=self.headers, data=self.data)
		resp = lambda data: {'status':200, 'service':'ytpp', 'data':{'type':'mp3', 'link':data}}
		if response.status_code == 200:
			respdata = response.json()
			if respdata['data']['mp3'] and respdata['data']['mp4'] != '':
				respdata['data']['mp3'] = 'https://ytpp3.com'+respdata['data']['mp3']
				return resp(respdata['data']['mp3'])
			else:
				return resp(respdata['data']['mp3_cdn'])
		else:
			return {'status':403, 'service':'ytpp'}

	def get(self):
		params = {'url': self.url}
		response = requests.get(self.APIs['ytmd'], params=params, headers=self.headers)
		if response.status_code == 200:
			response = response.json()
			data = [x for x in response['format'] if x['ext'] == 'm4a']
			m4a = [x['url'] for x in data if x['size'] == min([x['size'] for x in data])][0]
			if requests.head(m4a, allow_redirects=True).status_code == 200:
				return {'status':200, 'service':'ytmd', 'data':{'type':'m4a', 'link':m4a}}
			else:
				return self.ytpp()
